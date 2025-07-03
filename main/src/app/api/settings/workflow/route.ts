import { NextRequest, NextResponse } from 'next/server';
import { updateWorkflowAutomationSettingsAction } from '@/lib/actions/settings';
import { getWorkflowAutomationSettings } from '@/lib/fetchers/settings';
import { requirePermission } from '@/lib/rbac';
import { z } from 'zod';

const bodySchema = z.object({
  enabled: z.boolean().optional(),
  approvalsRequired: z.boolean().optional(),
});

export async function GET() {
  try {
    await requirePermission('org:admin:configure_company_settings');
    const settings = await getWorkflowAutomationSettings();
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
    await updateWorkflowAutomationSettingsAction(data);
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
