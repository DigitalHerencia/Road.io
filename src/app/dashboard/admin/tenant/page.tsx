import TenantMetrics from "@/features/admin/components/TenantMetrics";
import TenantConfigForm from "@/features/admin/components/TenantConfigForm";
import TenantIsolationCheck from "@/features/admin/components/TenantIsolationCheck";
import { requireRole } from "@/lib/rbac";
import { SystemRoles } from "@/types/rbac";

export default async function TenantAdminPage() {
  const admin = await requireRole(SystemRoles.ADMIN);

  return (
    <div className="p-8 space-y-6">
      <TenantMetrics orgId={admin.orgId} />
      <TenantIsolationCheck />
      <TenantConfigForm orgId={admin.orgId} />
    </div>
  );
}
