import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { fetchDriverProductivity } from '@/lib/fetchers/dispatch'

interface Props {
  orgId: number
}

export default async function DriverProductivityTable({ orgId }: Props) {
  const data = await fetchDriverProductivity(orgId)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Driver</th>
              <th className="text-right">Completed Loads</th>
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.driverId}>
                <td>{d.driverName ?? `Driver ${d.driverId}`}</td>
                <td className="text-right">{d.completedLoads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

