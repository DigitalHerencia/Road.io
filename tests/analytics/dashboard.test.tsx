import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }));
vi.mock('../../src/lib/fetchers/analytics');
import FleetUtilization from '../../src/features/analytics/components/FleetUtilization';
import * as fetchers from '../../src/lib/fetchers/analytics';

describe('FleetUtilization component', () => {
  it('renders metrics', async () => {
    vi.mocked(fetchers.fetchVehicleUtilization).mockResolvedValue({
      totalVehicles: 10,
      activeVehicles: 5,
      utilizationRate: 0.5,
    });
    vi.mocked(fetchers.fetchCapacityUtilization).mockResolvedValue({
      totalCapacity: 400000,
      usedCapacity: 100000,
      utilizationRate: 0.25,
    });

    const element = await FleetUtilization({ orgId: 1 });
    const html = renderToString(element);
    expect(html).toContain('Vehicle Utilization');
    expect(html).toContain('Capacity Utilization');
  });
});
