"use client"

import { useEffect, useState } from 'react'
import LoadSummary from './LoadSummary'
import MobileDriverMessageForm from './MobileDriverMessageForm'
import DispatchKPIDashboard from './DispatchKPIDashboard'
import { searchLoads } from '@/lib/fetchers/loads'
import { getDriverLocationsAction, getDispatchKPIsAction } from '@/lib/actions/dispatch'
import type { Load } from '../types'
import type { DriverLocation, DispatchKPIs } from '@/lib/fetchers/dispatch'

interface Props {
  orgId: number
}

export default function MobileDispatchPanel({ orgId }: Props) {
  const [loads, setLoads] = useState<Load[]>([])
  const [locations, setLocations] = useState<DriverLocation[]>([])
  const [kpis, setKpis] = useState<DispatchKPIs | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      const [k, locs] = await Promise.all([
        getDispatchKPIsAction({ orgId }),
        getDriverLocationsAction({ orgId })
      ])
      const activeLoads = await searchLoads(orgId, { limit: 10 })
      if (active) {
        setKpis(k)
        setLoads(activeLoads)
        setLocations(locs)
      }
    }
    load()
    const id = setInterval(load, 5000)
    return () => { active = false; clearInterval(id) }
  }, [orgId])

  return (
    <div className="space-y-4 p-4">
      {kpis && <DispatchKPIDashboard orgId={orgId} />}
      <div className="space-y-2">
        <h2 className="font-medium">Active Loads</h2>
        {loads.map(l => (
          <LoadSummary key={l.id} load={l} />
        ))}
      </div>
      <div className="space-y-2">
        <h2 className="font-medium">Driver Locations</h2>
        <ul className="text-sm space-y-1">
          {locations.map(loc => (
            <li key={loc.driverId}>{loc.driverId}: {loc.address ?? `${loc.lat}, ${loc.lng}`}</li>
          ))}
        </ul>
      </div>
      {locations[0] && <MobileDriverMessageForm driverId={locations[0].driverId} />}
    </div>
  )
}
