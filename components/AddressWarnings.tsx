'use client'
import { getLastUsedAddress, exceedsUniverse } from '@/lib/calculations'

type Mode = { channelCount: number }
type Group = { id: string; position: string; universe: string; startingAddress: number; amount: number; mode: Mode }

export default function AddressWarnings({ groups }: { groups: Group[] }) {
  const warnings: string[] = []

  for (const g of groups) {
    if (exceedsUniverse(g.startingAddress, g.mode.channelCount, g.amount)) {
      const last = getLastUsedAddress(g.startingAddress, g.mode.channelCount, g.amount)
      warnings.push(`Group "${g.position}" (Universe ${g.universe}): last used address ${last} exceeds DMX maximum of 512`)
    }
  }

  const byUniverse: Record<string, Array<{ position: string; start: number; end: number }>> = {}
  for (const g of groups) {
    const end = getLastUsedAddress(g.startingAddress, g.mode.channelCount, g.amount)
    if (!byUniverse[g.universe]) byUniverse[g.universe] = []
    byUniverse[g.universe].push({ position: g.position, start: g.startingAddress, end })
  }
  for (const [universe, ranges] of Object.entries(byUniverse)) {
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const a = ranges[i], b = ranges[j]
        if (a.start <= b.end && b.start <= a.end) {
          warnings.push(`Address conflict in Universe ${universe}: "${a.position}" (${a.start}–${a.end}) overlaps with "${b.position}" (${b.start}–${b.end})`)
        }
      }
    }
  }

  if (warnings.length === 0) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <h3 className="text-red-800 font-semibold mb-2">⚠ Address Warnings</h3>
      <ul className="space-y-1">
        {warnings.map((w, i) => <li key={i} className="text-red-700 text-sm">• {w}</li>)}
      </ul>
    </div>
  )
}
