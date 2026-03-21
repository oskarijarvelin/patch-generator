'use client'
import { getGroupPhases } from '@/lib/calculations'

type Group = { fixture: { powerConsumption: number; weight: number }; amount: number }

export default function PatchCalculations({ groups }: { groups: Group[] }) {
  const totalPower = groups.reduce((s, g) => s + g.fixture.powerConsumption * g.amount, 0)
  const totalWeight = groups.reduce((s, g) => s + g.fixture.weight * g.amount, 0)
  const phases = getGroupPhases(totalPower)
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { value: `${totalPower.toFixed(0)} W`, label: 'Total Power' },
        { value: `${totalWeight.toFixed(1)} kg`, label: 'Total Weight' },
        { value: `${phases}`, label: 'Phases Required', sub: '(@ 230V / 16A)' },
      ].map(({ value, label, sub }) => (
        <div key={label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          <div className="text-sm text-gray-500 mt-1">{label}</div>
          {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
      ))}
    </div>
  )
}
