import { NextRequest, NextResponse } from 'next/server'
import { isLocalhostRequest } from '@/lib/is-localhost'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isLocalhostRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: patchId } = await params
  const body = await request.json()
  const orders: unknown = body?.orders

  if (!Array.isArray(orders)) {
    return NextResponse.json({ error: 'orders must be an array' }, { status: 400 })
  }

  // Verify patch exists
  const patch = await prisma.patch.findFirst({
    where: { id: patchId },
    select: { id: true },
  })
  if (!patch) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Validate each entry
  for (const entry of orders) {
    if (typeof (entry as { id?: unknown }).id !== 'string' || typeof (entry as { order?: unknown }).order !== 'number') {
      return NextResponse.json({ error: 'Each order entry must have id (string) and order (number)' }, { status: 400 })
    }
  }

  const typedOrders = orders as Array<{ id: string; order: number }>

  // Verify all group IDs belong to this patch
  const groupIds = typedOrders.map(({ id }) => id)
  const matchingCount = await prisma.patchGroup.count({
    where: { id: { in: groupIds }, patchId },
  })
  if (matchingCount !== groupIds.length) {
    return NextResponse.json({ error: 'One or more groups do not belong to this patch' }, { status: 403 })
  }

  await prisma.$transaction(
    typedOrders.map(({ id, order }) =>
      prisma.patchGroup.update({
        where: { id },
        data: { order },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
