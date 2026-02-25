import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  Users,
  Trophy,
  Target,
  FileText,
  Trash2,
  Shield,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  UserMinus,
  Eraser,
  FlaskConical,
  KeyRound,
  Pencil,
  Download,
  Search,
  Lock,
  Medal,
} from 'lucide-react';
import { runDataSimulation } from '@/lib/simulateData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { isFirebaseManuallyDisabled, enableFirebaseAndReload } from '@/lib/firebase';
import { usePoolsContext } from '@/context/PoolsContext';
import { useMatchesContext } from '@/context/MatchesContext';
import { toast } from 'sonner';
import type { User, Pool } from '@/types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeleteTarget = { type: 'user' | 'pool' | 'prediction' | 'clear'; id?: string; name: string };

const ALL_STORAGE_KEYS = [
  'bolao_users',
  'bolao_user',
  'bolao_pools',
  'bolao_predictions',
  'bolao_match_results',
  'bolao_matches',
];

export const AdminModal = ({ isOpen, onClose }: AdminModalProps) => {
  const { user, getAllUsers, adminDeleteUser, adminUpdateUser, adminSetPassword, logout, useFirebase, resetPassword } = useAuth();
  const {
    pools,
    matchResults,
    adminDeletePool,
    adminUpdatePool,
    adminUpdateMemberUser,
    adminDeleteUserData,
    adminRemoveUserFromPool,
    adminDeletePrediction,
    adminGetAllPredictions,
    getGlobalLeaderboard,
    setMatchResult,
    syncResultsFromApi,
    getMatchResult,
  } = usePoolsContext();
  const { getMatchesByRound, getCurrentRound, getMatchById, refreshMatches } = useMatchesContext();

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchUsers, setSearchUsers] = useState('');
  const [searchPools, setSearchPools] = useState('');
  const [searchPredictions, setSearchPredictions] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [settingPasswordFor, setSettingPasswordFor] = useState<{ user: User; password: string } | null>(null);

  const refreshUsers = useCallback(() => {
    const result = getAllUsers();
    if (Array.isArray(result)) {
      setAllUsers(result);
    } else {
      (result as Promise<User[]>).then(setAllUsers).catch(() => setAllUsers([]));
    }
  }, [getAllUsers]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers, isOpen]);

  if (!user) return null;
  const allPredictions = adminGetAllPredictions();

  const stats = {
    users: allUsers.length,
    pools: pools.length,
    predictions: allPredictions.length,
    matchResults: Object.keys(matchResults).length,
  };

  const handleDeleteUser = (u: User) => {
    setDeleteTarget({ type: 'user', id: u.id, name: u.name });
  };

  const handleDeletePool = (p: Pool) => {
    setDeleteTarget({ type: 'pool', id: p.id, name: p.name });
  };

  const handleDeletePrediction = (pred: { id: string; homeScore: number; awayScore: number }) => {
    setDeleteTarget({ type: 'prediction', id: pred.id, name: `Palpite ${pred.homeScore}x${pred.awayScore}` });
  };

  const [resettingEmail, setResettingEmail] = useState<string | null>(null);

  const handleSendPasswordReset = async (email: string) => {
    setResettingEmail(email);
    const result = await resetPassword(email);
    setResettingEmail(null);
    if (result === 'email_sent') {
      toast.success('Email enviado!', { description: `Link de redefinição enviado para ${email}` });
    } else {
      toast.error('Falha ao enviar', { description: 'Email não encontrado ou erro ao enviar.' });
    }
  };

  const handleRemoveFromPool = (poolId: string, userId: string, userName: string) => {
    const ok = adminRemoveUserFromPool(poolId, userId);
    if (ok) toast.success(`${userName} removido do bolão.`);
    else toast.error('Não foi possível remover.');
  };

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      users: allUsers,
      pools,
      predictions: allPredictions,
      matchResults,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bolao-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados!');
  };

  const handleSaveUserEdit = (u: User, updates: { name?: string }) => {
    const ok = adminUpdateUser(u.id, updates);
    if (ok) {
      adminUpdateMemberUser(u.id, updates);
      toast.success('Usuário atualizado!');
      setEditingUser(null);
    } else toast.error('Não foi possível atualizar.');
  };

  const handleSavePoolEdit = (p: Pool, updates: { name?: string; description?: string; code?: string }) => {
    const ok = adminUpdatePool(p.id, updates);
    if (ok) {
      toast.success('Bolão atualizado!');
      setEditingPool(null);
    } else toast.error('Não foi possível atualizar.');
  };

  const handleSetPassword = async () => {
    if (!settingPasswordFor || settingPasswordFor.password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    const ok = await adminSetPassword(settingPasswordFor.user.id, settingPasswordFor.password);
    if (ok) {
      toast.success(`Senha de ${settingPasswordFor.user.name} alterada.`);
      setSettingPasswordFor(null);
    } else toast.error('Não foi possível alterar a senha (modo Firebase).');
  };

  const filterUsers = allUsers.filter(
    (u) =>
      !searchUsers ||
      u.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUsers.toLowerCase())
  );
  const filterPools = pools.filter(
    (p) => !searchPools || p.name.toLowerCase().includes(searchPools.toLowerCase()) || (p.code?.toLowerCase().includes(searchPools.toLowerCase()) ?? false)
  );
  const filterPredictions = allPredictions.filter((pred) => {
    if (!searchPredictions) return true;
    const match = getMatchById(pred.matchId);
    const pool = pools.find((p) => p.id === pred.poolId);
    const predUser = allUsers.find((u) => u.id === pred.userId);
    const search = searchPredictions.toLowerCase();
    return (
      (match && `${match.homeTeam.name} ${match.awayTeam.name}`.toLowerCase().includes(search)) ||
      (pool?.name.toLowerCase().includes(search)) ||
      (predUser?.name.toLowerCase().includes(search) || predUser?.email.toLowerCase().includes(search))
    );
  });
  const globalLeaderboard = getGlobalLeaderboard(20);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'user' && deleteTarget.id) {
      adminDeleteUserData(deleteTarget.id);
      adminDeleteUser(deleteTarget.id);
      toast.success('Usuário excluído', { description: `${deleteTarget.name} foi removido do sistema.` });
    } else if (deleteTarget.type === 'pool' && deleteTarget.id) {
      adminDeletePool(deleteTarget.id);
      toast.success('Bolão excluído', { description: `"${deleteTarget.name}" foi removido.` });
    } else if (deleteTarget.type === 'prediction' && deleteTarget.id) {
      adminDeletePrediction(deleteTarget.id);
      toast.success('Palpite excluído.');
    } else if (deleteTarget.type === 'clear') {
      logout();
      for (const key of ALL_STORAGE_KEYS) {
        localStorage.removeItem(key);
      }
      toast.success(
        useFirebase
          ? 'Dados locais e sessão limpos. Usuários do Firebase permanecem no servidor — exclua pelo Console se necessário.'
          : 'Todos os dados foram apagados.'
      );
      window.location.reload();
    }
    setDeleteTarget(null);
    if (deleteTarget.type !== 'clear') onClose();
  };

  const handleSyncResults = async () => {
    setIsSyncing(true);
    try {
      const { count } = await syncResultsFromApi();
      toast.success(count > 0 ? `${count} resultado(s) atualizado(s)!` : 'Nenhum resultado novo.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha ao sincronizar.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearMatchCache = () => {
    refreshMatches();
    toast.success('Cache de jogos atualizado.');
  };

  const handleSimulateData = async () => {
    setIsSimulating(true);
    try {
      const res = await runDataSimulation();
      const parts: string[] = [];
      if (res.usersCreated > 0) parts.push(`${res.usersCreated} usuário(s)`);
      if (res.poolsCreated > 0) parts.push(`${res.poolsCreated} bolão(ões)`);
      if (res.predictionsCreated > 0) parts.push(`${res.predictionsCreated} palpite(s)`);
      if (res.resultsSet > 0) parts.push(`${res.resultsSet} resultado(s)`);
      toast.success(
        parts.length > 0
          ? `Simulação concluída: ${parts.join(', ')}. Página será recarregada.`
          : 'Nenhum dado novo (provavelmente já existe).'
      );
      if (res.simulatedUserEmails.length > 0) {
        toast.info(`Usuários: senha "123456" para ${res.simulatedUserEmails.join(', ')}`);
      }
      if (res.usersCreated > 0 || res.poolsCreated > 0 || res.predictionsCreated > 0 || res.resultsSet > 0) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro na simulação.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Painel Administrativo</DialogTitle>
              <p className="text-sm text-gray-500">Gerencie usuários, bolões, resultados e palpites</p>
            </div>
          </div>
        </DialogHeader>

        {!useFirebase && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Modo local — dados só neste navegador</p>
              <p className="text-sm text-amber-800 mt-1">
                Em outro navegador ou dispositivo os dados não aparecem. Configure as variáveis de ambiente do Firebase na Vercel (veja DEPLOY.md).
              </p>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ranking">
              <Medal className="w-4 h-4 mr-2" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Usuários ({stats.users})
            </TabsTrigger>
            <TabsTrigger value="pools">
              <Trophy className="w-4 h-4 mr-2" />
              Bolões ({stats.pools})
            </TabsTrigger>
            <TabsTrigger value="results">
              <Target className="w-4 h-4 mr-2" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="predictions">
              <FileText className="w-4 h-4 mr-2" />
              Palpites ({stats.predictions})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-900">{stats.users}</div>
                <div className="text-sm text-blue-600">Usuários cadastrados</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <Trophy className="w-8 h-8 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-900">{stats.pools}</div>
                <div className="text-sm text-green-600">Bolões criados</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <FileText className="w-8 h-8 text-orange-600 mb-2" />
                <div className="text-2xl font-bold text-orange-900">{stats.predictions}</div>
                <div className="text-sm text-orange-600">Palpites registrados</div>
              </div>
              <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                <Target className="w-8 h-8 text-violet-600 mb-2" />
                <div className="text-2xl font-bold text-violet-900">{stats.matchResults}</div>
                <div className="text-sm text-violet-600">Resultados de jogos</div>
              </div>
            </div>
            {isFirebaseManuallyDisabled() && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-blue-800">Modo local ativo</div>
                    <div className="text-sm text-blue-600">Firebase foi desativado. Clique para reativar.</div>
                  </div>
                  <Button variant="outline" className="border-blue-500 text-blue-700" onClick={enableFirebaseAndReload}>
                    Reativar Firebase
                  </Button>
                </div>
              </div>
            )}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-emerald-800">Exportar dados</div>
                  <div className="text-sm text-emerald-600">Baixa um arquivo JSON com usuários, bolões, palpites e resultados.</div>
                </div>
                <Button
                  variant="outline"
                  className="border-emerald-500 text-emerald-700 hover:bg-emerald-100"
                  onClick={handleExportData}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar JSON
                </Button>
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-amber-800">Simular dados de teste</div>
                  <div className="text-sm text-amber-600">Cria usuários, bolões, palpites e resultados para testar ranking, cards e fluxos.</div>
                </div>
                <Button
                  variant="outline"
                  className="border-amber-500 text-amber-700 hover:bg-amber-100"
                  onClick={handleSimulateData}
                  disabled={isSimulating}
                >
                  <FlaskConical className={`w-4 h-4 mr-2 ${isSimulating ? 'animate-pulse' : ''}`} />
                  {isSimulating ? 'Simulando…' : 'Simular dados'}
                </Button>
              </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-red-800">Limpar todos os dados (reset completo)</div>
                  <div className="text-sm text-red-600">
                    Faz logout, remove cache local (usuários, bolões, palpites, resultados) e recarrega. Resolve conflitos entre localStorage e Firebase.
                    {useFirebase && ' Emails no Firebase Auth permanecem — exclua pelo Console se precisar.'}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteTarget({ type: 'clear', name: 'TODOS OS DADOS' })}
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Limpar tudo
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ranking" className="mt-4">
            <p className="text-sm text-gray-500 mb-4">Ranking global agregado (todos os bolões). Top 20.</p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {globalLeaderboard.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">Nenhum dado de ranking ainda.</p>
              ) : (
                globalLeaderboard.map((entry, idx) => (
                  <div
                    key={`${entry.user.id}-${entry.poolName}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-bold w-8 ${idx < 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {idx + 1}º
                      </span>
                      <UserAvatar name={entry.user.name} avatar={entry.user.avatar} className="w-8 h-8" />
                      <div>
                        <div className="font-semibold">{entry.user.name}</div>
                        <div className="text-xs text-gray-500">{entry.poolName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">{entry.points} pts</div>
                      <div className="text-xs text-gray-500">{entry.exactScores} exatos • {entry.correctResults} resultados</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
              </div>
              <Button variant="outline" size="sm" onClick={refreshUsers} title="Atualizar lista de usuários">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filterUsers.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">
                  {allUsers.length === 0 ? 'Nenhum usuário cadastrado.' : 'Nenhum resultado para a busca.'}
                </p>
              ) : (
                filterUsers.map((u) => {
                  const userPools = pools.filter(p => p.ownerId === u.id || p.members.some(m => m.userId === u.id));
                  return (
                    <div key={u.id} className="p-4 bg-gray-50 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={u.name} avatar={u.avatar} className="w-10 h-10" />
                          <div>
                            <div className="font-semibold">{u.name}</div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                            <div className="text-xs text-gray-400">ID: {u.id}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-800"
                            onClick={() => setEditingUser(u)}
                            title="Editar usuário"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          {!useFirebase && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              onClick={() => setSettingPasswordFor({ user: u, password: '' })}
                              title="Definir nova senha (modo local)"
                            >
                              <Lock className="w-4 h-4 mr-1" />
                              Nova senha
                            </Button>
                          )}
                          {useFirebase && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleSendPasswordReset(u.email)}
                              disabled={resettingEmail === u.email}
                              title="Enviar email para redefinir senha"
                            >
                              <KeyRound className="w-4 h-4 mr-1" />
                              {resettingEmail === u.email ? 'Enviando…' : 'Redefinir senha'}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteUser(u)}
                            disabled={u.id === user.id}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir usuário
                          </Button>
                        </div>
                      </div>
                      {userPools.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {userPools.map((p) => (
                            <div key={p.id} className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 text-sm">
                              <span>{p.name}</span>
                              {p.ownerId !== u.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => handleRemoveFromPool(p.id, u.id, u.name)}
                                  title="Remover do bolão"
                                >
                                  <UserMinus className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="pools" className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou código..."
                value={searchPools}
                onChange={(e) => setSearchPools(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filterPools.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">
                  {pools.length === 0 ? 'Nenhum bolão criado.' : 'Nenhum resultado para a busca.'}
                </p>
              ) : (
                filterPools.map((p) => (
                  <div key={p.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-sm text-gray-500">
                          {p.members?.length ?? 0} participantes • Dono: {p.owner?.name ?? p.ownerId}
                          {p.code && ` • Código: ${p.code}`}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{p.description || 'Sem descrição'}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                          onClick={() => setEditingPool(p)}
                          title="Editar bolão"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeletePool(p)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir bolão
                        </Button>
                      </div>
                    </div>
                    {p.members && p.members.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-1">Participantes:</div>
                        <div className="flex flex-wrap gap-2">
                          {p.members.map((m) => (
                            <div key={m.id} className="flex items-center gap-1 bg-white rounded px-2 py-1 text-sm">
                              <span>{m.user?.name ?? m.userId}</span>
                              {m.userId !== p.ownerId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-red-500"
                                  onClick={() => handleRemoveFromPool(p.id, m.userId, m.user?.name ?? m.userId)}
                                  title="Remover do bolão"
                                >
                                  <UserMinus className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSyncResults} disabled={isSyncing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sincronizar resultados da API
                </Button>
                <Button variant="outline" onClick={handleClearMatchCache}>
                  Atualizar cache de jogos
                </Button>
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {Array.from({ length: getCurrentRound() }, (_, i) => i + 1).map((round) => {
                  const roundMatches = getMatchesByRound(round);
                  return (
                    <div key={round}>
                      <h4 className="font-semibold text-gray-700 mb-2">Rodada {round}</h4>
                      <div className="space-y-2">
                        {roundMatches.map((match) => {
                          const result = getMatchResult(match.id) ??
                            (match.homeScore != null && match.awayScore != null
                              ? { homeScore: match.homeScore, awayScore: match.awayScore }
                              : undefined);
                          return (
                            <div
                              key={match.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                            >
                              <span>
                                {match.homeTeam.displayName ?? match.homeTeam.name} vs{' '}
                                {match.awayTeam.displayName ?? match.awayTeam.name}
                              </span>
                              {result ? (
                                <span className="font-bold text-green-700">
                                  {result.homeScore} x {result.awayScore}
                                </span>
                              ) : (
                                <ResultInput
                                  onSet={(h, a) => setMatchResult(match.id, h, a)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por jogo, bolão ou usuário..."
                value={searchPredictions}
                onChange={(e) => setSearchPredictions(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Lista de todos os palpites. Clique em Excluir para remover um palpite.
            </p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filterPredictions.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">
                  {allPredictions.length === 0 ? 'Nenhum palpite registrado.' : 'Nenhum resultado para a busca.'}
                </p>
              ) : (
                filterPredictions.map((pred) => {
                  const match = getMatchById(pred.matchId);
                  const pool = pools.find((p) => p.id === pred.poolId);
                  const predUser = allUsers.find((u) => u.id === pred.userId);
                  return (
                    <div
                      key={pred.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div>
                        <span className="font-medium">{predUser?.name ?? pred.userId}</span>
                        {' • '}
                        {match
                          ? `${match.homeTeam.displayName ?? match.homeTeam.name} x ${match.awayTeam.displayName ?? match.awayTeam.name}`
                          : pred.matchId}
                        {' • '}
                        <span className="text-gray-600">{pool?.name ?? pred.poolId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{pred.homeScore} x {pred.awayScore}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-red-600 hover:text-red-700"
                          onClick={() => handleDeletePrediction(pred)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg p-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm">
            Ações aqui afetam todos os dados. Use com cuidado. Para configurar administradores, edite{' '}
            <code className="bg-amber-100 px-1 rounded">src/lib/adminConfig.ts</code>.
          </p>
        </div>
      </DialogContent>

      {/* Editar usuário */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <EditUserForm
              user={editingUser}
              onSave={(updates) => handleSaveUserEdit(editingUser, updates)}
              onCancel={() => setEditingUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Editar bolão */}
      <Dialog open={!!editingPool} onOpenChange={() => setEditingPool(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar bolão</DialogTitle>
          </DialogHeader>
          {editingPool && (
            <EditPoolForm
              pool={editingPool}
              onSave={(updates) => handleSavePoolEdit(editingPool, updates)}
              onCancel={() => setEditingPool(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Definir senha (modo local) */}
      <Dialog open={!!settingPasswordFor} onOpenChange={() => setSettingPasswordFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Definir nova senha</DialogTitle>
            <p className="text-sm text-gray-500">Para {settingPasswordFor?.user.name} ({settingPasswordFor?.user.email})</p>
          </DialogHeader>
          {settingPasswordFor && (
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Nova senha (mín. 6 caracteres)"
                value={settingPasswordFor.password}
                onChange={(e) => setSettingPasswordFor({ ...settingPasswordFor, password: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSettingPasswordFor(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSetPassword} disabled={settingPasswordFor.password.length < 6}>
                  Salvar senha
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'clear' ? (
                <>Tem certeza? Isso vai apagar TODOS os dados do app (usuários, bolões, palpites, resultados). Esta ação não pode ser desfeita.</>
              ) : (
                <>Tem certeza que deseja excluir{' '}
                  {deleteTarget?.type === 'user' ? `o usuário "${deleteTarget.name}"` :
                    deleteTarget?.type === 'pool' ? `o bolão "${deleteTarget.name}"` :
                      deleteTarget?.type === 'prediction' ? `o palpite "${deleteTarget.name}"` : ''}?
                  Esta ação não pode ser desfeita.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

function EditUserForm({
  user,
  onSave,
  onCancel,
}: {
  user: User;
  onSave: (updates: { name?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(user.name);
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSave({ name: name.trim() })} disabled={!name.trim()}>Salvar</Button>
      </div>
    </div>
  );
}

function EditPoolForm({
  pool,
  onSave,
  onCancel,
}: {
  pool: Pool;
  onSave: (updates: { name?: string; description?: string; code?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(pool.name);
  const [description, setDescription] = useState(pool.description || '');
  const [code, setCode] = useState(pool.code || '');
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Descrição</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg"
        />
      </div>
      {pool.isPrivate && (
        <div>
          <label className="text-sm font-medium text-gray-700">Código de acesso</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Deixe vazio para gerar novo"
            className="w-full mt-1 px-4 py-2 border rounded-lg"
          />
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button
          onClick={() => {
            const updates: { name?: string; description?: string; code?: string } = { name: name.trim(), description: description.trim() };
            if (code.trim()) updates.code = code.trim();
            onSave(updates);
          }}
          disabled={!name.trim()}
        >
          Salvar
        </Button>
      </div>
    </div>
  );
}

function ResultInput({
  onSet,
}: {
  onSet: (home: number, away: number) => void;
}) {
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={20}
        value={home}
        onChange={(e) => setHome(e.target.value)}
        className="w-12 h-8 text-center text-sm border rounded"
      />
      <span className="text-gray-400">x</span>
      <input
        type="number"
        min={0}
        max={20}
        value={away}
        onChange={(e) => setAway(e.target.value)}
        className="w-12 h-8 text-center text-sm border rounded"
      />
      <Button
        size="sm"
        onClick={() => {
          const h = parseInt(home, 10);
          const a = parseInt(away, 10);
          if (!Number.isNaN(h) && !Number.isNaN(a) && h >= 0 && a >= 0) {
            onSet(h, a);
            toast.success('Resultado registrado!');
          }
        }}
      >
        Salvar
      </Button>
    </div>
  );
}
