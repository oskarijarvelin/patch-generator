import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

type AiFixture = {
  manufacturer: string
  name: string
  weight: number
  powerConsumption: number
  modes: Array<{ name: string; channelCount: number }>
  source?: string
  confidence?: 'high' | 'medium' | 'low'
  notes?: string
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured on the server' },
      { status: 503 }
    )
  }

  try {
    const { fixtures } = (await request.json()) as {
      fixtures: { manufacturer: string; model: string }[]
    }

    if (!fixtures || !Array.isArray(fixtures) || fixtures.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: provide a fixtures array' },
        { status: 400 }
      )
    }

    const client = new OpenAI({ apiKey })

    const fixtureList = fixtures
      .map((f, i) => `${i + 1}. Manufacturer: ${f.manufacturer}, Model: ${f.model}`)
      .join('\n')

    const prompt = `Return technical specifications for these professional lighting fixtures as a JSON array.

CRITICAL REQUIREMENTS:
- Only include DMX modes and channel counts you are confident are correct.
- If you are not confident about a fixture's modes/channel counts, set "modes": [] and set "confidence" to "low".
- Add a short "source" field (e.g. "manual", "manufacturer spec", "datasheet", or "uncertain") and "notes" explaining any assumptions.
- Look for DMX Charts from manufacturers or trusted sources to find accurate channel counts for each mode. Do not guess or assume based on similar fixtures.

Fixtures to look up:
${fixtureList}

Respond ONLY with a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "manufacturer": "Manufacturer Name",
    "name": "Model Name",
    "weight": 9.5,
    "powerConsumption": 320,
    "modes": [
      { "name": "Mode Name", "channelCount": 16 }
    ],
    "source": "manual|manufacturer spec|datasheet|uncertain",
    "confidence": "high|medium|low",
    "notes": "short explanation"
  }
]`

    const response = await client.chat.completions.create({
      model: 'gpt-5.4',
      messages: [
        {
          role: 'system',
          content:
            'You are a technical expert in professional stage lighting equipment. Always respond with valid JSON only. Never invent channel counts; if unsure, return an empty modes array and confidence=low.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    })

    const content = response.choices[0]?.message?.content ?? '[]'
    const clean = content
      .trim()
      .replace(/^```(?:json)?\s*/, '')
      .replace(/\s*```$/, '')
      .trim()

    const raw = JSON.parse(clean)
    const arr: any[] = Array.isArray(raw) ? raw : [raw]

    // Basic validation/sanitization so the UI doesn't get garbage.
    const results: AiFixture[] = arr
      .map((x) => {
        const manufacturer = typeof x?.manufacturer === 'string' ? x.manufacturer : ''
        const name = typeof x?.name === 'string' ? x.name : ''
        const weight = Number(x?.weight)
        const powerConsumption = Number(x?.powerConsumption)
        const modes = Array.isArray(x?.modes)
          ? x.modes
              .map((m: any) => ({
                name: typeof m?.name === 'string' ? m.name : '',
                channelCount: Number(m?.channelCount),
              }))
              .filter((m: any) => m.name && Number.isFinite(m.channelCount) && m.channelCount > 0 && m.channelCount <= 512)
          : []

        const source = typeof x?.source === 'string' ? x.source : undefined
        const confidence = x?.confidence === 'high' || x?.confidence === 'medium' || x?.confidence === 'low' ? x.confidence : undefined
        const notes = typeof x?.notes === 'string' ? x.notes : undefined

        return {
          manufacturer,
          name,
          weight: Number.isFinite(weight) ? weight : 0,
          powerConsumption: Number.isFinite(powerConsumption) ? powerConsumption : 0,
          modes,
          source,
          confidence,
          notes,
        } satisfies AiFixture
      })
      .filter((x) => x.manufacturer && x.name)

    return NextResponse.json(results)
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 })
    }
    return NextResponse.json({ error: 'AI lookup failed' }, { status: 500 })
  }
}
