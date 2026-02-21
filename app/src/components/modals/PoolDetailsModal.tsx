import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { usePoolsContext } from '@/context/PoolsContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  Lock, 
  Unlock, 
  Calendar, 
  Copy, 
  Check,
  Target,
  Medal,
  Edit3,
  LogOut,
  Trash2,
  Share2,
  Crosshair,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import type { Match, Pool } from '@/types';
import { MatchCard } from '@/components/ui/custom/MatchCard';
import { toast } from 'sonner';
import { useMatchesContext } from '@/context/MatchesContext';
import { TeamLogo } from '@/components/ui/custom/TeamLogo';

interface PoolDetailsModalProps {
  pool: Pool | null;
  isOpen: boolean;
  onClose: () => void;
  /** Código pré-preenchido ao abrir via link de convite */
  initialJoinCode?: string;
}

interface ResultRowProps {
  match: Match;
  result?: { homeScore: number; awayScore: number };
  onSetResult: (homeScore: number, awayScore: number) => void;
}

function ResultRow({ match, result, onSetResult }: ResultRowProps) {
  const [home, setHome] = useState<string | number>(result?.homeScore ?? '');
  const [away, setAway] = useState<string | number>(result?.awayScore ?? '');

  if (result) {
    return (
      <div className="flex items-center justify-between gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 min-w-0">
          <TeamLogo teamName={match.homeTeam.name} size="sm" />
          <span className="text-sm font-medium truncate">{match.homeTeam.displayName ?? match.homeTeam.name}</span>
        </div>
        <span className="text-lg font-bold text-green-700 flex-shrink-0">{result.homeScore} x {result.awayScore}</span>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate">{match.awayTeam.displayName ?? match.awayTeam.name}</span>
          <TeamLogo teamName={match.awayTeam.name} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <TeamLogo teamName={match.homeTeam.name} size="sm" />
        <span className="text-sm font-medium truncate">{match.homeTeam.displayName ?? match.homeTeam.name}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input
          type="number"
          min={0}
          max={20}
          value={home}
          onChange={(e) => setHome(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
          className="w-12 h-10 text-center text-sm font-bold border border-gray-200 rounded-lg"
        />
        <span className="text-gray-400">x</span>
        <input
          type="number"
          min={0}
          max={20}
          value={away}
          onChange={(e) => setAway(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
          className="w-12 h-10 text-center text-sm font-bold border border-gray-200 rounded-lg"
        />
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="text-sm font-medium truncate">{match.awayTeam.displayName ?? match.awayTeam.name}</span>
        <TeamLogo teamName={match.awayTeam.name} size="sm" />
      </div>
      <Button
        size="sm"
        onClick={() => {
          const h = home === '' ? NaN : Number(home);
          const a = away === '' ? NaN : Number(away);
          if (!Number.isNaN(h) && !Number.isNaN(a) && h >= 0 && a >= 0) {
            onSetResult(h, a);
          }
        }}
        disabled={home === '' || away === ''}
      >
        Salvar
      </Button>
    </div>
  );
}

export const PoolDetailsModal = ({ pool, isOpen, onClose, initialJoinCode }: PoolDetailsModalProps) => {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();
  const { getMatchesByRound, getCurrentRound } = useMatchesContext();

  useEffect(() => {
    if (isOpen) {
      setJoinCode(initialJoinCode ?? '');
    }
  }, [isOpen, initialJoinCode, pool?.id]);
  const { joinPool, leavePool, deletePool, savePrediction, getUserPrediction, getMatchResult, setMatchResult, getPredictionPoints, syncResultsFromApi } = usePoolsContext();
  const getMemberStats = (userId: string) => {
    let exact = 0, correct = 0;
    (pool.matches ?? []).forEach(m => {
      const pts = getPredictionPoints(pool.id, userId, m.id);
      if (pts !== undefined) {
        if (pts >= 5) exact++;
        if (pts >= 3) correct++;
      }
    });
    return { exactScores: exact, correctResults: correct };
  };
  const isMember = user && pool && (pool.ownerId === user.id || (pool.members ?? []).some(m => m?.userId === user.id));
  const isOwner = user && pool && pool.ownerId === user.id;

  if (!pool) return null;

  const handleCopyCode = () => {
    if (pool.code) {
      navigator.clipboard.writeText(pool.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?pool=${pool.id}${pool.code ? `&code=${pool.code}` : ''}`
    : '';

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast.success('Link copiado!', {
      description: 'Compartilhe com os amigos para entrarem no bolão.',
    });
  };

  const handleJoinPool = async () => {
    if (!user) {
      toast.error('Faça login para entrar no bolão.');
      return;
    }
    if (pool.isPrivate && !joinCode.trim()) {
      toast.error('Digite o código do bolão para entrar.');
      return;
    }
    setIsJoining(true);
    try {
      const code = pool.isPrivate ? joinCode.trim().toUpperCase() : undefined;
      const success = await joinPool(pool.id, user, code);
      if (success) {
        toast.success('Você entrou no bolão!', {
          description: `Bem-vindo ao "${pool.name}". Boa sorte nos palpites!`,
        });
        onClose();
      } else {
        toast.error('Não foi possível entrar', {
          description: pool.isPrivate ? 'Verifique se o código está correto.' : 'Tente novamente.',
        });
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeavePool = () => {
    if (!user) return;
    const success = leavePool(pool.id, user.id);
    if (success) {
      toast.success('Você saiu do bolão.', {
        description: `Você deixou "${pool.name}".`,
      });
      onClose();
    }
  };

  const handleDeletePool = () => {
    if (!user) return;
    const success = deletePool(pool.id, user.id);
    if (success) {
      toast.success('Bolão excluído.', {
        description: `"${pool.name}" foi removido.`,
      });
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const sortedMembers = [...(pool.members ?? [])].sort((a, b) => b.points - a.points).slice(0, 10);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-2xl font-bold">{pool.name}</DialogTitle>
                <Badge variant={pool.isPrivate ? 'secondary' : 'default'}>
                  {pool.isPrivate ? (
                    <><Lock className="w-3 h-3 mr-1" /> Privado</>
                  ) : (
                    <><Unlock className="w-3 h-3 mr-1" /> Público</>
                  )}
                </Badge>
              </div>
              <p className="text-gray-500">{pool.description}</p>
            </div>
            {pool.prize && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 px-4 py-2 rounded-xl">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">{pool.prize}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Pool Code e link de convite - visível apenas para membros */}
        {isMember && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 space-y-3">
            {pool.code && (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-medium mb-1">Código do Bolão</div>
                  <div className="text-2xl font-black text-blue-900 tracking-wider">{pool.code}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="border-blue-200 hover:bg-blue-100"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 mr-2" /> Copiado</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" /> Copiar</>
                  )}
                </Button>
              </div>
            )}
            <div className="pt-2 border-t border-blue-100">
              <div className="text-sm text-blue-600 font-medium mb-2">Link de convite</div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg truncate"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInviteLink}
                  className="border-blue-200 hover:bg-blue-100 flex-shrink-0"
                >
                  {linkCopied ? (
                    <><Check className="w-4 h-4 mr-2" /> Copiado</>
                  ) : (
                    <><Share2 className="w-4 h-4 mr-2" /> Compartilhar</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Campo de código para entrar em bolão privado */}
        {pool.isPrivate && !isMember && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <label className="block text-sm font-medium text-amber-800 mb-2">
              Código para entrar
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Digite o código que recebeu"
              className="w-full px-4 py-3 border border-amber-200 rounded-lg text-lg font-mono tracking-wider uppercase placeholder:normal-case placeholder:tracking-normal"
              maxLength={12}
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{pool.members?.length ?? 0}</div>
            <div className="text-sm text-gray-500">Participantes</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{pool.matches?.length ?? 0}</div>
            <div className="text-sm text-gray-500">Jogos</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">
              {new Date(pool.endsAt).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm text-gray-500">Término</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ranking">
          <TabsList className={`grid w-full ${isOwner ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="ranking">
              <Medal className="w-4 h-4 mr-2" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="matches">
              <Target className="w-4 h-4 mr-2" />
              Jogos
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Membros
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="results">
                <Edit3 className="w-4 h-4 mr-2" />
                Resultados
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="ranking" className="mt-4">
            <p className="text-sm text-gray-500 mb-4">
              Top 10 do bolão — placar exato (5 pts) e resultado correto (3 pts)
            </p>
            <div className="space-y-3">
              {sortedMembers.map((member, index) => {
                const stats = getMemberStats(member.userId);
                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-4 p-4 rounded-xl animate-fade-in-up ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' :
                      index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200' :
                      index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200' :
                      'bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <UserAvatar
                      name={member.user.name}
                      avatar={member.user.avatar}
                      className="w-12 h-12 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{member.user.name}</div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1" title="Placares exatos">
                          <Crosshair className="w-3.5 h-3.5 text-green-600" />
                          {stats.exactScores}
                        </span>
                        <span className="flex items-center gap-1" title="Resultados corretos">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                          {stats.correctResults}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Target className="w-5 h-5 text-amber-500" />
                      <span className="text-lg font-black text-amber-600">{member.points}</span>
                      <span className="text-sm text-gray-500">pts</span>
                    </div>
                    {index < 3 && (
                      <Medal className={`w-6 h-6 shrink-0 ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-500' :
                        'text-orange-500'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="matches" className="mt-4">
            <div className="grid gap-4">
              {(pool.matches ?? []).slice(0, 10).map((match) => {
                const userPred = user && isMember
                  ? getUserPrediction(pool.id, user.id, match.id)
                  : undefined;
                const result = getMatchResult(match.id);
                const matchWithResult = result
                  ? { ...match, status: 'finished' as const, homeScore: result.homeScore, awayScore: result.awayScore }
                  : match;
                const pointsEarned = user && isMember ? getPredictionPoints(pool.id, user.id, match.id) : undefined;
                return (
                  <MatchCard
                    key={match.id}
                    match={matchWithResult}
                    compact={!isMember}
                    showPrediction={!!(user && isMember)}
                    userPrediction={userPred}
                    pointsEarned={pointsEarned}
                    onPredict={user && isMember
                      ? (matchId, homeScore, awayScore) => {
                          savePrediction(pool.id, user.id, matchId, homeScore, awayScore);
                          toast.success('Palpite registrado!', {
                            description: `${match.homeTeam.displayName ?? match.homeTeam.name} ${homeScore} x ${awayScore} ${match.awayTeam.displayName ?? match.awayTeam.name}`,
                          });
                        }
                      : undefined
                    }
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(pool.members ?? [])
                .filter((m) => m?.user)
                .map((member) => {
                  const joinedAt =
                    member.joinedAt instanceof Date
                      ? member.joinedAt
                      : new Date(member.joinedAt ?? 0);
                  const displayName = member.user?.name ?? 'Participante';
                  return (
                    <div
                      key={member.id}
                      className="flex flex-col items-center p-4 bg-gray-50 rounded-xl"
                    >
                      <UserAvatar
                        name={displayName}
                        avatar={member.user?.avatar}
                        className="w-16 h-16 mb-3"
                        fallbackClassName="text-lg"
                      />
                      <div className="font-medium text-center">{displayName}</div>
                      <div className="text-sm text-gray-500">
                        Entrou em {joinedAt.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  );
                })}
            </div>
          </TabsContent>

          {isOwner && (
            <TabsContent value="results" className="mt-4">
              <p className="text-sm text-gray-500 mb-2">
                Os resultados são buscados automaticamente da API. Você também pode definir manualmente.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Regras: 5 pts placar exato | 3 pts resultado correto (vitória/empate)
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setIsSyncing(true);
                  try {
                    const { count } = await syncResultsFromApi();
                    toast.success(
                      count > 0
                        ? `${count} resultado(s) atualizado(s) da API!`
                        : 'Nenhum resultado novo. Tente novamente mais tarde.'
                    );
                  } catch {
                    toast.error('Falha ao buscar resultados.');
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                disabled={isSyncing}
                className="mb-4"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Buscando...' : 'Atualizar da API'}
              </Button>
              <div className="space-y-6">
                {Array.from({ length: getCurrentRound() }, (_, i) => i + 1).map(round => {
                  const roundMatches = getMatchesByRound(round);
                  return (
                    <div key={round}>
                      <h4 className="font-semibold text-gray-700 mb-2">Rodada {round}</h4>
                      <div className="space-y-2">
                        {roundMatches.map(match => {
                          const result =
                            match.homeScore != null && match.awayScore != null
                              ? { homeScore: match.homeScore, awayScore: match.awayScore }
                              : getMatchResult(match.id);
                          return (
                            <ResultRow
                              key={match.id}
                              match={match}
                              result={result}
                              onSetResult={(h, a) => {
                                setMatchResult(match.id, h, a);
                                toast.success('Resultado registrado!', {
                                  description: `O ranking foi atualizado.`,
                                });
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {!isMember ? (
            <Button
              onClick={handleJoinPool}
              disabled={isJoining || !user || (pool.isPrivate && !joinCode.trim())}
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold py-4 rounded-xl"
            >
              {!user
                ? 'Faça login para entrar'
                : isJoining
                  ? 'Entrando...'
                  : 'Entrar neste Bolão'}
            </Button>
          ) : isOwner ? (
            <>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full font-bold py-4 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Bolão
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Ao excluir, o bolão e todos os palpites serão removidos.
              </p>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={handleLeavePool}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold py-4 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair do Bolão
            </Button>
          )}
        </div>
      </DialogContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir bolão?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{pool.name}&quot;? Esta ação não pode ser desfeita.
              Todos os participantes e palpites serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePool}
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
