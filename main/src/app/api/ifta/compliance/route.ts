import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/rbac'
import { listIftaAuditResponses } from '@/lib/fetchers/ifta'
import { recordIftaAuditResponseAction } from '@/lib/actions/ifta'

export async function GET() {
  try {
    const user = await requirePermission('org:compliance:access_audit_logs')
    const responses = await listIftaAuditResponses(user.orgId)
    return NextResponse.json({ success: true, responses })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('org:compliance:access_audit_logs')
    const formData = await request.formData()
    const result = await recordIftaAuditResponseAction(formData)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    )
  }
}
