import { listComplianceWorkflows } from '@/lib/fetchers/compliance'

export default async function WorkflowList({ orgId }: { orgId: number }) {
  const workflows = await listComplianceWorkflows(orgId)
  if (workflows.length === 0) return <p>No workflows.</p>
  return (
    <ul className="space-y-1 text-sm">
      {workflows.map(w => (
        <li key={w.id} className="flex justify-between border-b py-1">
          <span>{w.name}</span>
          <span>{w.status}</span>
        </li>
      ))}
    </ul>
  )
}
