import { NextResponse } from 'next/server';
import { backupOrganizationSettings } from '@/lib/actions/settings';
import { requirePermission } from '@/lib/rbac';

export async function POST() {
  try {
    await requirePermission('org:admin:configure_company_settings');
    const file = await backupOrganizationSettings();
    return NextResponse.json({ success: true, file });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    );
  }
}
