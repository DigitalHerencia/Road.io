"use client"

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  getDispatchKPIsAction,
} from '@/lib/actions/dispatch'
import type { DispatchKPIs } from '@/lib/fetchers/dispatch'

interface Props {
  orgId: number
}

export default function DispatchKPIDashboard({ orgId }: Props) {
  const [kpis, setKpis] = useState<DispatchKPIs | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      const data = await getDispatchKPIsAction({ orgId })
      if (active) setKpis(data)
    }
    load()
    const id = setInterval(load, 5000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [orgId])

  if (!kpis) return <div>Loading...</div>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Active Loads</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{kpis.activeLoads}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Completed Loads</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{kpis.completedLoads}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>On-Time Rate</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{(kpis.onTimeRate * 100).toFixed(0)}%</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Exception Rate</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{(kpis.exceptionRate * 100).toFixed(0)}%</CardContent>
      </Card>
    </div>
  )
}

