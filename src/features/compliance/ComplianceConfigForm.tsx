import { updateComplianceConfigAction } from '@/lib/actions/compliance'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ComplianceConfigFormProps {
  initialDotRules?: boolean;
  initialEnvironmental?: boolean;
  initialEmergencyContact?: string;
}

export default function ComplianceConfigForm({
  initialDotRules = false,
  initialEnvironmental = false,
  initialEmergencyContact = '',
}: ComplianceConfigFormProps) {
  return (
    <form action={updateComplianceConfigAction} className="space-y-4 max-w-sm">
      <div className="flex items-center space-x-2">
        <Input
          id="dotRules"
          name="dotRules"
          type="checkbox"
          className="h-4 w-4"
          defaultChecked={initialDotRules}
        />
        <Label htmlFor="dotRules">Enforce DOT Rules</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          id="environmental"
          name="environmental"
          type="checkbox"
          className="h-4 w-4"
          defaultChecked={initialEnvironmental}
        />
        <Label htmlFor="environmental">Environmental Compliance</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Emergency Contact</Label>
        <Input
          id="emergencyContact"
          name="emergencyContact"
          defaultValue={initialEmergencyContact}
        />
      </div>
      <Button type="submit">Save Settings</Button>
    </form>
  )
}
