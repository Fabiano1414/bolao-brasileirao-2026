import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { PoolsProvider, usePoolsContext, POINTS_EXACT, POINTS_RESULT } from './PoolsContext';
import { MatchesProvider } from './MatchesContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MatchesProvider>
      <PoolsProvider>{children}</PoolsProvider>
    </MatchesProvider>
  );
}

describe('PoolsContext', () => {
  it('retorna pools iniciais', () => {
    const { result } = renderHook(() => usePoolsContext(), { wrapper });
    expect(result.current.pools).toBeDefined();
    expect(Array.isArray(result.current.pools)).toBe(true);
  });

  it('getGlobalLeaderboard retorna array', () => {
    const { result } = renderHook(() => usePoolsContext(), { wrapper });
    const leaderboard = result.current.getGlobalLeaderboard(10);
    expect(Array.isArray(leaderboard)).toBe(true);
  });

  it('getUserPredictionHistory retorna array vazio para usuário sem palpites', () => {
    const { result } = renderHook(() => usePoolsContext(), { wrapper });
    const history = result.current.getUserPredictionHistory('user-inexistente');
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBe(0);
  });
});

describe('calculatePointsForPrediction', () => {
  it('POINTS_EXACT e POINTS_RESULT estão definidos', () => {
    expect(POINTS_EXACT).toBe(5);
    expect(POINTS_RESULT).toBe(3);
  });
});
