import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ModeInput = { name: string; channelCount: number }
type FixtureInput = {
  manufacturer: string
  name: string
  weight: number
  powerConsumption: number
  isGlobal: boolean
  modes: ModeInput[]
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

async function importFixtures(
  fixtures: FixtureInput[],
  userId: string
): Promise<{ created: number; skipped: number }> {
  let created = 0
  let skipped = 0

  for (const fixtureData of fixtures) {
    const existing = await prisma.fixture.findFirst({
      where: { manufacturer: fixtureData.manufacturer, name: fixtureData.name },
    })

    if (existing) {
      skipped++
      continue
    }

    await prisma.fixture.create({
      data: {
        manufacturer: fixtureData.manufacturer,
        name: fixtureData.name,
        weight: fixtureData.weight,
        powerConsumption: fixtureData.powerConsumption,
        isGlobal: fixtureData.isGlobal,
        createdById: userId,
        modes: { create: fixtureData.modes },
      },
    })
    created++
  }

  return { created, skipped }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contentType = request.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('application/json')) {
      // Import from AI lookup results (JSON array of fixture objects)
      const body = await request.json()
      let fixtures: FixtureInput[]

      if (Array.isArray(body)) {
        fixtures = body
      } else if (Array.isArray(body?.fixtures)) {
        fixtures = body.fixtures
      } else {
        return NextResponse.json(
          { error: 'Invalid request body: expected a JSON array of fixtures' },
          { status: 400 }
        )
      }

      if (!fixtures.length) {
        return NextResponse.json({ error: 'No fixtures provided' }, { status: 400 })
      }

      const result = await importFixtures(fixtures, session.user.id)
      return NextResponse.json(result)
    }

    if (contentType.includes('multipart/form-data')) {
      // Import from CSV file
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

      const text = await file.text()
      const rows = parseCsv(text)

      if (rows.length === 0) {
        return NextResponse.json({ error: 'Empty or invalid CSV' }, { status: 400 })
      }

      // Group rows by manufacturer+name
      const fixtureMap = new Map<string, FixtureInput>()

      for (const row of rows) {
        if (!row.manufacturer || !row.name) continue
        const key = `${row.manufacturer}|${row.name}`

        if (!fixtureMap.has(key)) {
          fixtureMap.set(key, {
            manufacturer: row.manufacturer,
            name: row.name,
            weight: Number(row.weight) || 0,
            powerConsumption: Number(row.powerConsumption) || 0,
            isGlobal: row.isGlobal === 'true',
            modes: [],
          })
        }

        const fixture = fixtureMap.get(key)!
        if (row.modeName) {
          fixture.modes.push({
            name: row.modeName,
            channelCount: Number(row.channelCount) || 1,
          })
        }
      }

      const result = await importFixtures(Array.from(fixtureMap.values()), session.user.id)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
  } catch {
    return NextResponse.json({ error: 'Failed to import fixtures' }, { status: 500 })
  }
}
