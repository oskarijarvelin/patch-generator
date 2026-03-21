import { exceedsUniverse, getLastUsedAddress, getOverlappingStartAddresses } from '@/lib/calculations'

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
  const overlappingStarts = getOverlappingStartAddresses(groups)

  // Group by fixture + mode while preserving order of first occurrence
  const seen = new Map<string, { fixture: Fixture; mode: Mode; groups: Group[] }>()
  for (const g of sorted) {
    const key = `${g.fixture.id}_${g.mode.id}`
    if (!seen.has(key)) seen.set(key, { fixture: g.fixture, mode: g.mode, groups: [] })
    seen.get(key)!.groups.push(g)
  }

  return (
    <div className="w-full">
      <table className="w-full border-collapse text-sm">
        <colgroup>
          <col className="w-[6%]" />
          <col className="w-[6%]" />
          <col className="w-[12%]" />
          <col className="w-[16%]" />
          <col className="w-[32%]" />
          <col className="w-[28%]" />
        </colgroup>
        <tbody>
          {Array.from(seen.values()).map(({ fixture, mode, groups: fGroups }) => {
            const totalPcs = fGroups.reduce((sum, g) => sum + g.amount, 0)
            const uniqueUniverses = new Set(fGroups.map((g) => g.universe)).size
            const universeLabel = uniqueUniverses === 1 ? 'universe' : 'universes'

            return (
              <>
                <tr className="bg-gray-100">
                  <td title="Manufacturer" colSpan={2} className="border border-gray-400 px-3 py-2 font-bold">
                    {fixture.manufacturer}
                  </td>
                  <td title="Fixture Name" colSpan={2} className="border border-gray-400 px-3 py-2">
                    {fixture.name}
                  </td>
                  <td title="Fixture Mode" className="border border-gray-400 px-3 py-2">
                    <span className="font-bold">MODE:</span> {mode.name}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 font-bold">
                    Total {totalPcs} pieces in {uniqueUniverses} {universeLabel}
                  </td>
                </tr>

                <tr className="bg-gray-50">
                  <td title="Pieces" className="border border-gray-400 px-3 py-2 font-semibold text-xs">Pcs</td>
                  <td title="Universe" className="border border-gray-400 px-3 py-2 font-semibold text-xs">Uni</td>
                  <td title="ID" className="border border-gray-400 px-3 py-2 font-semibold text-xs">ID</td>
                  <td title="Position" className="border border-gray-400 px-3 py-2 font-semibold text-xs">Position</td>
                  <td title="Addresses" colSpan={2} className="border border-gray-400 px-3 py-2 font-semibold text-xs">Addresses</td>
                </tr>

                {fGroups.map((g) => {
                  const addresses = Array.from(
                    { length: g.amount },
                    (_, i) => g.startingAddress + i * g.mode.channelCount
                  )
                  const idEnd = g.startingId + g.amount - 1
                  const idRange = g.amount > 1 ? `${g.startingId} – ${idEnd}` : `${g.startingId}`
                  const overlapKey = `${(g.universe || '').toUpperCase()}:${g.startingAddress}`
                  const overlaps = overlappingStarts.has(overlapKey)

                  return (
                    <tr key={g.id} className="border-b border-gray-300">
                      <td title="Pieces" className="border border-gray-400 px-3 py-2 whitespace-nowrap">{g.amount}</td>
                      <td
                        title="Universe"
                        className={
                          `border border-gray-400 px-3 py-2 font-mono font-bold whitespace-nowrap ` +
                          (overlaps ? 'bg-orange-50 text-orange-800' : '')
                        }
                      >
                        {g.universe}
                      </td>
                      <td title="ID" className="border border-gray-400 px-3 py-2 font-mono whitespace-nowrap">{idRange}</td>
                      <td title="Position" className="border border-gray-400 px-3 py-2 whitespace-nowrap">{g.position}</td>
                      <td
                        title="Addresses"
                        colSpan={2}
                        className={
                          `border border-gray-400 px-3 py-2 font-mono text-xs ` +
                          (overlaps ? 'bg-orange-50' : '')
                        }
                      >
                        {addresses.map((a, idx) => (
                          <span
                            key={idx}
                            className={
                              a > 512
                                ? 'text-red-700 font-bold'
                                : overlaps
                                  ? 'text-orange-800 font-semibold'
                                  : ''
                            }
                          >
                            {a}
                            {idx < addresses.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </td>
                    </tr>
                  )
                })}

                <tr>
                  <td colSpan={6} className="border-x-0 border-b-0 border-gray-400 px-3 py-6" />
                </tr>
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
