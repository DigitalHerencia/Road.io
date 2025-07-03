import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { getFuelEfficiencyAction, getRouteEfficiencyAction } from '@/lib/actions/ifta'

interface Props {
  orgId: number
}

export default async function FuelRouteAnalytics({ orgId }: Props) {
  const [fuel, route] = await Promise.all([
    getFuelEfficiencyAction({ orgId }),
    getRouteEfficiencyAction({ orgId }),
  ])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Fuel Efficiency</CardTitle>
          <CardDescription>Average MPG across all vehicles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Miles</span>
            <span>{fuel.totalMiles}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Gallons</span>
            <span>{fuel.totalGallons}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>MPG</span>
            <span>{fuel.mpg.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Route Efficiency</CardTitle>
          <CardDescription>Average distance traveled per trip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Trip Count</span>
            <span>{route.tripCount}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Avg Distance (mi)</span>
            <span>{route.averageDistance}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
