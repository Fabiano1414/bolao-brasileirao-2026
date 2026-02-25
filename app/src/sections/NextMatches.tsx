import { useRef, useState, useEffect } from 'react';
import { MatchCard, type UserPrediction } from '@/components/ui/custom/MatchCard';
import { useMatchesContext } from '@/context/MatchesContext';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Trophy, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useInView } from '@/hooks/useInView';
import { useAuth } from '@/hooks/useAuth';
import { usePoolsContext } from '@/context/PoolsContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NextMatchesProps {
  onViewAll: () => void;
}

function getRoundDateLabel(matches: { date: Date }[]): string {
  if (matches.length === 0) return '';
  const dates = matches.map(m => (m.date instanceof Date ? m.date : new Date(m.date)));
  const min = new Date(Math.min(...dates.map(d => d.getTime())));
  const max = new Date(Math.max(...dates.map(d => d.getTime())));
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  return min.getTime() === max.getTime() ? fmt(min) : `${fmt(min)} a ${fmt(max)}`;
}

export const NextMatches = ({ onViewAll }: NextMatchesProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [now, setNow] = useState(() => Date.now());
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const { user } = useAuth();
  const { getUserPoolsList, savePrediction, getUserPrediction, getMatchResult, getPredictionPoints } = usePoolsContext();
  const { getUpcomingMatches, getUpcomingMatchesByRound, getCurrentRound, isLoading, error, refreshMatches } = useMatchesContext();

  const userPools = user ? getUserPoolsList(user.id) : [];
  const hasPool = userPools.length > 0;
  const effectivePoolId = selectedPoolId || (hasPool ? userPools[0].id : '');

  useEffect(() => {
    if (userPools.length > 0 && !selectedPoolId) {
      setSelectedPoolId(userPools[0].id);
    }
  }, [userPools.length, selectedPoolId, userPools]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const matchesByRound = getUpcomingMatchesByRound(now);
  const upcomingMatches = getUpcomingMatches(10, now);
  const sortedRounds = Array.from(matchesByRound.keys()).sort((a, b) => a - b);

  return (
    <section ref={ref} className="py-24 bg-[#1A1D24] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {error && (
          <div
            className={`mb-6 flex items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 transition-opacity duration-500 ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center gap-2 text-amber-200">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshMatches()}
              className="border-amber-400/50 text-amber-200 hover:bg-amber-500/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        )}

        <div
          className={`flex flex-col md:flex-row md:items-end md:justify-between mb-12 transition-all duration-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Calendar className="w-4 h-4" />
              <span>Rodada {getCurrentRound(now)}</span>
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-green-300" />
              )}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Exo, sans-serif' }}>
              Próximos Jogos —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Rodada {getCurrentRound(now)}
              </span>
            </h2>
            <p className="text-gray-400 text-lg mt-3 max-w-xl">
              Faça seus palpites antes que comecem — fecham 5 min antes de cada jogo.
            </p>
          </div>
          <Button
            onClick={onViewAll}
            variant="outline"
            className="mt-6 md:mt-0 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl"
          >
            Ver Todos os Jogos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div
          className={`relative transition-opacity duration-500 ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {sortedRounds.length > 0 ? (
            <div className="space-y-12">
              {sortedRounds.map((round) => {
                const roundMatches = matchesByRound.get(round) ?? [];
                const dateLabel = getRoundDateLabel(roundMatches);
                return (
                  <div key={round}>
                    <div className="flex items-center gap-3 mb-6">
                      <h3 className="text-xl font-bold text-white">
                        Rodada {round}
                        {dateLabel && (
                          <span className="text-gray-400 font-medium ml-2">— {dateLabel}</span>
                        )}
                      </h3>
                    </div>
                    <div className="flex gap-6 py-4 overflow-x-auto">
                      {roundMatches.map((match) => (
                        <div key={match.id} className="flex-shrink-0">
                          <MatchCard match={match} compact />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center bg-white/5 rounded-2xl border border-white/10">
              <p className="text-white/80 font-medium">Nenhum jogo nos próximos dias</p>
              <p className="text-white/50 text-sm mt-1">Aguarde a divulgação da próxima rodada</p>
            </div>
          )}
        </div>

        {/* Seletor de bolão para palpites */}
        {user && (
          <div
            className={`mb-6 transition-opacity duration-500 ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {hasPool ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-white/80 font-medium">Fazer palpites no bolão:</span>
                <Select value={effectivePoolId} onValueChange={setSelectedPoolId}>
                  <SelectTrigger className="w-full max-w-[280px] bg-white/10 border-white/20 text-white">
                    <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                    <SelectValue placeholder="Escolha um bolão" />
                  </SelectTrigger>
                  <SelectContent>
                    {userPools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        {pool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="py-6 px-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                <p className="text-white/80 font-medium">Crie ou entre em um bolão para fazer palpites!</p>
                <p className="text-white/50 text-sm mt-1">Você precisa participar de um bolão para apostar nos jogos.</p>
              </div>
            )}
          </div>
        )}

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 transition-all duration-500 min-w-0 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {upcomingMatches.map((match) => {
            const userPred: UserPrediction | undefined = user && effectivePoolId
              ? getUserPrediction(effectivePoolId, user.id, match.id)
              : undefined;
            const result =
              getMatchResult(match.id) ??
              (match.homeScore != null && match.awayScore != null
                ? { homeScore: match.homeScore, awayScore: match.awayScore }
                : undefined);
            const matchWithResult = result
              ? { ...match, status: 'finished' as const, homeScore: result.homeScore, awayScore: result.awayScore }
              : match;
            const pointsEarned = user && effectivePoolId ? getPredictionPoints(effectivePoolId, user.id, match.id) : undefined;
            return (
              <div key={match.id} className="min-w-0">
                <MatchCard
                  match={matchWithResult}
                  showPrediction={!!(user && hasPool)}
                  userPrediction={userPred}
                  pointsEarned={pointsEarned}
                  showPrivacyHint={userPools.find(p => p.id === effectivePoolId)?.predictionsPrivate !== false}
                  onPredict={(matchId, homeScore, awayScore) => {
                    if (!user || !effectivePoolId) return;
                    savePrediction(effectivePoolId, user.id, matchId, homeScore, awayScore);
                    const home = match.homeTeam.displayName ?? match.homeTeam.name;
                    const away = match.awayTeam.displayName ?? match.awayTeam.name;
                    toast.success('Palpite registrado!', {
                      description: `${home} ${homeScore} x ${awayScore} ${away}`,
                    });
                  }}
                />
              </div>
            );
          })}
          {upcomingMatches.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white/5 rounded-2xl border border-white/10">
              <p className="text-white/80 font-medium">Nenhum jogo disponível para palpite</p>
              <p className="text-white/50 text-sm mt-1">Os próximos jogos aparecerão aqui conforme as rodadas forem divulgadas</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
