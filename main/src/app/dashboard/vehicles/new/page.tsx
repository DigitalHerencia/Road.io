import VehicleForm from '@/features/vehicles/VehicleForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewVehiclePage() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Register Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm />
        </CardContent>
      </Card>
    </div>
  )
}
