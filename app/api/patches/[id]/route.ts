import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

/** Find a patch by id or slug, owned by the current user */
async function findPatch(idOrSlug: string, userId: string) {
  return prisma.patch.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], userId },
    include: { groups: { include: { fixture: { include: { modes: true } }, mode: true }, orderBy: { order: 'asc' } } },
  })
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const patch = await findPatch(id, session.user.id)
  if (!patch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patch)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  // Verify ownership
  const existing = await prisma.patch.findFirst({ where: { OR: [{ id }, { slug: id }], userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()

  // If slug is being updated, normalize and check uniqueness
  if (body.slug !== undefined) {
    body.slug = generateSlug(body.slug)
    if (!body.slug) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    const conflict = await prisma.patch.findFirst({ where: { slug: body.slug, NOT: { id: existing.id } } })
    if (conflict) return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
  }

  const patch = await prisma.patch.update({ where: { id: existing.id }, data: body })
  return NextResponse.json(patch)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const existing = await prisma.patch.findFirst({ where: { OR: [{ id }, { slug: id }], userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.patch.delete({ where: { id: existing.id } })
  return NextResponse.json({ ok: true })
}
