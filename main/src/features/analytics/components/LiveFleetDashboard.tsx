'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  getLiveFleetStatusAction,
  getPerformanceAlertsAction,
} from '@/lib/actions/analytics'
import type { LiveFleetStatus, PerformanceAlert } from '@/lib/fetchers/analytics'

interface Props {
  orgId: number
}

export default function LiveFleetDashboard({ orgId }: Props) {
  const [status, setStatus] = useState<LiveFleetStatus | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      const [s, a] = await Promise.all([
        getLiveFleetStatusAction({ orgId }),
        getPerformanceAlertsAction({ orgId }),
      ])
      if (active) {
        setStatus(s)
        setAlerts(a)
      }
    }

    load()
    const id = setInterval(load, 5000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [orgId])

  if (!status) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Loads</CardTitle>
            <CardDescription>Loads currently in progress</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{status.activeLoads}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Available Drivers</CardTitle>
            <CardDescription>Drivers ready for assignment</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{status.availableDrivers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Vehicles</CardTitle>
            <CardDescription>Vehicles operational</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{status.activeVehicles}</CardContent>
        </Card>
      </div>
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Performance Alerts</h3>
          <ul className="list-disc list-inside space-y-1">
            {alerts.map((alert, idx) => (
              <li
                key={idx}
                className={
                  alert.level === 'critical'
                    ? 'text-destructive'
                    : alert.level === 'warning'
                    ? 'text-yellow-600'
                    : ''
                }
              >
                {alert.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
