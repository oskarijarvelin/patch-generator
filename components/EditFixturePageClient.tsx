'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

type ModeInput = { id?: string; name: string; channelCount: string }

export default function EditFixturePage() {
  const router = useRouter()
  const params = useParams()
  const [manufacturer, setManufacturer] = useState('')
  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')
  const [power, setPower] = useState('')
  const [isGlobal, setIsGlobal] = useState(false)
  const [modes, setModes] = useState<ModeInput[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/fixtures/${params.id}`)
      .then((r) => r.json())
      .then((f) => {
        setManufacturer(f.manufacturer)
        setName(f.name)
        setWeight(String(f.weight))
        setPower(String(f.powerConsumption))
        setIsGlobal(f.isGlobal)
        setModes(f.modes.map((m: { id: string; name: string; channelCount: number }) => ({ id: m.id, name: m.name, channelCount: String(m.channelCount) })))
      })
  }, [params.id])

  const addMode = () => setModes([...modes, { name: '', channelCount: '' }])
  const updateMode = (i: number, field: keyof ModeInput, val: string) => {
    const m = [...modes]; m[i] = { ...m[i], [field]: val }; setModes(m)
  }
  const removeMode = (i: number) => setModes(modes.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch(`/api/fixtures/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manufacturer, name, weight: Number(weight), powerConsumption: Number(power), isGlobal, modes: modes.map((m) => ({ id: m.id, name: m.name, channelCount: Number(m.channelCount) })) }),
    })
    setSaving(false)
    if (res.ok) router.push('/fixtures')
    else { const d = await res.json(); setError(d.error ?? 'Failed to save') }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Fixture</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer *</label>
            <input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Power (W) *</label>
            <input type="number" value={power} onChange={(e) => setPower(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} className="rounded" />
          Add to global library
        </label>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Modes</label>
            <button type="button" onClick={addMode} className="text-blue-600 hover:text-blue-800 text-xs font-medium">+ Add Mode</button>
          </div>
          <div className="space-y-2">
            {modes.map((m, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={m.name} onChange={(e) => updateMode(i, 'name', e.target.value)} placeholder="Mode name" required className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm" />
                <input type="number" value={m.channelCount} onChange={(e) => updateMode(i, 'channelCount', e.target.value)} placeholder="Ch" required min="1" className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm" />
                {modes.length > 1 && <button type="button" onClick={() => removeMode(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium">{saving ? 'Saving…' : 'Save Changes'}</button>
          <button type="button" onClick={() => router.back()} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm">Cancel</button>
        </div>
      </form>
    </div>
  )
}
