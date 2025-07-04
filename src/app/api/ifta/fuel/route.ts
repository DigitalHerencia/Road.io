import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/rbac'
import { getFuelPurchasesByOrg } from '@/lib/fetchers/ifta'
import { createFuelPurchaseAction } from '@/lib/actions/ifta'

export async function GET() {
  try {
    const user = await requirePermission('org:driver:log_fuel_purchase')
    const purchases = await getFuelPurchasesByOrg(user.orgId)
    return NextResponse.json({ success: true, purchases })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('org:driver:log_fuel_purchase')
    const formData = await request.formData()
    const result = await createFuelPurchaseAction(formData)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    )
  }
}
