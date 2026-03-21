import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: { id: string; groupId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const group = await prisma.patchGroup.update({ where: { id: params.groupId }, data: body, include: { fixture: true, mode: true } })
  return NextResponse.json(group)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string; groupId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.patchGroup.delete({ where: { id: params.groupId } })
  return NextResponse.json({ ok: true })
}
