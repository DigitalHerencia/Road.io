import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link'
import CompanyProfileForm from '@/features/settings/CompanyProfileForm';

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  return (
    <div className="min-h-screen p-8 bg-background space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Company Settings</h1>
        <CompanyProfileForm />
      </div>
      <div className="flex gap-4 max-w-2xl mx-auto">
        <Link href="/dashboard/settings/users" className="underline text-sm">
          Manage Users
        </Link>
        <Link href="/dashboard/settings/roles" className="underline text-sm">
          Manage Roles
        </Link>
        <Link href="/dashboard/settings/integrations" className="underline text-sm">
          Integrations
        </Link>
        <Link href="/dashboard/settings/notifications" className="underline text-sm">
          Notifications
        </Link>
      </div>
    </div>
  );
}
