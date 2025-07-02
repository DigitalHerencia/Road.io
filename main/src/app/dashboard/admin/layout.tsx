import AdminNav from '@/features/admin/components/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden md:block w-48 border-r p-4">
        <AdminNav />
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  )
}
