import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/rbac'
import { getTripsByOrg } from '@/lib/fetchers/ifta'
import { recordTripAction } from '@/lib/actions/ifta'

export async function GET() {
  try {
    const user = await requirePermission('org:driver:record_trip')
    const trips = await getTripsByOrg(user.orgId)
    return NextResponse.json({ success: true, trips })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('org:driver:record_trip')
    const formData = await request.formData()
    const result = await recordTripAction(formData)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    )
  }
}
