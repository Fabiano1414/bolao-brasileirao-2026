import type { Pool } from '@/types';
import { Users, Trophy, Lock, Unlock, Calendar, Crown } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface PoolCardProps {
  pool: Pool;
  onClick?: () => void;
  /** Mostra badge "Dono" quando o usuário é o criador do bolão */
  isOwner?: boolean;
}

export const PoolCard = ({ pool, onClick, isOwner = false }: PoolCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short'
    }).format(date);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 cursor-pointer group hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300"
      onClick={onClick}
    >
      <div className="h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          {isOwner && (
            <span className="bg-amber-400/90 text-amber-900 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
              <Crown className="w-3 h-3" /> Dono
            </span>
          )}
          {pool.isPrivate ? (
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> Privado
            </span>
          ) : (
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Unlock className="w-3 h-3" /> Público
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
          {pool.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {pool.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-blue-500" />
            <span>{pool.members.length} participantes</span>
          </div>
          {pool.prize && !pool.isPrivate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>{pool.prize}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {pool.members.slice(0, 4).map((member) => (
              <UserAvatar
                key={member.id}
                name={member.user.name}
                avatar={member.user.avatar}
                className="w-8 h-8 border-2 border-white"
                fallbackClassName="text-xs"
              />
            ))}
            {pool.members.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                +{pool.members.length - 4}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            Até {formatDate(pool.endsAt)}
          </div>
        </div>
      </div>
    </div>
  );
};
