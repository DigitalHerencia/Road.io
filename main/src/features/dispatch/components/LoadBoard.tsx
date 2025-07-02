import { loadStatusEnum } from '@/lib/schema'
import { searchLoads, type LoadFilters } from '@/lib/fetchers/loads'
import { updateLoadStatus, bulkExportLoads } from '@/lib/actions/loads'
import { Button } from '@/components/ui/button'

interface Props {
  orgId: number
  filters?: LoadFilters
}

export default async function LoadBoard({ orgId, filters }: Props) {
  const loads = await searchLoads(orgId, filters)

  async function exportSelected(formData: FormData) {
    'use server'
    const ids = formData.getAll('loadId').map(id => Number(id))
    await bulkExportLoads(ids)
    // Do not return anything
  }

  async function changeStatus(formData: FormData) {
    'use server'
    const id = Number(formData.get('id'))
    const status = formData.get('status') as typeof loadStatusEnum.enumValues[number]
    await updateLoadStatus(id, status)
    // Do not return anything
  }

  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead className="text-left">
          <tr>
            <th></th>
            <th>Load #</th>
            <th>Status</th>
            <th>Pickup</th>
            <th>Delivery</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loads.map(l => (
            <tr key={l.id} className="border-t">
              <td>
                <input form="bulkForm" type="checkbox" name="loadId" value={l.id} />
              </td>
              <td>{l.loadNumber}</td>
              <td>{l.status}</td>
              <td>{l.pickupLocation.address}</td>
              <td>{l.deliveryLocation.address}</td>
              <td>
                <form action={changeStatus} className="flex items-center space-x-2">
                  <input type="hidden" name="id" value={l.id} />
                  <select
                    name="status"
                    defaultValue={l.status}
                    className="border rounded h-8 px-2"
                  >
                    {loadStatusEnum.enumValues.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form id="bulkForm" action={exportSelected}>
        <Button type="submit" variant="secondary">
          Export Selected
        </Button>
      </form>
    </div>
  )
}
