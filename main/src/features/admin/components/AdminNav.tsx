"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const links = [
  { href: '/dashboard/admin', label: 'Overview' },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/roles', label: 'Roles' },
  { href: '/dashboard/admin/company', label: 'Company' },
  { href: '/dashboard/admin/tenant', label: 'Tenant' },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-2">
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className={clsx('px-3 py-2 rounded hover:underline', pathname === l.href && 'bg-muted')}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
