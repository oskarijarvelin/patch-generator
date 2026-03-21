import { NextRequest, NextResponse } from 'next/server'
import { isLocalhostRequest } from '@/lib/is-localhost'
import { prisma } from '@/lib/prisma'

function getPatchIdFromRequestUrl(request: NextRequest): string | undefined {
  try {
    const { pathname } = new URL(request.url)
    // expected: /api/patches/:id/groups
    const parts = pathname.split('/').filter(Boolean)
    const patchesIndex = parts.indexOf('patches')
    if (patchesIndex === -1) return undefined
    const id = parts[patchesIndex + 1]
    const groups = parts[patchesIndex + 2]
    if (!id || groups !== 'groups') return undefined
    return id
  } catch {
    return undefined
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isLocalhostRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const resolvedParams = await params
  const patchId = resolvedParams?.id ?? getPatchIdFromRequestUrl(request)
  if (!patchId) {
    console.error('Missing patch id', { params: resolvedParams, url: request.url })
    return NextResponse.json({ error: 'Missing patch id' }, { status: 400 })
  }

  try {
    const { position, universe, startingId, startingAddress, amount, fixtureId, modeId } = await request.json()

    if (!position || !universe || !startingId || !startingAddress || !amount || !fixtureId || !modeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure the patch exists
    const patch = await prisma.patch.findFirst({ where: { id: patchId }, select: { id: true } })
    if (!patch) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const count = await prisma.patchGroup.count({ where: { patchId } })
    const group = await prisma.patchGroup.create({
      data: {
        position,
        universe,
        startingId: Number(startingId),
        startingAddress: Number(startingAddress),
        amount: Number(amount),
        fixtureId,
        modeId,
        patchId,
        order: count,
      },
      include: { fixture: true, mode: true },
    })

    return NextResponse.json(group, { status: 201 })
  } catch (e) {
    console.error('Failed to create group', e)
    const message = e instanceof Error ? e.message : 'Failed to create group'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
