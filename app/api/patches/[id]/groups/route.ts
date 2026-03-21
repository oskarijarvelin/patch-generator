import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { position, universe, startingId, startingAddress, amount, fixtureId, modeId } = await request.json()
    const count = await prisma.patchGroup.count({ where: { patchId: params.id } })
    const group = await prisma.patchGroup.create({
      data: { position, universe, startingId, startingAddress, amount, fixtureId, modeId, patchId: params.id, order: count },
      include: { fixture: true, mode: true },
    })
    return NextResponse.json(group, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
