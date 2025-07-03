import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createDriver, updateDriver } from '@/lib/actions/drivers'
import { DriverProfile } from '@/features/drivers/types'

interface DriverFormProps {
  driver?: DriverProfile
}

export default function DriverForm({ driver }: DriverFormProps) {
  const action = driver ? updateDriver : createDriver

  return (
    <form
      action={async (formData) => {
        await action(formData)
      }}
      className="space-y-4 max-w-md"
    >
      {driver && <input type="hidden" name="id" value={driver.id} />}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={driver?.name ?? ''} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={driver?.email ?? ''}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="licenseNumber">License Number</Label>
        <Input
          id="licenseNumber"
          name="licenseNumber"
          defaultValue={driver?.licenseNumber ?? ''}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="licenseExpiry">License Expiry</Label>
        <Input
          id="licenseExpiry"
          name="licenseExpiry"
          type="date"
          defaultValue={driver?.licenseExpiry ? driver.licenseExpiry.toISOString().slice(0, 10) : ''}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dotNumber">DOT Number</Label>
        <Input id="dotNumber" name="dotNumber" defaultValue={driver?.dotNumber ?? ''} />
      </div>
      <Button type="submit" className="mt-4">
        {driver ? 'Update Driver' : 'Create Driver'}
      </Button>
    </form>
  )
}
