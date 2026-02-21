/**
 * API de jogos do Brasileirão - TheSportsDB (gratuita).
 * Retorna calendário completo e resultados atualizados.
 */

import type { Match, Team } from '@/types';
import { teams, getTeamByName } from '@/data/teams';

const API_BASE = 'https://www.thesportsdb.com/api/v1/json';
const API_KEY = '3';
const LEAGUE_ID = '4351'; // Brazilian Serie A
const SEASON = '2026';

const API_TEAM_TO_OURS: Record<string, string> = {
  'Atlético Mineiro': 'Atlético-MG',
  'Bragantino': 'Red Bull Bragantino',
  'Remo': 'Clube do Remo',
  'Athletico Paranaense': 'Athletico-PR',
};

function toOurTeamName(apiName: string): string {
  return API_TEAM_TO_OURS[apiName] ?? apiName;
}

function findTeam(apiName: string): Team | undefined {
  const name = toOurTeamName(apiName);
  return getTeamByName(name) ?? teams.find(
    t => t.name.toLowerCase().includes(name.toLowerCase())
  );
}

interface ApiEvent {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  intRound: string;
  strStatus: string;
  strVenue?: string;
  dateEvent?: string;
  strTime?: string;
  strTimestamp?: string;
}

/** Converte evento da API para Match do app */
function eventToMatch(ev: ApiEvent): Match | null {
  const homeTeam = findTeam(ev.strHomeTeam);
  const awayTeam = findTeam(ev.strAwayTeam);
  if (!homeTeam || !awayTeam) return null;

  let date: Date;
  if (ev.strTimestamp) {
    date = new Date(ev.strTimestamp);
  } else if (ev.dateEvent && ev.strTime) {
    date = new Date(`${ev.dateEvent}T${ev.strTime}`);
  } else {
    date = new Date();
  }

  const round = parseInt(ev.intRound, 10) || 1;
  const status = ev.strStatus === 'Match Finished'
    ? 'finished'
    : ev.strStatus?.toLowerCase().includes('live')
      ? 'live'
      : 'scheduled';

  const homeScore = ev.intHomeScore != null ? parseInt(String(ev.intHomeScore), 10) : undefined;
  const awayScore = ev.intAwayScore != null ? parseInt(String(ev.intAwayScore), 10) : undefined;

  return {
    id: `api-${ev.idEvent}`,
    homeTeam,
    awayTeam,
    date,
    stadium: ev.strVenue ?? '',
    round,
    status: status as 'scheduled' | 'live' | 'finished',
    ...(homeScore !== undefined && { homeScore }),
    ...(awayScore !== undefined && { awayScore }),
  };
}

/** Busca calendário completo da temporada (todas as rodadas) */
export async function fetchMatchesFromApi(): Promise<Match[]> {
  if (typeof fetch !== 'function') return [];
  try {
    const url = `${API_BASE}/${API_KEY}/eventsseason.php?id=${LEAGUE_ID}&s=${SEASON}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const events: ApiEvent[] = Array.isArray(data?.events) ? data.events : [];
    const matches: Match[] = [];
    for (const ev of events) {
      const m = eventToMatch(ev);
      if (m) matches.push(m);
    }
    return matches.sort((a, b) => {
      const tA = (a.date instanceof Date ? a.date : new Date(a.date)).getTime();
      const tB = (b.date instanceof Date ? b.date : new Date(b.date)).getTime();
      return tA - tB;
    });
  } catch {
    return [];
  }
}
