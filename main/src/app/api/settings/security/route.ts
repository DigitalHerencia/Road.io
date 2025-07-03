import { NextRequest, NextResponse } from 'next/server';
import { updateSecuritySettingsAction } from '@/lib/actions/settings';
import { getSecuritySettings } from '@/lib/fetchers/settings';
import { requirePermission } from '@/lib/rbac';
import { checkRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const bodySchema = z.object({
  regulatoryMode: z.boolean().optional(),
  documentManagement: z.boolean().optional(),
  auditTrails: z.boolean().optional(),
});

export async function GET() {
  try {
    if (!checkRateLimit('settings-security-get')) {
      return NextResponse.json({ success: false, message: 'Rate limit exceeded' }, { status: 429 });
    }
    await requirePermission('org:admin:configure_company_settings');
    const settings = await getSecuritySettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit('settings-security-post')) {
      return NextResponse.json({ success: false, message: 'Rate limit exceeded' }, { status: 429 });
    }
    await requirePermission('org:admin:configure_company_settings');
    const data = bodySchema.parse(await request.json());
    await updateSecuritySettingsAction(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    );
  }
}
