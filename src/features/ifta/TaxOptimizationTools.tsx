import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { getTaxOptimizationAction } from '@/lib/actions/ifta'

interface Props {
  orgId: number
}

export default async function TaxOptimizationTools({ orgId }: Props) {
  const states = await getTaxOptimizationAction({ orgId })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax-Efficient States</CardTitle>
        <CardDescription>Top jurisdictions with lowest fuel tax rates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {states.map(s => (
          <div key={s.state} className="flex justify-between text-sm">
            <span>{s.state}</span>
            <span>{(s.rate / 100).toFixed(2)} /gal</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
