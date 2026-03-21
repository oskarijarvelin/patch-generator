'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import PatchTable from '@/components/PatchTable'
import AddressWarnings from '@/components/AddressWarnings'
import PatchCalculations from '@/components/PatchCalculations'
import GroupForm from '@/components/GroupForm'

type Mode = { id: string; name: string; channelCount: number }
type Fixture = { id: string; manufacturer: string; name: string; weight: number; powerConsumption: number; modes: Mode[] }
type Group = { id: string; position: string; universe: string; startingId: number; startingAddress: number; amount: number; order: number; fixture: Fixture; mode: Mode }
type Patch = { id: string; title: string; designerName: string; designerEmail: string | null; designerPhone: string | null; designerCompany: string | null; notes: string | null; updatedAt: string; groups: Group[] }

export default function PatchPage() {
  const params = useParams()
  const router = useRouter()
  const [patch, setPatch] = useState<Patch | null>(null)
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPatch = useCallback(async () => {
    const res = await fetch(`/api/patches/${params.id}`)
    if (res.status === 401) { router.push('/auth/login'); return }
    if (res.ok) setPatch(await res.json())
  }, [params.id, router])

  useEffect(() => {
    Promise.all([
      fetchPatch(),
      fetch('/api/fixtures').then((r) => r.json()).then(setFixtures),
    ]).then(() => setLoading(false))
  }, [fetchPatch])

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Remove this group?')) return
    await fetch(`/api/patches/${params.id}/groups/${groupId}`, { method: 'DELETE' })
    fetchPatch()
  }

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-10 text-gray-500">Loading...</div>
  if (!patch) return <div className="max-w-6xl mx-auto px-6 py-10 text-gray-500">Patch not found.</div>

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-wide">PATCH</h1>
            <span className="text-gray-400 text-2xl">—</span>
            <h2 className="text-2xl font-semibold text-gray-700">{patch.title}</h2>
          </div>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p><span className="font-medium">Designer:</span> {patch.designerName}</p>
            {patch.designerCompany && <p><span className="font-medium">Company:</span> {patch.designerCompany}</p>}
            {patch.designerEmail && <p><span className="font-medium">Email:</span> {patch.designerEmail}</p>}
            {patch.designerPhone && <p><span className="font-medium">Phone:</span> {patch.designerPhone}</p>}
            <p className="text-gray-400 text-xs mt-1">Last updated: {new Date(patch.updatedAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/patches/${patch.id}/print`} target="_blank" className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium">🖨️ Print View</Link>
          <button onClick={() => router.push('/dashboard')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm">← Back</button>
        </div>
      </div>

      <AddressWarnings groups={patch.groups} />

      <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
        <PatchTable groups={patch.groups} onDeleteGroup={handleDeleteGroup} />
      </div>

      <div className="mb-6">
        <GroupForm fixtures={fixtures} patchId={patch.id} onGroupAdded={fetchPatch} />
      </div>

      <PatchCalculations groups={patch.groups} />

      {patch.notes && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-1">Notes</h3>
          <p className="text-yellow-700 text-sm">{patch.notes}</p>
        </div>
      )}
    </div>
  )
}
