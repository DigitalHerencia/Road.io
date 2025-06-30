import { requirePermission } from '@/lib/rbac'
import { getTripsByOrg } from '@/lib/fetchers/ifta'
import { recordTripAction } from '@/lib/actions/ifta'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default async function TripsPage() {
  const user = await requirePermission('org:driver:record_trip')
  const trips = await getTripsByOrg(user.orgId)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Record Trip</CardTitle>
            <CardDescription>Manual trip entry</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={recordTripAction} className="space-y-4">
              <input type="hidden" name="driverId" value={user.id} />
              <div className="space-y-2">
                <label htmlFor="loadId" className="text-sm font-medium">Load ID</label>
                <Input id="loadId" name="loadId" type="number" />
              </div>
              <div className="space-y-2">
                <label htmlFor="startLat" className="text-sm font-medium">Start Latitude</label>
                <Input id="startLat" name="startLat" type="number" step="any" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="startLng" className="text-sm font-medium">Start Longitude</label>
                <Input id="startLng" name="startLng" type="number" step="any" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="startState" className="text-sm font-medium">Start State</label>
                <Input id="startState" name="startState" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="endLat" className="text-sm font-medium">End Latitude</label>
                <Input id="endLat" name="endLat" type="number" step="any" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="endLng" className="text-sm font-medium">End Longitude</label>
                <Input id="endLng" name="endLng" type="number" step="any" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="endState" className="text-sm font-medium">End State</label>
                <Input id="endState" name="endState" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="startedAt" className="text-sm font-medium">Start Time</label>
                <Input id="startedAt" name="startedAt" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="endedAt" className="text-sm font-medium">End Time</label>
                <Input id="endedAt" name="endedAt" type="datetime-local" required />
              </div>
              <Button type="submit">Record Trip</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trips</CardTitle>
            <CardDescription>Recent entries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {trips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trips recorded</p>
            ) : (
              trips.map(trip => (
                <div key={trip.id} className="text-sm">
                  Trip #{trip.id} - {trip.distance ?? 0} miles ({trip.isInterstate ? 'Interstate' : 'Intrastate'})
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
