import { describe, it, expect, vi } from 'vitest';
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }));
import { calculateUtilizationRate } from '../../src/lib/fetchers/analytics';

describe('calculateUtilizationRate', () => {
  it('returns 0 when total is 0', () => {
    expect(calculateUtilizationRate(0, 5)).toBe(0);
  });

  it('calculates rate correctly', () => {
    expect(calculateUtilizationRate(10, 5)).toBeCloseTo(0.5, 2);
  });
});
