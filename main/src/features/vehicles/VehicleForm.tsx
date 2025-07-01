import { createVehicle, updateVehicle } from '@/lib/actions/vehicles'
import { Vehicle } from '@/lib/schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface VehicleFormProps {
  vehicle?: Vehicle
}

export default function VehicleForm({ vehicle }: VehicleFormProps) {
  const action = vehicle ? updateVehicle.bind(null, vehicle.id) : createVehicle
  return (
    <form action={action} className="space-y-4" encType="multipart/form-data">
      <div className="space-y-2">
        <Label htmlFor="vin">VIN</Label>
        <Input id="vin" name="vin" defaultValue={vehicle?.vin} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="licensePlate">License Plate</Label>
        <Input id="licensePlate" name="licensePlate" defaultValue={vehicle?.licensePlate ?? ''} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="make">Make</Label>
        <Input id="make" name="make" defaultValue={vehicle?.make ?? ''} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Input id="model" name="model" defaultValue={vehicle?.model ?? ''} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="year">Year</Label>
        <Input id="year" name="year" type="number" defaultValue={vehicle?.year} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Input id="type" name="type" defaultValue={vehicle?.type ?? ''} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity</Label>
        <Input id="capacity" name="capacity" type="number" defaultValue={vehicle?.capacity ?? 0} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="insuranceProvider">Insurance Provider</Label>
        <Input id="insuranceProvider" name="insuranceProvider" defaultValue={vehicle?.insuranceProvider ?? ''} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="insurancePolicyNumber">Insurance Policy #</Label>
        <Input id="insurancePolicyNumber" name="insurancePolicyNumber" defaultValue={vehicle?.insurancePolicyNumber ?? ''} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ownerInfo">Owner/Leasing Info</Label>
        <Input id="ownerInfo" name="ownerInfo" defaultValue={vehicle?.ownerInfo ?? ''} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="photoUrl">Photo URL</Label>
        <Input id="photoUrl" name="photoUrl" defaultValue={vehicle?.photoUrl ?? ''} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nextMaintenanceDate">Next Maintenance</Label>
        <Input
          id="nextMaintenanceDate"
          name="nextMaintenanceDate"
          type="date"
          defaultValue={vehicle?.nextMaintenanceDate?.toISOString().slice(0, 10) ?? ''}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nextInspectionDate">Next Inspection</Label>
        <Input
          id="nextInspectionDate"
          name="nextInspectionDate"
          type="date"
          defaultValue={vehicle?.nextInspectionDate?.toISOString().slice(0, 10) ?? ''}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select id="status" name="status" defaultValue={vehicle?.status ?? 'ACTIVE'} className="border rounded h-9 px-3">
          <option value="ACTIVE">Active</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="RETIRED">Retired</option>
        </select>
      </div>
      <Button type="submit" className="w-full">
        {vehicle ? 'Update Vehicle' : 'Create Vehicle'}
      </Button>
    </form>
  )
}
