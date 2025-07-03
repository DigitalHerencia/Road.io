import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/rbac'
import { importEldCsvAction, importFuelCardCsvAction } from '@/lib/actions/ifta'

export async function POST(request: NextRequest) {
  try {
    await requirePermission('org:ifta:import_data')
    const type = request.nextUrl.searchParams.get('type') || 'eld'
    const formData = await request.formData()
    if (type === 'fuelCard') {
      await importFuelCardCsvAction(formData)
    } else {
      await importEldCsvAction(formData)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    )
  }
}
