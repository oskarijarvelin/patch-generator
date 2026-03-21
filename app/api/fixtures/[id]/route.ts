import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const fixture = await prisma.fixture.findUnique({ where: { id: params.id }, include: { modes: true } })
  if (!fixture) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(fixture)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { manufacturer, name, weight, powerConsumption, isGlobal, modes } = await request.json()
    await prisma.fixtureMode.deleteMany({ where: { fixtureId: params.id } })
    const fixture = await prisma.fixture.update({
      where: { id: params.id },
      data: {
        manufacturer, name, weight, powerConsumption, isGlobal: isGlobal ?? false,
        modes: { create: modes.map((m: { name: string; channelCount: number }) => ({ name: m.name, channelCount: m.channelCount })) },
      },
      include: { modes: true },
    })
    return NextResponse.json(fixture)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.fixture.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
