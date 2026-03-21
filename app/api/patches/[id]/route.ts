import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const patch = await prisma.patch.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { groups: { include: { fixture: { include: { modes: true } }, mode: true }, orderBy: { order: 'asc' } } },
  })
  if (!patch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patch)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const patch = await prisma.patch.update({ where: { id: params.id }, data: body })
  return NextResponse.json(patch)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.patch.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
