import { NextResponse } from 'next/server';
import { checkHealth } from '@/lib/health';

export async function GET() {
  const status = await checkHealth();
  return NextResponse.json({ success: true, status });
}
