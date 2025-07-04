import { addDriverCertification } from '@/lib/actions/drivers'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function CertificationForm({ driverId }: { driverId: number }) {
  return (
    <form
      action={async (formData) => {
        formData.set('driverId', String(driverId))
        await addDriverCertification(formData)
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Input id="type" name="type" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="issuedAt">Issued</Label>
        <Input id="issuedAt" name="issuedAt" type="date" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expires</Label>
        <Input id="expiresAt" name="expiresAt" type="date" />
      </div>
      <Button type="submit">Add Certification</Button>
    </form>
  )
}
