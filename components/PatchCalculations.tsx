'use client'
import { useMemo } from 'react'
import {
  getGroupPhases,
  getUniverseCoveragePercent,
  getUsedRangesByUniverse,
} from '@/lib/calculations'

type Mode = { channelCount: number }
type Group = { universe: string; startingAddress: number; amount: number; mode: Mode; fixture: { powerConsumption: number; weight: number } }

type StatItem = { value: string; label: string; sub?: string }

export default function PatchCalculations({ groups }: { groups: Group[] }) {
  const totalPower = groups.reduce((s, g) => s + g.fixture.powerConsumption * g.amount, 0)
  const totalWeight = groups.reduce((s, g) => s + g.fixture.weight * g.amount, 0)
  const phases = getGroupPhases(totalPower)

  const stats: StatItem[] = [
    { value: `${totalPower.toFixed(0)} W`, label: 'Total Power' },
    { value: `${totalWeight.toFixed(1)} kg`, label: 'Total Weight' },
    { value: `${phases}`, label: 'Phases Required', sub: '(@ 230V / 16A)' },
  ]

  const usedByUniverse = useMemo(() => getUsedRangesByUniverse(groups), [groups])
  const universes = useMemo(() => Object.keys(usedByUniverse).sort(), [usedByUniverse])

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ value, label, sub }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
            {sub && <div className="text-xs text-gray-400">{sub}</div>}
          </div>
        ))}
      </div>

      {universes.length > 0 && (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-800 mb-3">DMX Universe Coverage</div>

          <div className="flex flex-wrap gap-2">
            {universes.map((u) => {
              const percent = getUniverseCoveragePercent(usedByUniverse[u])

              return (
                <div
                  key={u}
                  className="px-3 py-2 rounded border border-gray-200 bg-gray-50 text-sm"
                >
                  <span className="font-mono font-bold">{u}</span>
                  <span className="text-gray-500"> — {percent.toFixed(1)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
