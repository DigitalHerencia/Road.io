import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DriverProfile } from '@/features/drivers/types'

export default function DriverSummary({ driver }: { driver: DriverProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{driver.name || 'Unnamed Driver'}</CardTitle>
        <CardDescription>{driver.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><strong>License:</strong> {driver.licenseNumber || 'N/A'}</p>
        <p><strong>License Expiry:</strong> {driver.licenseExpiry ? driver.licenseExpiry.toLocaleDateString() : 'N/A'}</p>
        {driver.dotNumber && <p><strong>DOT:</strong> {driver.dotNumber}</p>}
        <p><strong>Status:</strong> {driver.status.replace('_', ' ')}</p>
      </CardContent>
    </Card>
  )
}
