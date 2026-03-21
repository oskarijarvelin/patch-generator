'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import SearchableSelect from '@/components/SearchableSelect'

type Mode = { id: string; name: string; channelCount: number }
type Fixture = { id: string; name: string; manufacturer: string; weight: number; powerConsumption: number; modes: Mode[] }
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
  fixtures: Fixture[]
  patchId: string
  onGroupChanged: () => void
}

const UNIVERSES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function EditGroupRow({
  group,
  fixtures,
  patchId,
  onDone,
}: {
  group: Group
  fixtures: Fixture[]
  patchId: string
  onDone: () => void
}) {
  const [position, setPosition] = useState(group.position)
  const [universe, setUniverse] = useState(group.universe)
  const [startingId, setStartingId] = useState(String(group.startingId))
  const [startingAddress, setStartingAddress] = useState(String(group.startingAddress))
  const [amount, setAmount] = useState(String(group.amount))
  const [manufacturer, setManufacturer] = useState(group.fixture.manufacturer)
  const [fixtureId, setFixtureId] = useState(group.fixture.id)
  const [modeId, setModeId] = useState(group.mode.id)
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

  // Reset downstream when manufacturer changes (skip on initial render)
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
    const f = fixtures.find((x) => x.id === fixtureId)
    const modes = f?.modes ?? []
    if (!modes.find((m) => m.id === modeId)) setModeId(modes[0]?.id ?? '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId])

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/patches/${patchId}/groups/${group.id}`, {
        method: 'PUT',
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
        const d = await res.json().catch(() => ({}))
        setError(d?.error ?? 'Failed to save')
        return
      }
      onDone()
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="bg-blue-50 border-b border-gray-200">
      <td colSpan={6} className="px-3 py-3">
        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Position</label>
            <input aria-label="Position" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Universe</label>
            <select value={universe} onChange={(e) => setUniverse(e.target.value)} aria-label="Universe" className="w-full border border-gray-300 rounded px-2 py-1 text-xs">
              {UNIVERSES.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Start ID</label>
            <input aria-label="Start ID" type="number" value={startingId} onChange={(e) => setStartingId(e.target.value)} min="1" className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Start Addr</label>
            <input aria-label="Start Address" type="number" value={startingAddress} onChange={(e) => setStartingAddress(e.target.value)} min="1" max="512" className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Amount</label>
            <input aria-label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Manufacturer</label>
            <SearchableSelect
              options={manufacturerOptions}
              value={manufacturer}
              onChange={setManufacturer}
              placeholder="Select manufacturer…"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Model</label>
            <SearchableSelect
              options={modelOptions}
              value={fixtureId}
              onChange={setFixtureId}
              placeholder="Select model…"
              disabled={!manufacturer}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Mode</label>
            <SearchableSelect
              options={modeOptions}
              value={modeId}
              onChange={setModeId}
              placeholder="Select mode…"
              disabled={!fixtureId}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded text-xs font-medium">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={onDone} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs">Cancel</button>
        </div>
      </td>
    </tr>
  )
}

export default function GroupedPatchTable({ groups, fixtures, patchId, onGroupChanged }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const sorted = [...groups].sort((a, b) => a.order - b.order)

  // Group by fixture + mode while preserving order of first occurrence
  const seen = new Map<string, { fixture: Fixture; mode: Mode; groups: Group[] }>()
  for (const g of sorted) {
    const key = `${g.fixture.id}_${g.mode.id}`
    if (!seen.has(key)) seen.set(key, { fixture: g.fixture, mode: g.mode, groups: [] })
    seen.get(key)!.groups.push(g)
  }

  const handleDelete = async (groupId: string) => {
    if (!confirm('Remove this group?')) return
    await fetch(`/api/patches/${patchId}/groups/${groupId}`, { method: 'DELETE' })
    onGroupChanged()
  }

  if (groups.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-gray-400 text-sm">No groups added yet.</div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full align-top">
        <table className="w-full border-collapse text-sm">
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[6%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
            <col className="w-[38%]" />
            <col className="w-[22%]" />
          </colgroup>
          <tbody>
            {Array.from(seen.values()).map(({ fixture, mode, groups: fGroups }, sectionIdx) => {
              const totalPcs = fGroups.reduce((sum, g) => sum + g.amount, 0)
              const uniqueUniverses = new Set(fGroups.map((g) => g.universe)).size
              const universeLabel = uniqueUniverses === 1 ? 'universe' : 'universes'

              return (
                <>
                  <tr className="bg-gray-100">
                    <td title="Manufacturer" colSpan={2} className="border border-gray-300 px-3 py-2 font-bold">
                      {fixture.manufacturer}
                    </td>
                    <td title="Fixture Name" colSpan={2} className="border border-gray-300 px-3 py-2">
                      {fixture.name}
                    </td>
                    <td title="Fixture Mode" className="border border-gray-300 px-3 py-2">
                      <span className="font-bold">MODE:</span> {mode.name} ({mode.channelCount}ch)
                    </td>
                    <td className="border border-gray-300 px-3 py-2 font-bold">
                      Total {totalPcs} pieces in {uniqueUniverses} {universeLabel}
                    </td>
                  </tr>

                  <tr className="bg-gray-50">
                    <td title="Pieces" className="border border-gray-300 px-3 py-2 font-semibold text-xs">Pcs</td>
                    <td title="Universe" className="border border-gray-300 px-3 py-2 font-semibold text-xs">Uni</td>
                    <td title="ID" className="border border-gray-300 px-3 py-2 font-semibold text-xs">ID</td>
                    <td title="Position" className="border border-gray-300 px-3 py-2 font-semibold text-xs">Position</td>
                    <td title="Addresses" colSpan={2} className="border border-gray-300 px-3 py-2 font-semibold text-xs">Addresses</td>
                  </tr>

                  {fGroups.map((g) => {
                    if (editingId === g.id) {
                      return (
                        <EditGroupRow
                          key={g.id}
                          group={g}
                          fixtures={fixtures}
                          patchId={patchId}
                          onDone={() => { setEditingId(null); onGroupChanged() }}
                        />
                      )
                    }

                    const addresses = Array.from(
                      { length: g.amount },
                      (_, i) => g.startingAddress + i * g.mode.channelCount
                    )
                    const idEnd = g.startingId + g.amount - 1
                    const idRange = g.amount > 1 ? `${g.startingId} – ${idEnd}` : `${g.startingId}`

                    return (
                      <tr key={g.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td title="Pieces" className="border border-gray-300 px-3 py-2 whitespace-nowrap">{g.amount}</td>
                        <td title="Universe" className="border border-gray-300 px-3 py-2 font-mono font-bold whitespace-nowrap">{g.universe}</td>
                        <td title="ID" className="border border-gray-300 px-3 py-2 font-mono whitespace-nowrap">{idRange}</td>
                        <td title="Position" className="border border-gray-300 px-3 py-2 whitespace-nowrap">{g.position}</td>
                        <td title="Addresses" colSpan={2} className="border border-gray-300 px-3 py-2 font-mono text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{addresses.join(', ')}</span>
                            <span className="flex gap-1 flex-shrink-0">
                              <button onClick={() => setEditingId(g.id)} className="text-blue-500 hover:text-blue-700 text-xs px-1.5 py-0.5 rounded hover:bg-blue-50">✏️</button>
                              <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:text-red-700 text-xs px-1.5 py-0.5 rounded hover:bg-red-50">✕</button>
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  <tr>
                    <td colSpan={6} className="border-x-0 border-b-0 border-gray-300 px-3 py-8" />
                  </tr>
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
