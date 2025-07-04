import DriverForm from '@/features/drivers/components/DriverForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewDriverPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Register Driver</h1>
        <Link href="/drivers">
          <Button variant="outline">Back to list</Button>
        </Link>
      </div>
      <DriverForm />
    </div>
  )
}
