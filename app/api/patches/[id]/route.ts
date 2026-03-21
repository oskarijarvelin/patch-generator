import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string }> | { id: string } }

async function getIdFromCtx(ctx: Ctx): Promise<string | undefined> {
  const p: any = ctx?.params
  if (!p) return undefined
  const resolved = typeof p.then === 'function' ? await p : p
  return resolved?.id
}

export async function GET(_: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = await getIdFromCtx(ctx)
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const patch = await prisma.patch.findFirst({
    where: { id, userId: session.user.id },
    include: { groups: { include: { fixture: { include: { modes: true } }, mode: true }, orderBy: { order: 'asc' } } },
  })
  if (!patch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patch)
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = await getIdFromCtx(ctx)
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body = await request.json()
  const patch = await prisma.patch.update({ where: { id }, data: body })
  return NextResponse.json(patch)
}

export async function DELETE(_: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = await getIdFromCtx(ctx)
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.patch.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
