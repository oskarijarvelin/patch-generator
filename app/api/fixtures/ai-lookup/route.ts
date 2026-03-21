import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'AI lookup has been removed' }, { status: 404 })
}
