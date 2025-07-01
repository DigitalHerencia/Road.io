import { describe, it, expect, vi } from 'vitest';
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }));
import { calculateOnTimeRate, calcCostPerMile } from '../../src/lib/fetchers/analytics';

describe('calculateOnTimeRate', () => {
  it('returns 0 when total is 0', () => {
    expect(calculateOnTimeRate(0, 5)).toBe(0);
  });

  it('calculates rate correctly', () => {
    expect(calculateOnTimeRate(10, 8)).toBeCloseTo(0.8, 2);
  });
});

describe('calcCostPerMile', () => {
  it('returns 0 when miles are 0', () => {
    expect(calcCostPerMile(1000, 0)).toBe(0);
  });

  it('calculates cost per mile', () => {
    expect(calcCostPerMile(10000, 500)).toBeCloseTo(20, 2);
  });
});
