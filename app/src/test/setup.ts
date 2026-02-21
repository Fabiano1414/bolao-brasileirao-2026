import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock fetch para evitar chamadas reais à API nos testes
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ events: [] }),
  } as Response)
);
