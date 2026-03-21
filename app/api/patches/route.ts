import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const patches = await prisma.patch.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: { groups: { include: { fixture: true, mode: true } } },
  })
  return NextResponse.json(patches)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()

    const baseSlug = generateSlug(body.title)

    // Ensure uniqueness for this user by appending a counter if needed
    let slug = baseSlug
    let counter = 1
    while (await prisma.patch.findFirst({ where: { userId: session.user.id, slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const patch = await prisma.patch.create({
      data: { ...body, slug, userId: session.user.id },
    })

    return NextResponse.json(patch, { status: 201 })
  } catch (e) {
    console.error('Failed to create patch', e)
    return NextResponse.json({ error: 'Failed to create patch' }, { status: 500 })
  }
}
