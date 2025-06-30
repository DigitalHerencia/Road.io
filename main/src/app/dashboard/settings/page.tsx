import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CompanyProfileForm from '@/features/settings/CompanyProfileForm';

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Company Settings</h1>
        <CompanyProfileForm />
      </div>
    </div>
  );
}
