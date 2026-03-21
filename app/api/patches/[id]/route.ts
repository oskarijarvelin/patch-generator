import { NextRequest, NextResponse } from 'next/server'
import { isLocalhostRequest } from '@/lib/is-localhost'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

type Ctx = { params: Promise<{ id: string }> | { id: string } }

async function getIdFromCtx(ctx: Ctx): Promise<string | undefined> {
  const p: any = ctx?.params
  if (!p) return undefined
  const resolved = typeof p.then === 'function' ? await p : p
  return resolved?.id
}

async function findPatchByIdOrSlug(idOrSlug: string) {
  return prisma.patch.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true, slug: true, title: true },
  })
}

async function makeUniqueSlug(base: string, excludePatchId?: string) {
  const baseSlug = generateSlug(base)
  let slug = baseSlug
  let counter = 1
  while (
    await prisma.patch.findFirst({
      where: {
        slug,
        ...(excludePatchId ? { NOT: { id: excludePatchId } } : {}),
      },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter++}`
  }
  return slug
}

export async function GET(_: NextRequest, ctx: Ctx) {
  const idOrSlug = await getIdFromCtx(ctx)
  if (!idOrSlug) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const patch = await prisma.patch.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: {
      groups: {
        include: { fixture: { include: { modes: true } }, mode: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!patch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patch)
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  if (!isLocalhostRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const idOrSlug = await getIdFromCtx(ctx)
  if (!idOrSlug) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const existing = await findPatchByIdOrSlug(idOrSlug)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()

  // If slug is provided, normalize + enforce uniqueness. If empty but title changed, regenerate.
  if (typeof body.slug === 'string' && body.slug.trim() !== '') {
    body.slug = await makeUniqueSlug(body.slug, existing.id)
  } else if (typeof body.title === 'string' && body.title.trim() !== '') {
    // keep current slug unless explicitly cleared
    if (body.slug === '') body.slug = await makeUniqueSlug(body.title, existing.id)
  }

  const patch = await prisma.patch.update({ where: { id: existing.id }, data: body })
  return NextResponse.json(patch)
}

export async function DELETE(_: NextRequest, ctx: Ctx) {
  if (!isLocalhostRequest(_)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const idOrSlug = await getIdFromCtx(ctx)
  if (!idOrSlug) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const existing = await findPatchByIdOrSlug(idOrSlug)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.patch.delete({ where: { id: existing.id } })
  return NextResponse.json({ ok: true })
}
