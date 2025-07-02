import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { fetchAccidentRate, fetchSafetyIncidents } from '@/lib/fetchers/analytics'

interface Props {
  orgId: number
}

export default async function SafetyMetrics({ orgId }: Props) {
  const [rate, incidents] = await Promise.all([
    fetchAccidentRate(orgId),
    fetchSafetyIncidents(orgId),
  ])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Accident Rate</CardTitle>
          <CardDescription>Accidents per million miles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Accidents</span>
            <span>{rate.accidents}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Miles</span>
            <span>{rate.totalMiles}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Accidents / 1M Miles</span>
            <span>{rate.accidentsPerMillionMiles.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>Last 5 accident reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incidents reported</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {incidents.map((i) => (
                <li key={i.id}>
                  {new Date(i.occurredAt).toLocaleDateString()} - {i.description ?? 'No details'}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

