import LoadBoard from '@/features/dispatch/components/LoadBoard'
import { getCurrentUser } from '@/lib/rbac'
import type { LoadFilters } from '@/lib/fetchers/loads'
import { loadStatusEnum } from '@/lib/schema'

interface SearchParams {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function DispatchPage({ searchParams }: SearchParams) {
  const user = await getCurrentUser()
  if (!user) return null
  const filters: LoadFilters = {
    status: searchParams.status as typeof loadStatusEnum.enumValues[number] | undefined,
    driverId: searchParams.driverId ? Number(searchParams.driverId) : undefined,
    query: typeof searchParams.q === 'string' ? searchParams.q : undefined,
  }
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Dispatch Board</h1>
      <form className="flex gap-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={filters.query ?? ''}
          placeholder="Search"
          className="border rounded h-8 px-2"
        />
        <select
          name="status"
          defaultValue={filters.status ?? ''}
          className="border rounded h-8 px-2"
        >
          <option value="">All</option>
          {Object.values(loadStatusEnum.enumValues).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-primary text-primary-foreground rounded px-3">
          Filter
        </button>
      </form>
      <LoadBoard orgId={user.orgId} filters={filters} />
    </div>
  )
}
