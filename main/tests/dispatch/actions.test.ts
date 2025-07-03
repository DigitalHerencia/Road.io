import { describe, it, expect, vi } from 'vitest'
import {
  getDispatchKPIsAction,
  getExceptionRateAction
} from '@/lib/actions/dispatch'
import * as fetchers from '@/lib/fetchers/dispatch'

vi.mock('@/lib/fetchers/dispatch')

describe('dispatch actions validation', () => {
  it('parses orgId before calling fetchers', async () => {
    vi.mocked(fetchers.fetchDispatchKPIs).mockResolvedValue({ loads: 1 })
    await getDispatchKPIsAction({ orgId: 1 })
    expect(fetchers.fetchDispatchKPIs).toHaveBeenCalledWith(1)
  })

  it('throws on invalid orgId', async () => {
    await expect(getExceptionRateAction({ orgId: -1 } as any)).rejects.toThrow()
  })
})
