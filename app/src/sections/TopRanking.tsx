import { useRef, useMemo } from 'react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Trophy, Medal, Target, Crosshair, CheckCircle } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { usePoolsContext } from '@/context/PoolsContext';

export const TopRanking = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { getGlobalLeaderboard } = usePoolsContext();

  const topScorers = useMemo(() => getGlobalLeaderboard(10), [getGlobalLeaderboard]);

  if (topScorers.length === 0) return null;

  const podiumThree = topScorers.slice(0, 3);

  return (
    <section ref={ref} className="py-24 relative overflow-hidden" id="top-ranking">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-white to-orange-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            <span>Destaque da Temporada</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Exo, sans-serif' }}>
            Melhores
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500"> no Bolão</span>
          </h2>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
            Os 10 jogadores com mais pontos na temporada. Placar exato, resultado correto e total.
          </p>
        </div>

        <div
          className={`transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="relative">
            {/* Pódio visual para top 3 */}
            <div className="flex justify-center items-end gap-4 md:gap-8 mb-8">
              {[1, 0, 2].map((podiumIndex) => {
                const player = podiumThree[podiumIndex];
                if (!player) return null;

                const heights = ['h-32', 'h-40', 'h-28'];
                const colors = [
                  'from-yellow-400 to-amber-500 shadow-yellow-200',
                  'from-gray-300 to-gray-400 shadow-gray-200',
                  'from-orange-400 to-amber-600 shadow-orange-200',
                ];
                const positions = ['2º lugar', 'Campeão', '3º lugar'];

                return (
                  <div
                    key={player.user.id}
                    className="flex flex-col items-center flex-1 max-w-[160px]"
                  >
                    <UserAvatar
                      name={player.user.name}
                      avatar={player.user.avatar}
                      className="w-20 h-20 md:w-24 md:h-24 border-4 border-white shadow-xl ring-4 ring-amber-100 mb-4"
                      fallbackClassName="text-xl"
                    />
                    <div className="text-center">
                      <div className="font-bold text-gray-900 truncate">{player.user.name}</div>
                      <div className="text-2xl font-black text-amber-600">{player.points} pts</div>
                      <div className="text-xs text-amber-600 font-medium mt-1">{positions[podiumIndex]}</div>
                      <div className="flex justify-center gap-2 mt-1 text-xs text-gray-500">
                        <span title="Placares exatos">{player.exactScores}</span>
                        <span>•</span>
                        <span title="Resultados corretos">{player.correctResults}</span>
                      </div>
                    </div>
                    <div
                      className={`w-full mt-4 rounded-t-xl bg-gradient-to-t ${colors[podiumIndex]} shadow-lg ${heights[podiumIndex]}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Lista completa top 10 com detalhes */}
            <div className="space-y-3">
              {topScorers.map((entry, index) => (
                <div
                  key={entry.user.id}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200 shadow-amber-100/50'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
                      : 'bg-white border-gray-100 hover:border-amber-100'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <UserAvatar
                    name={entry.user.name}
                    avatar={entry.user.avatar}
                    className="w-14 h-14 border-2 border-white shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{entry.user.name}</div>
                    <div className="text-sm text-gray-500 truncate">{entry.poolName}</div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-1.5" title="Placares exatos (5 pts)">
                        <Crosshair className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">{entry.exactScores}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Resultados corretos (3 ou 5 pts)">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">{entry.correctResults}</span>
                      </div>
                      <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                        <Target className="w-5 h-5 text-amber-500" />
                        <span className="text-xl font-black text-amber-600">{entry.points}</span>
                        <span className="text-sm text-gray-500">pts</span>
                      </div>
                    </div>
                  {index < 3 && (
                    <Medal
                      className={`w-8 h-8 shrink-0 ${
                        index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : 'text-orange-500'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
