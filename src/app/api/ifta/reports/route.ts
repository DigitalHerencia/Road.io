import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/rbac'
import { listIftaReports } from '@/lib/fetchers/ifta'
import { generateIftaReportAction } from '@/lib/actions/ifta'

export async function GET() {
  try {
    const user = await requirePermission('org:ifta:generate_report')
    const reports = await listIftaReports(user.orgId)
    return NextResponse.json({ success: true, reports })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('org:ifta:generate_report')
    const formData = await request.formData()
    const result = await generateIftaReportAction(formData)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    )
  }
}
