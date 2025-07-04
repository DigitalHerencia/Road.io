import { requirePermission } from '@/lib/rbac';
import CompanyProfileForm from '@/features/admin/components/CompanyProfileForm';

export default async function AdminCompanyPage() {
  await requirePermission('org:admin:configure_company_settings');
  return (
    <div className="p-8">
      <CompanyProfileForm />
    </div>
  );
}
