import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const fixtures = [
    {
      manufacturer: 'ETC',
      name: 'Source Four',
      weight: 2.9,
      powerConsumption: 575,
      isGlobal: true,
      modes: [{ name: 'Dimmer (1ch)', channelCount: 1 }],
    },
    {
      manufacturer: 'Generic',
      name: 'LED PAR',
      weight: 1.5,
      powerConsumption: 150,
      isGlobal: true,
      modes: [
        { name: 'Basic (1ch)', channelCount: 1 },
        { name: '3ch RGB', channelCount: 3 },
        { name: '6ch RGBWAU', channelCount: 6 },
      ],
    },
    {
      manufacturer: 'Martin',
      name: 'MAC Aura',
      weight: 9.5,
      powerConsumption: 320,
      isGlobal: true,
      modes: [
        { name: 'Basic (16ch)', channelCount: 16 },
        { name: 'Extended (38ch)', channelCount: 38 },
      ],
    },
    {
      manufacturer: 'Robe',
      name: 'Robin 100 LEDWash',
      weight: 6.1,
      powerConsumption: 160,
      isGlobal: true,
      modes: [
        { name: 'Basic (6ch)', channelCount: 6 },
        { name: 'Standard (14ch)', channelCount: 14 },
        { name: 'Extended (28ch)', channelCount: 28 },
      ],
    },
    {
      manufacturer: 'Chauvet',
      name: 'Ovation E-910FC',
      weight: 6.8,
      powerConsumption: 320,
      isGlobal: true,
      modes: [
        { name: 'Standard (5ch)', channelCount: 5 },
        { name: 'Extended (15ch)', channelCount: 15 },
      ],
    },
  ]

  for (const f of fixtures) {
    await prisma.fixture.upsert({
      where: { id: f.manufacturer + '-' + f.name },
      update: {},
      create: {
        id: f.manufacturer + '-' + f.name,
        manufacturer: f.manufacturer,
        name: f.name,
        weight: f.weight,
        powerConsumption: f.powerConsumption,
        isGlobal: f.isGlobal,
        modes: { create: f.modes },
      },
    })
  }

  console.log('Seeded fixture library')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
