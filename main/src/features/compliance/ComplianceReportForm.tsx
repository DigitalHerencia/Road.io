import { Button } from '@/components/ui/button'
import { generateComplianceReportAction } from '@/lib/actions/compliance'

export default function ComplianceReportForm() {
  return (
    <form action={generateComplianceReportAction as unknown as (formData: FormData) => Promise<void>} className="space-y-2">
      <select name="category" className="border rounded p-1 text-sm">
        <option value="">All Categories</option>
        <option value="driver">Driver</option>
        <option value="safety">Safety</option>
        <option value="dqf">DQF</option>
        <option value="inspection">Inspection</option>
        <option value="accident">Accident</option>
        <option value="ifta">IFTA</option>
      </select>
      <Button type="submit">Generate Report</Button>
    </form>
  )
}
