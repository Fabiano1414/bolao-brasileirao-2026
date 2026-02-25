import { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Trophy, 
  Target, 
  TrendingUp,
  LogOut,
  Edit2,
  Save,
  Image,
  Shield,
  Star,
  Bell,
  BellOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { usePoolsContext } from '@/context/PoolsContext';
import { fileToAvatarDataUrl } from '@/lib/avatarUpload';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
}

export const ProfileModal = ({ isOpen, onClose, onOpenAdmin }: ProfileModalProps) => {
  const { user, logout, updateUser, isAdmin } = useAuth();
  const { permission, isEnabling, isSupported, enableNotifications } = useNotifications();
  const { getGlobalLeaderboard, getUserPredictionHistory, getUserPoolsList } = usePoolsContext();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (!user) return null;

  const leaderboardData = getGlobalLeaderboard(100);
  const userEntry = leaderboardData.find(entry => entry.user.id === user.id);
  const userStats = userEntry
    ? { points: userEntry.points, correctScores: userEntry.exactScores, correctResults: userEntry.correctResults, rank: userEntry.rank }
    : { points: 0, correctScores: 0, correctResults: 0, rank: 0 };

  const predictionHistory = getUserPredictionHistory(user.id);
  const totalExact = userStats.correctScores;
  const myPools = getUserPoolsList(user.id);
  const hasWonPool = myPools.some(pool => {
    const top = pool.members?.find(m => m.rank === 1);
    return top?.userId === user.id;
  });

  const handleSave = () => {
    if (name.trim()) {
      updateUser({ name: name.trim() });
      toast.success('Perfil atualizado!', { description: 'Seu nome foi alterado.' });
    }
    setIsEditing(false);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      updateUser({ avatar: dataUrl });
      toast.success('Foto atualizada!', { description: 'Sua foto de perfil foi alterada.' });
      setIsEditingAvatar(false);
    } catch {
      toast.error('Erro ao carregar imagem');
    }
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    updateUser({ avatar: undefined });
    toast.success('Foto removida!', { description: 'Exibindo iniciais no perfil.' });
    setIsEditingAvatar(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Meu Perfil</DialogTitle>
        </DialogHeader>

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <UserAvatar
              name={user.name}
              avatar={user.avatar}
              className="w-24 h-24 border-4 border-white shadow-lg"
              fallbackClassName="text-3xl"
            />
            <button
              onClick={() => setIsEditingAvatar(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
              title="Alterar foto"
            >
              <Image className="w-4 h-4" />
            </button>
          </div>
          {isEditingAvatar && (
            <div className="mt-3 flex flex-col items-center gap-2 w-full">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => photoInputRef.current?.click()}>
                  <Image className="w-4 h-4 mr-1" />
                  Escolher da galeria
                </Button>
                <Button size="sm" variant="outline" onClick={handleRemovePhoto}>
                  Usar iniciais
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingAvatar(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{user.name}</h3>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-900">{userStats.points}</div>
            <div className="text-sm text-blue-600">Pontos Totais</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-900">#{userStats.rank}</div>
            <div className="text-sm text-green-600">Ranking Geral</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-900">{userStats.correctScores}</div>
            <div className="text-sm text-orange-600">Placares Exatos</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
            <User className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-900">{userStats.correctResults}</div>
            <div className="text-sm text-purple-600">Resultados Certos</div>
          </div>
        </div>

        {/* Notificações Push */}
        {isSupported && (
          <div className="mb-6 p-4 rounded-xl border bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {permission === 'granted' ? (
                  <Bell className="w-5 h-5 text-green-600" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <div className="font-medium">Notificações</div>
                  <div className="text-sm text-gray-500">
                    {permission === 'granted'
                      ? 'Ativadas — você recebe lembretes e atualizações'
                      : permission === 'denied'
                        ? 'Bloqueadas — ative nas configurações do navegador'
                        : 'Receba lembretes de jogos e resultados'}
                  </div>
                </div>
              </div>
              {permission !== 'granted' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={enableNotifications}
                  disabled={isEnabling}
                >
                  {isEnabling ? 'Ativando…' : 'Ativar'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="history">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-3">
              {predictionHistory.length === 0 ? (
                <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
                  Nenhum palpite com resultado ainda. Faça seus palpites nos jogos e aguarde os resultados!
                </div>
              ) : (
                predictionHistory.map((item, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.homeTeam} {item.prediction.homeScore} x {item.prediction.awayScore} {item.awayTeam}</div>
                        <div className="text-sm text-gray-500">
                          Rodada {item.round} • {item.poolName}
                          {item.points >= 3 ? ' • Acertou o placar!' : item.points >= 1 ? ' • Acertou o resultado' : ' • Errou'}
                        </div>
                      </div>
                      <div className={`font-bold ${item.points >= 3 ? 'text-green-600' : item.points >= 1 ? 'text-blue-600' : 'text-red-500'}`}>
                        {item.points > 0 ? `+${item.points}` : item.points} pts
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className={`flex flex-col items-center p-4 rounded-xl border ${predictionHistory.length >= 1 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                <Star className={`w-10 h-10 mb-2 ${predictionHistory.length >= 1 ? 'text-emerald-500' : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-center">Iniciante</div>
                <div className="text-xs text-gray-500 text-center">{predictionHistory.length >= 1 ? 'Primeiro palpite!' : 'Faça seu primeiro palpite'}</div>
              </div>
              <div className={`flex flex-col items-center p-4 rounded-xl border ${hasWonPool ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                <Trophy className={`w-10 h-10 mb-2 ${hasWonPool ? 'text-yellow-500' : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-center">Campeão</div>
                <div className="text-xs text-gray-500 text-center">{hasWonPool ? 'Venceu um bolão!' : 'Vence um bolão'}</div>
              </div>
              <div className={`flex flex-col items-center p-4 rounded-xl border ${totalExact >= 10 ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                <Target className={`w-10 h-10 mb-2 ${totalExact >= 10 ? 'text-blue-500' : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-center">Atirador</div>
                <div className="text-xs text-gray-500 text-center">{totalExact >= 10 ? `${totalExact} placares exatos!` : '10 placares exatos'}</div>
              </div>
              <div className={`flex flex-col items-center p-4 rounded-xl border ${userStats.rank === 1 ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                <TrendingUp className={`w-10 h-10 mb-2 ${userStats.rank === 1 ? 'text-green-500' : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-center">Líder</div>
                <div className="text-xs text-gray-500 text-center">{userStats.rank === 1 ? 'Lidera o ranking!' : 'Lidere o ranking'}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Admin e Logout */}
        <div className="mt-6 space-y-3">
          {isAdmin && onOpenAdmin && (
            <Button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Painel Administrativo
            </Button>
          )}
          <Button
            variant="outline"
            onClick={logout}
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
