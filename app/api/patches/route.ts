import { NextRequest, NextResponse } from 'next/server'
import { isLocalhostRequest } from '@/lib/is-localhost'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

export async function GET() {
  const patches = await prisma.patch.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { groups: { include: { fixture: true, mode: true } } },
  })
  return NextResponse.json(patches)
}

export async function POST(request: NextRequest) {
  if (!isLocalhostRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const baseSlug = generateSlug(body.title)

    // Ensure uniqueness by appending a counter if needed
    let slug = baseSlug
    let counter = 1
    while (await prisma.patch.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const patch = await prisma.patch.create({
      data: { ...body, slug },
    })

    return NextResponse.json(patch, { status: 201 })
  } catch (e) {
    console.error('Failed to create patch', e)
    return NextResponse.json({ error: 'Failed to create patch' }, { status: 500 })
  }
}
