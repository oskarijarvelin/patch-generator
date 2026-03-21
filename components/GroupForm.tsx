'use client'
import { useState, useEffect } from 'react'

type Mode = { id: string; name: string; channelCount: number }
type Fixture = { id: string; manufacturer: string; name: string; modes: Mode[] }

interface Props {
  fixtures: Fixture[]
  patchId: string
  onGroupAdded: () => void
}

const UNIVERSES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function GroupForm({ fixtures, patchId, onGroupAdded }: Props) {
  const [position, setPosition] = useState('')
  const [universe, setUniverse] = useState('A')
  const [startingId, setStartingId] = useState('')
  const [startingAddress, setStartingAddress] = useState('')
  const [amount, setAmount] = useState('1')
  const [fixtureId, setFixtureId] = useState('')
  const [modeId, setModeId] = useState('')
  const [modes, setModes] = useState<Mode[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const f = fixtures.find((x) => x.id === fixtureId)
    setModes(f?.modes ?? [])
    setModeId('')
  }, [fixtureId, fixtures])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!position || !fixtureId || !modeId || !startingId || !startingAddress) return
    setSaving(true)
    await fetch(`/api/patches/${patchId}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position, universe, startingId: Number(startingId), startingAddress: Number(startingAddress), amount: Number(amount), fixtureId, modeId }),
    })
    setSaving(false)
    setPosition('')
    setStartingId('')
    setStartingAddress('')
    setAmount('1')
    setFixtureId('')
    setModeId('')
    onGroupAdded()
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Add Group</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Position</label>
            <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. SR" required className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Universe</label>
            <select value={universe} onChange={(e) => setUniverse(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
              {UNIVERSES.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start ID</label>
            <input type="number" value={startingId} onChange={(e) => setStartingId(e.target.value)} min="1" placeholder="1" required className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Addr</label>
            <input type="number" value={startingAddress} onChange={(e) => setStartingAddress(e.target.value)} min="1" max="512" placeholder="1" required className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" placeholder="1" required className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Fixture</label>
            <select value={fixtureId} onChange={(e) => setFixtureId(e.target.value)} required className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
              <option value="">Select fixture</option>
              {fixtures.map((f) => <option key={f.id} value={f.id}>{f.manufacturer} {f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Mode</label>
            <select value={modeId} onChange={(e) => setModeId(e.target.value)} required disabled={!fixtureId} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm disabled:opacity-50">
              <option value="">Select mode</option>
              {modes.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.channelCount}ch)</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium">
          {saving ? 'Adding…' : 'Add Group'}
        </button>
      </form>
    </div>
  )
}
