'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import SearchableSelect from '@/components/SearchableSelect'

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
  const [manufacturer, setManufacturer] = useState('')
  const [fixtureId, setFixtureId] = useState('')
  const [modeId, setModeId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: unique manufacturers
  const manufacturerOptions = useMemo(() => {
    const unique = Array.from(new Set(fixtures.map((f) => f.manufacturer))).sort()
    return unique.map((m) => ({ value: m, label: m }))
  }, [fixtures])

  // Step 2: models filtered by manufacturer
  const modelOptions = useMemo(() => {
    if (!manufacturer) return []
    return fixtures
      .filter((f) => f.manufacturer === manufacturer)
      .map((f) => ({ value: f.id, label: f.name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [manufacturer, fixtures])

  // Step 3: modes filtered by selected fixture
  const modeOptions = useMemo(() => {
    if (!fixtureId) return []
    const f = fixtures.find((x) => x.id === fixtureId)
    return (f?.modes ?? []).map((m) => ({ value: m.id, label: `${m.name} (${m.channelCount}ch)` }))
  }, [fixtureId, fixtures])

  // Reset downstream selections when manufacturer changes (skip on initial render)
  const isFirstManufacturerRender = useRef(true)
  useEffect(() => {
    if (isFirstManufacturerRender.current) {
      isFirstManufacturerRender.current = false
      return
    }
    setFixtureId('')
    setModeId('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturer])

  // Reset mode when fixture changes (skip on initial render)
  const isFirstFixtureRender = useRef(true)
  useEffect(() => {
    if (isFirstFixtureRender.current) {
      isFirstFixtureRender.current = false
      return
    }
    setModeId('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!position || !fixtureId || !modeId || !startingId || !startingAddress) return

    setSaving(true)
    try {
      const res = await fetch(`/api/patches/${patchId}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position,
          universe,
          startingId: Number(startingId),
          startingAddress: Number(startingAddress),
          amount: Number(amount),
          fixtureId,
          modeId,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setError(data?.error ?? 'Failed to add group')
        return
      }

      setPosition('')
      setStartingId('')
      setStartingAddress('')
      setAmount('1')
      setManufacturer('')
      setFixtureId('')
      setModeId('')
      onGroupAdded()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Add Group</h3>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Position</label>
            <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. SR" required className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Universe</label>
            <select
              aria-label="Universe"
              value={universe}
              onChange={(e) => setUniverse(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Manufacturer</label>
            <SearchableSelect
              options={manufacturerOptions}
              value={manufacturer}
              onChange={setManufacturer}
              placeholder="Select manufacturer…"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Model</label>
            <SearchableSelect
              options={modelOptions}
              value={fixtureId}
              onChange={setFixtureId}
              placeholder="Select model…"
              disabled={!manufacturer}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Mode</label>
            <SearchableSelect
              options={modeOptions}
              value={modeId}
              onChange={setModeId}
              placeholder="Select mode…"
              disabled={!fixtureId}
            />
          </div>
        </div>
        <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium">
          {saving ? 'Adding…' : 'Add Group'}
        </button>
      </form>
    </div>
  )
}
