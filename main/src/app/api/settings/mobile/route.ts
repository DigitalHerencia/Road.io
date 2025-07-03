import { NextRequest, NextResponse } from 'next/server';
import { updateMobileSettingsAction } from '@/lib/actions/settings';
import { getMobileSettings } from '@/lib/fetchers/settings';
import { requirePermission } from '@/lib/rbac';
import { z } from 'zod';

const bodySchema = z.object({
  offlineMode: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  gpsTracking: z.boolean().optional(),
  batterySaver: z.boolean().optional(),
  dataSaver: z.boolean().optional(),
});

export async function GET() {
  try {
    await requirePermission('org:admin:configure_company_settings');
    const settings = await getMobileSettings();
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
    await requirePermission('org:admin:configure_company_settings');
    const data = bodySchema.parse(await request.json());
    await updateMobileSettingsAction(data);
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
