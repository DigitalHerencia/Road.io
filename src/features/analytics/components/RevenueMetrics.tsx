import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { fetchLoadRevenue, fetchSeasonalRevenue } from '@/lib/fetchers/analytics'

interface Props {
  orgId: number
}

export default async function RevenueMetrics({ orgId }: Props) {
  const [loads, seasonal] = await Promise.all([
    fetchLoadRevenue(orgId),
    fetchSeasonalRevenue(orgId),
  ])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Load Revenue</CardTitle>
          <CardDescription>Revenue by delivered load</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Load</th>
                <th className="text-right">Revenue ($)</th>
              </tr>
            </thead>
            <tbody>
              {loads.map(l => (
                <tr key={l.id}>
                  <td>{l.loadNumber}</td>
                  <td className="text-right">{(l.revenue / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue totals</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Month</th>
                <th className="text-right">Revenue ($)</th>
              </tr>
            </thead>
            <tbody>
              {seasonal.map(s => (
                <tr key={s.period}>
                  <td>{s.period}</td>
                  <td className="text-right">{(s.totalRevenue / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
