import { listComplianceTasks } from '@/lib/fetchers/compliance'
import { completeComplianceTaskAction } from '@/lib/actions/compliance'

export default async function TaskList({ workflowId }: { workflowId: number }) {
  const tasks = await listComplianceTasks(workflowId)
  if (tasks.length === 0) return <p>No tasks.</p>
  return (
    <ul className="space-y-1 text-sm">
      {tasks.map(t => (
        <li key={t.id} className="flex items-center justify-between border-b py-1">
          <span className={t.status === 'COMPLETED' ? 'line-through' : ''}>{t.title}</span>
          {t.status !== 'COMPLETED' && (
            <form action={async (formData) => { await completeComplianceTaskAction(formData); }}>
              <input type="hidden" name="taskId" value={t.id} />
              <button type="submit" className="text-xs underline">Complete</button>
            </form>
          )}
        </li>
      ))}
    </ul>
  )
}
