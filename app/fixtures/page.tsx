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

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [importError, setImportError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const filtered = fixtures.filter((f) =>
    `${f.manufacturer} ${f.name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Fixture Library</h1>
        <div className="flex gap-2 flex-wrap">
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
            aria-label="Import fixtures CSV"
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

      <input
        aria-label="Search fixtures"
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
