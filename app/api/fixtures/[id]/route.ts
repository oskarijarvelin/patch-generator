import { NextRequest, NextResponse } from 'next/server'
import { isLocalhostRequest } from '@/lib/is-localhost'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const fixture = await prisma.fixture.findUnique({ where: { id }, include: { modes: true } })
  if (!fixture) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(fixture)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isLocalhostRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  try {
    const { manufacturer, name, weight, powerConsumption, isGlobal, modes } = await request.json()
    await prisma.fixtureMode.deleteMany({ where: { fixtureId: id } })
    const fixture = await prisma.fixture.update({
      where: { id },
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isLocalhostRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  await prisma.fixture.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
