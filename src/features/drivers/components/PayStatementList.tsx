import { getPayStatements } from '@/lib/fetchers/payroll'

export default async function PayStatementList({ driverId }: { driverId: number }) {
  const statements = await getPayStatements(driverId)
  if (statements.length === 0) return <p>No pay statements.</p>
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="text-left">Period</th>
          <th className="text-left">Net Pay</th>
        </tr>
      </thead>
      <tbody>
        {statements.map(s => (
          <tr key={s.id}>
            <td>{s.periodStart.toISOString().slice(0,10)} - {s.periodEnd.toISOString().slice(0,10)}</td>
            <td>${(s.netPay / 100).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
