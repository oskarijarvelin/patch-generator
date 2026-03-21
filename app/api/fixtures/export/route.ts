import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function GET() {
  const fixtures = await prisma.fixture.findMany({
    include: { modes: true },
    orderBy: [{ manufacturer: 'asc' }, { name: 'asc' }],
  })

  const rows: string[] = ['manufacturer,name,weight,powerConsumption,isGlobal,modeName,channelCount']

  for (const fixture of fixtures) {
    if (fixture.modes.length === 0) {
      rows.push(
        [
          csvEscape(fixture.manufacturer),
          csvEscape(fixture.name),
          String(fixture.weight),
          String(fixture.powerConsumption),
          fixture.isGlobal ? 'true' : 'false',
          '',
          '',
        ].join(',')
      )
    } else {
      for (const mode of fixture.modes) {
        rows.push(
          [
            csvEscape(fixture.manufacturer),
            csvEscape(fixture.name),
            String(fixture.weight),
            String(fixture.powerConsumption),
            fixture.isGlobal ? 'true' : 'false',
            csvEscape(mode.name),
            String(mode.channelCount),
          ].join(',')
        )
      }
    }
  }

  const csv = rows.join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="fixtures.csv"',
    },
  })
}
