import { fetchDriverMessages } from '@/lib/fetchers/drivers'

export default async function DriverMessageList({ driverId }: { driverId: number }) {
  const messages = await fetchDriverMessages(driverId)
  if (messages.length === 0) return <p>No messages.</p>
  return (
    <ul className="space-y-2">
      {messages.map(m => (
        <li key={m.id} className="border rounded p-2">
          <p className="text-sm">{m.message}</p>
          <p className="text-xs text-muted-foreground">
            {m.sender} - {m.createdAt.toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  )
}
