'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type Mode = { id: string; name: string; channelCount: number }
type Fixture = {
  id: string
  manufacturer: string
  name: string
  weight: number
  powerConsumption: number
  isGlobal: boolean
  modes: Mode[]
}
type AiInput = { manufacturer: string; model: string }
type AiResult = {
  manufacturer: string
  name: string
  weight: number
  powerConsumption: number
  modes: { name: string; channelCount: number }[]
}

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [importError, setImportError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showAiPanel, setShowAiPanel] = useState(false)
  const [aiInputs, setAiInputs] = useState<AiInput[]>([{ manufacturer: '', model: '' }])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResults, setAiResults] = useState<AiResult[]>([])
  const [aiError, setAiError] = useState('')
  const [aiImportMsg, setAiImportMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/fixtures')
    if (res.ok) setFixtures(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fixture?')) return
    await fetch(`/api/fixtures/${id}`, { method: 'DELETE' })
    load()
  }

  const handleExport = () => {
    window.location.href = '/api/fixtures/export'
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportMsg('')
    setImportError(false)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/fixtures/import', { method: 'POST', body: formData })
    const data = await res.json()
    if (res.ok) {
      setImportMsg(`Imported ${data.created} fixture(s). ${data.skipped} skipped (already exist).`)
      setImportError(false)
      load()
    } else {
      setImportMsg(data.error ?? 'Import failed')
      setImportError(true)
    }
    setImporting(false)
    e.target.value = ''
  }

  const addAiInput = () => setAiInputs([...aiInputs, { manufacturer: '', model: '' }])
  const updateAiInput = (i: number, field: keyof AiInput, val: string) => {
    const inputs = [...aiInputs]
    inputs[i] = { ...inputs[i], [field]: val }
    setAiInputs(inputs)
  }
  const removeAiInput = (i: number) => setAiInputs(aiInputs.filter((_, idx) => idx !== i))

  const handleAiLookup = async () => {
    setAiLoading(true)
    setAiError('')
    setAiResults([])
    setAiImportMsg('')
    const res = await fetch('/api/fixtures/ai-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtures: aiInputs.filter((f) => f.manufacturer && f.model) }),
    })
    const data = await res.json()
    setAiLoading(false)
    if (res.ok) {
      setAiResults(Array.isArray(data) ? data : [])
    } else {
      setAiError(data.error ?? 'Lookup failed')
    }
  }

  const handleImportAiResults = async () => {
    if (!aiResults.length) return
    setAiImportMsg('')
    const res = await fetch('/api/fixtures/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiResults),
    })
    const data = await res.json()
    if (res.ok) {
      setAiImportMsg(`Imported ${data.created} fixture(s). ${data.skipped} skipped (already exist).`)
      load()
    } else {
      setAiImportMsg(data.error ?? 'Import failed')
    }
  }

  const filtered = fixtures.filter((f) =>
    `${f.manufacturer} ${f.name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Fixture Library</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setShowAiPanel(!showAiPanel)
              setAiResults([])
              setAiError('')
              setAiImportMsg('')
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            ✨ AI Lookup
          </button>
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            ↓ Export CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {importing ? 'Importing…' : '↑ Import CSV'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <Link
            href="/fixtures/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Fixture
          </Link>
        </div>
      </div>

      {importMsg && (
        <div
          className={`mb-4 px-4 py-3 rounded text-sm border ${
            importError
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          {importMsg}
        </div>
      )}

      {showAiPanel && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-purple-900 mb-1">AI Fixture Lookup</h2>
          <p className="text-sm text-purple-700 mb-4">
            Enter fixture manufacturer and model names to automatically retrieve DMX modes, weight,
            and power consumption using AI. Requires{' '}
            <code className="font-mono">OPENAI_API_KEY</code> to be configured on the server.
          </p>
          <div className="space-y-2 mb-3">
            {aiInputs.map((input, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={input.manufacturer}
                  onChange={(e) => updateAiInput(i, 'manufacturer', e.target.value)}
                  placeholder="Manufacturer (e.g. Martin)"
                  className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
                <input
                  value={input.model}
                  onChange={(e) => updateAiInput(i, 'model', e.target.value)}
                  placeholder="Model (e.g. MAC Aura)"
                  className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
                {aiInputs.length > 1 && (
                  <button
                    onClick={() => removeAiInput(i)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            <button
              type="button"
              onClick={addAiInput}
              className="text-purple-700 hover:text-purple-900 text-xs font-medium border border-purple-300 px-3 py-1 rounded"
            >
              + Add another fixture
            </button>
            <button
              onClick={handleAiLookup}
              disabled={aiLoading || !aiInputs.some((f) => f.manufacturer && f.model)}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-medium"
            >
              {aiLoading ? 'Looking up…' : 'Look up fixtures'}
            </button>
          </div>

          {aiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
              {aiError}
            </div>
          )}

          {aiResults.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-purple-900 mb-2">Results</h3>
              <div className="space-y-2 mb-3">
                {aiResults.map((r, i) => (
                  <div key={i} className="bg-white border border-purple-100 rounded p-3 text-sm">
                    <div className="font-medium">
                      {r.manufacturer} {r.name}
                    </div>
                    <div className="text-gray-600">
                      {r.weight} kg &middot; {r.powerConsumption} W
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {r.modes.map((m) => `${m.name} (${m.channelCount}ch)`).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
              {aiImportMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm mb-2">
                  {aiImportMsg}
                </div>
              )}
              <button
                onClick={handleImportAiResults}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Import to Library
              </button>
            </div>
          )}
        </div>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search fixtures..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
      />
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-4 py-2 text-left">Manufacturer</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Modes</th>
                <th className="px-4 py-2 text-right">Weight (kg)</th>
                <th className="px-4 py-2 text-right">Power (W)</th>
                <th className="px-4 py-2 text-center">Global</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">{f.manufacturer}</td>
                  <td className="px-4 py-2 font-medium">{f.name}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {f.modes.map((m) => m.name).join(', ')}
                  </td>
                  <td className="px-4 py-2 text-right">{f.weight}</td>
                  <td className="px-4 py-2 text-right">{f.powerConsumption}</td>
                  <td className="px-4 py-2 text-center">{f.isGlobal ? '✓' : ''}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/fixtures/${f.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No fixtures found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
