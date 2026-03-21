'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Mode = { id: string; name: string; channelCount: number }
type Fixture = { id: string; manufacturer: string; name: string; weight: number; powerConsumption: number; isGlobal: boolean; modes: Mode[] }

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/fixtures')
    if (res.ok) setFixtures(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fixture?')) return
    await fetch(`/api/fixtures/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = fixtures.filter((f) =>
    `${f.manufacturer} ${f.name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Fixture Library</h1>
        <Link href="/fixtures/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Add Fixture</Link>
      </div>
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
                      <Link href={`/fixtures/${f.id}/edit`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</Link>
                      <button onClick={() => handleDelete(f.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No fixtures found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
