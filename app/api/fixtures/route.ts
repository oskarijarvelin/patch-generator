import { NextRequest, NextResponse } from 'next/server'
import { isLocalhostRequest } from '@/lib/is-localhost'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const fixtures = await prisma.fixture.findMany({
    include: { modes: true },
    orderBy: [{ manufacturer: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(fixtures)
}

export async function POST(request: NextRequest) {
  if (!isLocalhostRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const { manufacturer, name, weight, powerConsumption, isGlobal, modes } = await request.json()
    const fixture = await prisma.fixture.create({
      data: {
        manufacturer, name, weight, powerConsumption,
        isGlobal: isGlobal ?? false,
        modes: { create: modes ?? [] },
      },
      include: { modes: true },
    })
    return NextResponse.json(fixture, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create fixture' }, { status: 500 })
  }
}
