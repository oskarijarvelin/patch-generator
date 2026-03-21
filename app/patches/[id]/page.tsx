'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AddressWarnings from '@/components/AddressWarnings'
import PatchCalculations from '@/components/PatchCalculations'
import GroupForm from '@/components/GroupForm'
import GroupedPatchTable from '@/components/GroupedPatchTable'
import { generateSlug } from '@/lib/slug'

type Mode = { id: string; name: string; channelCount: number }
type Fixture = { id: string; manufacturer: string; name: string; weight: number; powerConsumption: number; modes: Mode[] }
type Group = { id: string; position: string; universe: string; startingId: number; startingAddress: number; amount: number; order: number; fixture: Fixture; mode: Mode }
type Patch = { id: string; slug: string; title: string; designerName: string; designerEmail: string | null; designerPhone: string | null; designerCompany: string | null; notes: string | null; updatedAt: string; groups: Group[] }

export default function PatchPage() {
  const params = useParams()
  const router = useRouter()
  const [patch, setPatch] = useState<Patch | null>(null)
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  // Edit patch form state
  const [editTitle, setEditTitle] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editSlugEdited, setEditSlugEdited] = useState(false)
  const [editDesignerName, setEditDesignerName] = useState('')
  const [editDesignerEmail, setEditDesignerEmail] = useState('')
  const [editDesignerPhone, setEditDesignerPhone] = useState('')
  const [editDesignerCompany, setEditDesignerCompany] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

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

  const openEdit = () => {
    if (!patch) return
    setEditTitle(patch.title)
    setEditSlug(patch.slug)
    setEditSlugEdited(false)
    setEditDesignerName(patch.designerName)
    setEditDesignerEmail(patch.designerEmail ?? '')
    setEditDesignerPhone(patch.designerPhone ?? '')
    setEditDesignerCompany(patch.designerCompany ?? '')
    setEditNotes(patch.notes ?? '')
    setEditError('')
    setEditing(true)
  }

  const handleEditTitleChange = (value: string) => {
    setEditTitle(value)
    if (!editSlugEdited) setEditSlug(generateSlug(value))
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patch) return
    setEditSaving(true); setEditError('')
    const res = await fetch(`/api/patches/${patch.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        slug: editSlug,
        designerName: editDesignerName,
        designerEmail: editDesignerEmail || null,
        designerPhone: editDesignerPhone || null,
        designerCompany: editDesignerCompany || null,
        notes: editNotes || null,
      }),
    })
    setEditSaving(false)
    if (res.ok) {
      const updated = await res.json()
      setEditing(false)
      // If slug changed, update the URL without a full navigation
      if (updated.slug !== params.id) {
        router.replace(`/patches/${updated.slug}`)
      } else {
        fetchPatch()
      }
    } else {
      const d = await res.json()
      setEditError(d.error ?? 'Failed to save')
    }
  }

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-10 text-gray-500">Loading...</div>
  if (!patch) return <div className="max-w-6xl mx-auto px-6 py-10 text-gray-500">Patch not found.</div>

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-6">
        {editing ? (
          <form onSubmit={handleEditSave} className="flex-1 bg-white rounded-lg border border-gray-200 p-4 mr-4">
            <h3 className="font-semibold text-gray-800 mb-3">Edit Patch Details</h3>
            {editError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3 text-sm">{editError}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Title *</label>
                <input value={editTitle} onChange={(e) => handleEditTitleChange(e.target.value)} required className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">URL Slug *</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 whitespace-nowrap">/patches/</span>
                  <input
                    value={editSlug}
                    onChange={(e) => { setEditSlug(e.target.value); setEditSlugEdited(true) }}
                    onBlur={(e) => setEditSlug(generateSlug(e.target.value))}
                    required
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Designer Name *</label>
                <input value={editDesignerName} onChange={(e) => setEditDesignerName(e.target.value)} required className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Company</label>
                <input value={editDesignerCompany} onChange={(e) => setEditDesignerCompany(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Email</label>
                <input type="email" value={editDesignerEmail} onChange={(e) => setEditDesignerEmail(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Phone</label>
                <input type="tel" value={editDesignerPhone} onChange={(e) => setEditDesignerPhone(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Notes</label>
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={editSaving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-medium">{editSaving ? 'Saving…' : 'Save Changes'}</button>
              <button type="button" onClick={() => setEditing(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm">Cancel</button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-gray-900">PATCH</h1>
              <span className="text-gray-400 text-2xl">—</span>
              <h2 className="text-2xl font-semibold text-gray-700">{patch.title}</h2>
            </div>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p><span className="font-medium">Designer:</span> {patch.designerName}</p>
              {patch.designerCompany && <p><span className="font-medium">Company:</span> {patch.designerCompany}</p>}
              {patch.designerEmail && <p><span className="font-medium">Email:</span> {patch.designerEmail}</p>}
              {patch.designerPhone && <p><span className="font-medium">Phone:</span> {patch.designerPhone}</p>}
              <p className="text-gray-400 text-xs mt-1">
                URL: <span className="font-mono">/patches/{patch.slug}</span> · Last updated: {new Date(patch.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
        <div className="flex gap-2 flex-shrink-0">
          {!editing && (
            <button onClick={openEdit} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium">✏️ Edit</button>
          )}
          <Link href={`/patches/${patch.slug}/print`} target="_blank" className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium">🖨️ Print View</Link>
          <button onClick={() => router.push('/dashboard')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm">← Back</button>
        </div>
      </div>

      <AddressWarnings groups={patch.groups} />

      <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden p-4">
        <GroupedPatchTable groups={patch.groups} fixtures={fixtures} patchId={patch.id} onGroupChanged={fetchPatch} />
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
