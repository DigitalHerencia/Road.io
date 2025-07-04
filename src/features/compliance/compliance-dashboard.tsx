import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getDocumentStatusCounts, getDocumentTrends, type DocumentTrend } from '@/lib/fetchers/compliance'
import AuditLogList from './AuditLogList'
import ComplianceReportForm from './ComplianceReportForm'

interface Props {
  orgId: number
}

export default async function ComplianceDashboard({ orgId }: Props) {
  const [status, trends] = await Promise.all([
    getDocumentStatusCounts(orgId),
    getDocumentTrends(orgId)
  ])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{status.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{status.underReview}</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <h3 className="font-medium mb-2">Uploads Last {trends.length} Months</h3>
        <ul className="text-sm space-y-1">
          {trends.map((t: DocumentTrend) => (
            <li key={t.month} className="flex justify-between">
              <span>{t.month}</span>
              <span>{t.uploads}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditLogList orgId={orgId} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplianceReportForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
