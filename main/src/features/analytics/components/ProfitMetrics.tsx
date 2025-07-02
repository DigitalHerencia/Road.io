import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { fetchGrossMarginByLoad, fetchDriverProfitability } from '@/lib/fetchers/analytics'

interface Props {
  orgId: number
}

export default async function ProfitMetrics({ orgId }: Props) {
  const [loadMargins, driverProfit] = await Promise.all([
    fetchGrossMarginByLoad(orgId),
    fetchDriverProfitability(orgId),
  ])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gross Margin by Load</CardTitle>
          <CardDescription>Revenue minus estimated fuel cost</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Load</th>
                <th className="text-right">Revenue ($)</th>
                <th className="text-right">Fuel Cost ($)</th>
                <th className="text-right">Margin ($)</th>
              </tr>
            </thead>
            <tbody>
              {loadMargins.map((l) => (
                <tr key={l.id}>
                  <td>{l.loadNumber}</td>
                  <td className="text-right">{(l.revenue / 100).toFixed(2)}</td>
                  <td className="text-right">{(l.fuelCost / 100).toFixed(2)}</td>
                  <td className="text-right">{(l.grossMargin / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Driver Profitability</CardTitle>
          <CardDescription>Total revenue minus fuel cost</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Driver</th>
                <th className="text-right">Revenue ($)</th>
                <th className="text-right">Fuel Cost ($)</th>
                <th className="text-right">Profit ($)</th>
              </tr>
            </thead>
            <tbody>
              {driverProfit.map((d) => (
                <tr key={d.driverId}>
                  <td>{d.driverName ?? `Driver ${d.driverId}`}</td>
                  <td className="text-right">{(d.revenue / 100).toFixed(2)}</td>
                  <td className="text-right">{(d.fuelCost / 100).toFixed(2)}</td>
                  <td className="text-right">{(d.profit / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
