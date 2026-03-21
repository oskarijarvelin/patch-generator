import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; groupId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { groupId } = await params
  const body = await request.json()

  const {
    position,
    universe,
    startingId,
    startingAddress,
    amount,
    fixtureId,
    modeId,
  } = body ?? {}

  try {
    const group = await prisma.patchGroup.update({
      where: { id: groupId },
      data: {
        ...(position !== undefined ? { position } : {}),
        ...(universe !== undefined ? { universe } : {}),
        ...(startingId !== undefined ? { startingId: Number(startingId) } : {}),
        ...(startingAddress !== undefined ? { startingAddress: Number(startingAddress) } : {}),
        ...(amount !== undefined ? { amount: Number(amount) } : {}),
        ...(fixtureId ? { fixture: { connect: { id: String(fixtureId) } } } : {}),
        ...(modeId ? { mode: { connect: { id: String(modeId) } } } : {}),
      },
      include: { fixture: true, mode: true },
    })

    return NextResponse.json(group)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update group'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; groupId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { groupId } = await params
  await prisma.patchGroup.delete({ where: { id: groupId } })
  return NextResponse.json({ ok: true })
}
