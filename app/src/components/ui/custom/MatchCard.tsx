import { useState } from 'react';
import type { Match } from '@/types';
import { TeamLogo } from './TeamLogo';
import { Calendar, MapPin } from 'lucide-react';

export interface UserPrediction {
  homeScore: number;
  awayScore: number;
}

interface MatchCardProps {
  match: Match;
  showPrediction?: boolean;
  onPredict?: (matchId: string, homeScore: number, awayScore: number) => void;
  userPrediction?: UserPrediction;
  /** Pontos obtidos no jogo (quando já há resultado) */
  pointsEarned?: number;
  compact?: boolean;
}

const BET_CLOSE_MINUTES = 5;
const MS_PER_MINUTE = 60 * 1000;

/** Verifica se ainda é possível apostar (até 5 min antes do jogo) */
function canPlaceBet(match: Match): boolean {
  const matchDate = match.date instanceof Date ? match.date : new Date(match.date);
  const cutoff = matchDate.getTime() - BET_CLOSE_MINUTES * MS_PER_MINUTE;
  return Date.now() < cutoff;
}

export const MatchCard = ({ match, showPrediction = false, onPredict, userPrediction, pointsEarned, compact = false }: MatchCardProps) => {
  const [homeScore, setHomeScore] = useState<number | ''>('');
  const [awayScore, setAwayScore] = useState<number | ''>('');
  const betsOpen = canPlaceBet(match);

  const handlePredict = () => {
    if (onPredict && betsOpen && homeScore !== '' && awayScore !== '') {
      onPredict(match.id, Number(homeScore), Number(awayScore));
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (compact) {
    const homeName = match.homeTeam.displayName ?? match.homeTeam.name;
    const awayName = match.awayTeam.displayName ?? match.awayTeam.name;
    return (
      <div className="bg-white rounded-xl shadow-md p-3 min-w-[200px] border border-gray-100 hover:scale-[1.02] hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <TeamLogo teamName={match.homeTeam.name} size="sm" />
            <span className="font-semibold text-sm truncate" title={match.homeTeam.name}>{homeName}</span>
          </div>
          <span className="text-gray-400 text-xs flex-shrink-0">vs</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm truncate" title={match.awayTeam.name}>{awayName}</span>
            <TeamLogo teamName={match.awayTeam.name} size="sm" />
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          {formatDate(match.date)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{formatDate(match.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{match.stadium}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <TeamLogo teamName={match.homeTeam.name} size="lg" />
          </div>
          <span className="font-bold text-sm text-center truncate w-full px-0.5" title={match.homeTeam.name}>
            {match.homeTeam.displayName ?? match.homeTeam.name}
          </span>
        </div>

        <div className="flex flex-col items-center flex-shrink-0">
          {match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined ? (
            <>
              <span className="text-2xl font-bold text-gray-800">
                {match.homeScore} x {match.awayScore}
              </span>
              <span className="text-xs text-gray-500 mt-1">Placar final</span>
            </>
          ) : (
            <>
              <span className="text-xl font-bold text-gray-400">vs</span>
              <span className="text-xs text-gray-400 mt-1">Rodada {match.round}</span>
              <span className="text-sm font-semibold text-blue-600 mt-1">
                às {formatTime(match.date instanceof Date ? match.date : new Date(match.date))}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <TeamLogo teamName={match.awayTeam.name} size="lg" />
          </div>
          <span className="font-bold text-sm text-center truncate w-full px-0.5" title={match.awayTeam.name}>
            {match.awayTeam.displayName ?? match.awayTeam.name}
          </span>
        </div>
      </div>

      {showPrediction && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          {userPrediction ? (
            <div className={`text-center py-4 px-3 rounded-xl border ${
              pointsEarned !== undefined
                ? pointsEarned >= 5
                  ? 'bg-green-50 border-green-200'
                  : pointsEarned >= 3
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <p className={pointsEarned !== undefined ? 'font-medium' : 'text-green-700 font-medium'}>
                {pointsEarned !== undefined ? 'Seu palpite' : 'Palpite registrado!'}
              </p>
              <p className={`text-2xl font-bold mt-2 ${
                pointsEarned !== undefined ? 'text-gray-800' : 'text-green-800'
              }`}>
                {userPrediction.homeScore} x {userPrediction.awayScore}
              </p>
              {match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined && (
                <p className="text-sm text-gray-600 mt-1">
                  Resultado: {match.homeScore} x {match.awayScore}
                  {pointsEarned !== undefined && (
                    <span className={`font-bold ml-1 ${
                      pointsEarned >= 5 ? 'text-green-600' : pointsEarned >= 3 ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      • {pointsEarned} pts
                    </span>
                  )}
                </p>
              )}
              {pointsEarned === undefined && (
                <p className="text-sm text-green-600 mt-1">Boa sorte!</p>
              )}
            </div>
          ) : betsOpen ? (
            <>
              <div className="flex items-center justify-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="-"
                />
                <span className="text-xl font-bold text-gray-400">x</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="-"
                />
              </div>
              <button
                onClick={handlePredict}
                disabled={homeScore === '' || awayScore === ''}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fazer Palpite
              </button>
            </>
          ) : (
            <div className="text-center py-4 px-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-700 font-medium">Palpites encerrados</p>
              <p className="text-sm text-amber-600 mt-1">Fecham 5 minutos antes do jogo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
