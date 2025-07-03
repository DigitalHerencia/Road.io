import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/rbac'
import { getTaxRatesByQuarter } from '@/lib/fetchers/ifta'
import { calculateTaxAction } from '@/lib/actions/ifta'

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('org:ifta:generate_report')
    const quarter = request.nextUrl.searchParams.get('quarter') || ''
    const rates = await getTaxRatesByQuarter(quarter)
    return NextResponse.json({ success: true, rates })
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
    const result = await calculateTaxAction(formData)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    )
  }
}
