import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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

    const prompt = `Return technical specifications for these professional lighting fixtures as a JSON array. For each fixture include all known operating modes with their DMX channel counts, weight in kg, and power consumption in watts.

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
    ]
  }
]

Use your knowledge of professional stage lighting. If a value is uncertain, provide your best estimate.`

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a technical expert in professional stage lighting equipment with detailed knowledge of DMX fixtures, their modes, power requirements, and weights. Always respond with valid JSON only — no markdown, no code fences, no explanatory text.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    })

    const content = response.choices[0]?.message?.content ?? '[]'
    // Strip markdown code fences if the model included them despite instructions
    const clean = content
      .trim()
      .replace(/^```(?:json)?\s*/, '')
      .replace(/\s*```$/, '')
      .trim()

    const results = JSON.parse(clean)
    return NextResponse.json(Array.isArray(results) ? results : [results])
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 })
    }
    return NextResponse.json({ error: 'AI lookup failed' }, { status: 500 })
  }
}
