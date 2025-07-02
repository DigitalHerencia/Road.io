import React from 'react'
import {
  fetchGrossMarginByLoad,
  fetchDriverProfitability,
} from '@/lib/fetchers/analytics'

interface Props {
  orgId: number
}

export default async function ProfitMetrics({ orgId }: Props) {
  const [loads, drivers] = await Promise.all([
    fetchGrossMarginByLoad(orgId),
    fetchDriverProfitability(orgId),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Gross Margin by Load</h2>
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr>
              <th>Load #</th>
              <th>Revenue ($)</th>
              <th>Fuel Cost ($)</th>
              <th>Gross Margin ($)</th>
            </tr>
          </thead>
          <tbody>
            {loads.map(l => (
              <tr key={l.loadId} className="border-t">
                <td>{l.loadNumber}</td>
                <td>{(l.revenue / 100).toFixed(2)}</td>
                <td>{(l.fuelCost / 100).toFixed(2)}</td>
                <td>{(l.grossMargin / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Driver Profitability</h2>
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr>
              <th>Driver</th>
              <th>Revenue ($)</th>
              <th>Fuel Cost ($)</th>
              <th>Profit ($)</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.driverId} className="border-t">
                <td>{d.driverName ?? d.driverId}</td>
                <td>{(d.revenue / 100).toFixed(2)}</td>
                <td>{(d.fuelCost / 100).toFixed(2)}</td>
                <td>{(d.profit / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
