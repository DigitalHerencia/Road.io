import { recordVehicleMaintenance } from '@/lib/actions/vehicles'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  vehicleId: number
}

export default function MaintenanceForm({ vehicleId }: Props) {
  return (
    <form
      action={async (formData: FormData) => {
        const maintenanceDate = formData.get('maintenanceDate') as string
        const mileage = formData.get('mileage') as string
        const vendor = formData.get('vendor') as string
        const description = formData.get('description') as string
        const cost = formData.get('cost') as string
        await recordVehicleMaintenance(vehicleId, {
          maintenanceDate: new Date(maintenanceDate),
          mileage: mileage ? Number(mileage) : undefined,
          vendor: vendor || undefined,
          description: description || undefined,
          cost: cost ? Number(cost) : undefined,
        })
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="maintenanceDate">Date</Label>
        <Input id="maintenanceDate" name="maintenanceDate" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mileage">Mileage</Label>
        <Input id="mileage" name="mileage" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vendor">Vendor</Label>
        <Input id="vendor" name="vendor" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea id="description" name="description" className="w-full border rounded p-2 h-20" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cost">Cost (cents)</Label>
        <Input id="cost" name="cost" type="number" />
      </div>
      <Button type="submit" className="w-full">Record Maintenance</Button>
    </form>
  )
}
