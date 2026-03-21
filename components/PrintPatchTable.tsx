type Mode = { id: string; name: string; channelCount: number }
type Fixture = { id: string; name: string; manufacturer: string; weight: number; powerConsumption: number }
type Group = {
  id: string
  position: string
  universe: string
  startingId: number
  startingAddress: number
  amount: number
  order: number
  fixture: Fixture
  mode: Mode
}

interface Props {
  groups: Group[]
}

export default function PrintPatchTable({ groups }: Props) {
  const sorted = [...groups].sort((a, b) => a.order - b.order)

  // Group by fixture + mode while preserving order of first occurrence
  const seen = new Map<string, { fixture: Fixture; mode: Mode; groups: Group[] }>()
  for (const g of sorted) {
    const key = `${g.fixture.id}_${g.mode.id}`
    if (!seen.has(key)) {
      seen.set(key, { fixture: g.fixture, mode: g.mode, groups: [] })
    }
    seen.get(key)!.groups.push(g)
  }

  return (
    <div className="space-y-6">
      {Array.from(seen.values()).map(({ fixture, mode, groups: fGroups }) => {
        const totalPcs = fGroups.reduce((sum, g) => sum + g.amount, 0)
        const uniqueUniverses = new Set(fGroups.map((g) => g.universe)).size
        const universeLabel = uniqueUniverses === 1 ? 'universe' : 'universes'

        return (
          <table key={`${fixture.id}_${mode.id}`} className="w-full border-collapse text-sm">
            <thead>
              {/* Fixture info header row */}
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left font-bold w-[15%]">
                  {fixture.manufacturer}
                </th>
                <th colSpan={2} className="border border-gray-400 px-3 py-2 text-left font-normal">
                  {fixture.name}
                </th>
                <th className="border border-gray-400 px-3 py-2 text-left font-normal w-[20%]">
                  <span className="font-bold">MODE:</span> {mode.name} {mode.channelCount} ch
                </th>
                <th className="border border-gray-400 px-3 py-2 text-left font-normal w-[25%]">
                  Total {totalPcs} pcs in {uniqueUniverses} {universeLabel}
                </th>
              </tr>
              {/* Column headers row */}
              <tr>
                <th className="border border-gray-400 px-3 py-2 text-left font-bold">Pcs</th>
                <th className="border border-gray-400 px-3 py-2 text-left font-bold">UNI</th>
                <th className="border border-gray-400 px-3 py-2 text-left font-bold">ID</th>
                <th className="border border-gray-400 px-3 py-2 text-left font-bold">Position</th>
                <th className="border border-gray-400 px-3 py-2 text-left font-bold">Addresses</th>
              </tr>
            </thead>
            <tbody>
              {fGroups.map((g) => {
                const addresses = Array.from(
                  { length: g.amount },
                  (_, i) => g.startingAddress + i * g.mode.channelCount
                )
                const idEnd = g.startingId + g.amount - 1
                const idRange = g.amount > 1 ? `${g.startingId}-${idEnd}` : `${g.startingId}`
                return (
                  <tr key={g.id}>
                    <td className="border border-gray-400 px-3 py-2 text-gray-900">{g.amount}</td>
                    <td className="border border-gray-400 px-3 py-2 text-gray-900">{g.universe}</td>
                    <td className="border border-gray-400 px-3 py-2 text-gray-900">{idRange}</td>
                    <td className="border border-gray-400 px-3 py-2 text-gray-900">{g.position}</td>
                    <td className="border border-gray-400 px-3 py-2 text-gray-900">{addresses.join(', ')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )
      })}
    </div>
  )
}
