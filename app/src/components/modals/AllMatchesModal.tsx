import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MatchCard } from '@/components/ui/custom/MatchCard';
import { useMatchesContext } from '@/context/MatchesContext';
import { useAuth } from '@/hooks/useAuth';
import { usePoolsContext } from '@/context/PoolsContext';
import { Calendar, RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AllMatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getRoundDateLabel(matches: { date: Date }[]): string {
  if (matches.length === 0) return '';
  const dates = matches.map(m => (m.date instanceof Date ? m.date : new Date(m.date)));
  const min = new Date(Math.min(...dates.map(d => d.getTime())));
  const max = new Date(Math.max(...dates.map(d => d.getTime())));
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  return min.getTime() === max.getTime() ? fmt(min) : `${fmt(min)} a ${fmt(max)}`;
}

export const AllMatchesModal = ({ isOpen, onClose }: AllMatchesModalProps) => {
  const { getUpcomingMatchesByRound, getCurrentRound, isLoading, refreshMatches } = useMatchesContext();
  const { user } = useAuth();
  const { getUserPoolsList, savePrediction, getUserPrediction, getMatchResult, getPredictionPoints } = usePoolsContext();

  const [selectedPoolId, setSelectedPoolId] = useState('');
  const now = Date.now();
  const matchesByRound = getUpcomingMatchesByRound(now);
  const sortedRounds = Array.from(matchesByRound.keys()).sort((a, b) => a - b);
  const currentRound = getCurrentRound(now);
  const userPools = user ? getUserPoolsList(user.id) : [];
  const hasPool = userPools.length > 0;
  const effectivePoolId = selectedPoolId || (hasPool ? userPools[0].id : '');
  const selectedPool = userPools.find(p => p.id === effectivePoolId);

  useEffect(() => {
    if (isOpen && userPools.length > 0 && !selectedPoolId) {
      setSelectedPoolId(userPools[0].id);
    }
  }, [isOpen, userPools.length, selectedPoolId, userPools]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-600 px-3 py-1 rounded-full text-sm font-medium mb-2">
                <Calendar className="w-4 h-4" />
                Rodada {currentRound}
              </div>
              <DialogTitle className="text-2xl font-bold">Todos os Jogos</DialogTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => refreshMatches()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </DialogHeader>

        {user && hasPool && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Palpites no bolão:</span>
            <Select value={effectivePoolId} onValueChange={setSelectedPoolId}>
              <SelectTrigger className="w-[260px]">
                <Trophy className="w-4 h-4 mr-2 text-amber-500" />
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
        )}

        <div className="mt-4 space-y-8">
          {sortedRounds.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-xl">
              <p className="text-gray-600 font-medium">Nenhum jogo nos próximos dias</p>
              <p className="text-gray-500 text-sm mt-1">Aguarde a divulgação da próxima rodada</p>
            </div>
          ) : (
            sortedRounds.map(round => {
              const roundMatches = matchesByRound.get(round) ?? [];
              const dateLabel = getRoundDateLabel(roundMatches);
              return (
                <div key={round}>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Rodada {round}
                    {dateLabel && <span className="text-gray-500 font-medium ml-2">— {dateLabel}</span>}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {roundMatches.map(match => {
                      const result =
                        getMatchResult(match.id) ??
                        (match.homeScore != null && match.awayScore != null
                          ? { homeScore: match.homeScore, awayScore: match.awayScore }
                          : undefined);
                      const matchWithResult = result
                        ? { ...match, status: 'finished' as const, homeScore: result.homeScore, awayScore: result.awayScore }
                        : match;
                      const userPred = user && effectivePoolId
                        ? getUserPrediction(effectivePoolId, user.id, match.id)
                        : undefined;
                      const pointsEarned = user && effectivePoolId ? getPredictionPoints(effectivePoolId, user.id, match.id) : undefined;
                      return (
                        <MatchCard
                          key={match.id}
                          match={matchWithResult}
                          showPrediction={!!(user && hasPool)}
                          userPrediction={userPred}
                          pointsEarned={pointsEarned}
                          showPrivacyHint={selectedPool?.predictionsPrivate !== false}
                          onPredict={
                            user && effectivePoolId
                              ? (matchId, homeScore, awayScore) => {
                                  savePrediction(effectivePoolId, user.id, matchId, homeScore, awayScore);
                                }
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
