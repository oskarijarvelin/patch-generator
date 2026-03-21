'use client'
import { getLastAddress, getLastUsedAddress, exceedsUniverse } from '@/lib/calculations'

type Mode = { id: string; name: string; channelCount: number }
type Fixture = { id: string; name: string; manufacturer: string; weight: number; powerConsumption: number }
type Group = { id: string; position: string; universe: string; startingId: number; startingAddress: number; amount: number; order: number; fixture: Fixture; mode: Mode }

const universeColors: Record<string, string> = {
  A: 'bg-blue-50', B: 'bg-green-50', C: 'bg-yellow-50', D: 'bg-purple-50',
  E: 'bg-pink-50', F: 'bg-orange-50', G: 'bg-teal-50', H: 'bg-red-50',
  I: 'bg-indigo-50', J: 'bg-lime-50',
}

interface Props { groups: Group[]; onDeleteGroup?: (id: string) => void }

export default function PatchTable({ groups, onDeleteGroup }: Props) {
  const sorted = [...groups].sort((a, b) => a.order - b.order)
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-3 py-2 text-left">Position</th>
            <th className="px-3 py-2 text-left">Universe</th>
            <th className="px-3 py-2 text-right">Start ID</th>
            <th className="px-3 py-2 text-right">Start Addr</th>
            <th className="px-3 py-2 text-right">Amount</th>
            <th className="px-3 py-2 text-left">Fixture</th>
            <th className="px-3 py-2 text-left">Mode</th>
            <th className="px-3 py-2 text-right">Ch</th>
            <th className="px-3 py-2 text-right">Last Addr</th>
            <th className="px-3 py-2 text-right">Power (W)</th>
            <th className="px-3 py-2 text-right">Weight (kg)</th>
            {onDeleteGroup && <th className="px-3 py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((g) => {
            const lastAddr = getLastAddress(g.startingAddress, g.mode.channelCount, g.amount)
            const exceeds = exceedsUniverse(g.startingAddress, g.mode.channelCount, g.amount)
            const color = universeColors[g.universe.toUpperCase()] ?? 'bg-gray-50'
            return (
              <tr key={g.id} className={`${color} border-b border-gray-200`}>
                <td className="px-3 py-2 font-medium">{g.position}</td>
                <td className="px-3 py-2 font-mono font-bold">{g.universe}</td>
                <td className="px-3 py-2 text-right font-mono">{g.startingId}</td>
                <td className="px-3 py-2 text-right font-mono">{g.startingAddress}</td>
                <td className="px-3 py-2 text-right">{g.amount}</td>
                <td className="px-3 py-2">{g.fixture.manufacturer} {g.fixture.name}</td>
                <td className="px-3 py-2">{g.mode.name}</td>
                <td className="px-3 py-2 text-right font-mono">{g.mode.channelCount}</td>
                <td className="px-3 py-2 text-right font-mono">
                  <span className={exceeds ? 'text-red-600 font-bold' : ''}>{lastAddr}</span>
                  {exceeds && <span className="ml-1 text-xs bg-red-100 text-red-700 px-1 rounded">!</span>}
                </td>
                <td className="px-3 py-2 text-right">{(g.fixture.powerConsumption * g.amount).toFixed(0)}</td>
                <td className="px-3 py-2 text-right">{(g.fixture.weight * g.amount).toFixed(1)}</td>
                {onDeleteGroup && (
                  <td className="px-3 py-2">
                    <button onClick={() => onDeleteGroup(g.id)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
                  </td>
                )}
              </tr>
            )
          })}
          {sorted.length === 0 && (
            <tr><td colSpan={onDeleteGroup ? 12 : 11} className="px-3 py-8 text-center text-gray-400">No groups added yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
