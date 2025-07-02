import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { fetchFuelCost, fetchTotalCostOfOwnership } from '@/lib/fetchers/analytics'

interface Props {
  orgId: number
}

export default async function CostAnalysis({ orgId }: Props) {
  const [fuel, tco] = await Promise.all([
    fetchFuelCost(orgId),
    fetchTotalCostOfOwnership(orgId),
  ])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Fuel Cost</CardTitle>
          <CardDescription>Total fuel expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between font-medium">
            <span>Total Fuel Cost ($)</span>
            <span>{(fuel.totalFuelCost / 100).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Cost of Ownership</CardTitle>
          <CardDescription>Overall operating expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Load Cost ($)</span>
            <span>{(tco.loadCost / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Fuel Cost ($)</span>
            <span>{(tco.fuelCost / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total Cost ($)</span>
            <span>{(tco.totalCost / 100).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
