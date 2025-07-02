import { getExpiringDocuments } from '@/lib/fetchers/compliance'
import { markDocumentReviewed } from '@/lib/actions/compliance'
import { Button } from '@/components/ui/button'

interface Props {
  orgId: number
}

export default async function RenewalList({ orgId }: Props) {
  const docs = await getExpiringDocuments(orgId)

  async function review(formData: FormData) {
    'use server'
    const id = Number(formData.get('id'))
    if (id) {
      await markDocumentReviewed(id)
    }
  }

  if (docs.length === 0) {
    return <p>No upcoming renewals.</p>
  }

  return (
    <form action={review} className="space-y-4">
      <table className="w-full text-sm">
        <thead className="text-left">
          <tr>
            <th>File</th>
            <th>Expires</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {docs.map(doc => (
            <tr key={doc.id} className="border-t">
              <td>{doc.fileName}</td>
              <td>{doc.expiresAt?.toISOString().slice(0, 10)}</td>
              <td>
                <Button type="submit" name="id" value={doc.id} size="sm">
                  Mark Reviewed
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </form>
  )
}
