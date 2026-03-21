import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const fixtures = await prisma.fixture.findMany({
    include: { modes: true },
    orderBy: [{ manufacturer: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(fixtures)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { manufacturer, name, weight, powerConsumption, isGlobal, modes } = await request.json()
    const fixture = await prisma.fixture.create({
      data: {
        manufacturer, name, weight, powerConsumption,
        isGlobal: isGlobal ?? false,
        createdById: session.user.id,
        modes: { create: modes ?? [] },
      },
      include: { modes: true },
    })
    return NextResponse.json(fixture, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create fixture' }, { status: 500 })
  }
}
