/**
 * Busca automática de resultados do Brasileirão via TheSportsDB API (gratuita).
 * Endpoint: eventsseason.php - retorna jogos da temporada com placares.
 */

const API_BASE = 'https://www.thesportsdb.com/api/v1/json';
const API_KEY = '3'; // Chave gratuita
const LEAGUE_ID = '4351'; // Brazilian Serie A
const SEASON = '2026';

/** Mapeamento de nomes da API para nomes dos times no app */
const API_TEAM_TO_OURS: Record<string, string> = {
  'Atlético Mineiro': 'Atlético-MG',
  'Bragantino': 'Red Bull Bragantino',
  'Remo': 'Clube do Remo',
  'Athletico Paranaense': 'Athletico-PR',
};

function normalizeTeam(name: string): string {
  const mapped = API_TEAM_TO_OURS[name];
  return mapped ?? name;
}

export interface ApiEvent {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  intRound: string;
  strStatus: string;
}

export interface FetchedResult {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

import type { Match } from '@/types';
import { matches as staticMatches } from '@/data/matches';

/** Retorna o matchId do nosso sistema baseado em round + home + away */
function findMatchId(
  round: number,
  homeApi: string,
  awayApi: string,
  matchesByRound: Map<number, Array<{ id: string; home: string; away: string }>>
): string | null {
  const roundMatches = matchesByRound.get(round);
  if (!roundMatches) return null;

  const homeNorm = normalizeTeam(homeApi);
  const awayNorm = normalizeTeam(awayApi);

  const match = roundMatches.find(
    m =>
      (m.home === homeNorm || m.home.toLowerCase().includes(homeNorm.toLowerCase())) &&
      (m.away === awayNorm || m.away.toLowerCase().includes(awayNorm.toLowerCase()))
  );
  return match?.id ?? null;
}

/** Constrói mapa de jogos por rodada para matching */
function buildMatchesLookup(matchList: Match[]): Map<number, Array<{ id: string; home: string; away: string }>> {
  const byRound = new Map<number, Array<{ id: string; home: string; away: string }>>();
  const list = Array.isArray(matchList) ? matchList : [];
  list.forEach((m) => {
    const roundList = byRound.get(m.round) ?? [];
    roundList.push({
      id: m.id,
      home: m.homeTeam.name,
      away: m.awayTeam.name
    });
    byRound.set(m.round, roundList);
  });
  return byRound;
}

/** Set de IDs de jogos da API (api-xxx) para matching direto */
function buildApiIdsSet(matchList: Match[]): Set<string> {
  return new Set((matchList || []).map((m) => m.id).filter((id) => id.startsWith('api-')));
}

/**
 * Busca resultados da API. Aceita matches opcional para mapear corretamente:
 * - Se matches contiver api-xxx: usa esse id para eventos da API
 * - Caso contrário: mapeia por round+home+away (estático)
 */
export async function fetchMatchResultsFromApi(matches?: Match[]): Promise<FetchedResult[]> {
  if (typeof fetch !== 'function') return [];
  try {
    const url = `${API_BASE}/${API_KEY}/eventsseason.php?id=${LEAGUE_ID}&s=${SEASON}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API retornou ${res.status}`);
    const data = await res.json();
    const events: ApiEvent[] = Array.isArray(data?.events) ? data.events : [];
    const matchList = matches && matches.length > 0 ? matches : staticMatches;
    const lookup = buildMatchesLookup(matchList);
    const apiIds = buildApiIdsSet(matchList);
    const results: FetchedResult[] = [];

    for (const ev of events) {
      if (ev.strStatus !== 'Match Finished') continue;
      const home = ev.intHomeScore;
      const away = ev.intAwayScore;
      if (home == null || away == null) continue;

      const h = parseInt(String(home), 10);
      const a = parseInt(String(away), 10);
      if (Number.isNaN(h) || Number.isNaN(a)) continue;

      // Preferir id api-xxx quando usamos jogos da API
      const apiId = `api-${ev.idEvent}`;
      const matchId = apiIds.has(apiId)
        ? apiId
        : findMatchId(parseInt(ev.intRound, 10), ev.strHomeTeam, ev.strAwayTeam, lookup);

      if (matchId) {
        results.push({ matchId, homeScore: h, awayScore: a });
      }
    }

    return results;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro desconhecido';
    const isNetwork = typeof navigator !== 'undefined' && !navigator.onLine;
    const isFetchFail = /failed to fetch|network error|load failed/i.test(msg);
    const friendlyMsg = isNetwork || isFetchFail
      ? 'Sem conexão. Verifique sua internet e tente novamente.'
      : `Falha de conexão com a API: ${msg}`;
    throw new Error(friendlyMsg);
  }
}
