import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { listHazmatEndorsements, getComplianceConfig } from '@/lib/fetchers/compliance'

interface Props {
  orgId: number
}

export default async function HazmatInfo({ orgId }: Props) {
  const [config, endorsements] = await Promise.all([
    getComplianceConfig(orgId),
    listHazmatEndorsements(orgId),
  ])
  return (
    <div className="space-y-4">
      {config.hazmat.emergencyContact && (
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{config.hazmat.emergencyContact}</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>HAZMAT Endorsements</CardTitle>
        </CardHeader>
        <CardContent>
          {endorsements.length === 0 ? (
            <p>No endorsements on file.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {endorsements.map(e => (
                <li key={e.id} className="flex justify-between">
                  <span>{e.driverName}</span>
                  {e.expiresAt && (
                    <span>{new Date(e.expiresAt).toLocaleDateString()}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
