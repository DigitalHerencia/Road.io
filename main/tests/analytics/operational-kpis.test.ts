import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }));
vi.mock('../../src/lib/fetchers/analytics');
import OperationalKPIs from '../../src/features/analytics/components/OperationalKPIs';
import * as fetchers from '../../src/lib/fetchers/analytics';

describe('OperationalKPIs component', () => {
  it('renders KPI cards', async () => {
    vi.mocked(fetchers.fetchOnTimeDeliveryRate).mockResolvedValue({
      totalDelivered: 10,
      onTimeDeliveries: 8,
      onTimeRate: 0.8,
    });
    vi.mocked(fetchers.fetchCostPerMile).mockResolvedValue({
      totalCost: 10000,
      totalMiles: 500,
      costPerMile: 20,
    });

    const element = await OperationalKPIs({ orgId: 1 });
    const html = renderToString(element);
    expect(html).toContain('On-time Delivery');
    expect(html).toContain('Cost per Mile');
  });
});
