'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateSlug } from '@/lib/slug'

export default function NewPatchPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [designerName, setDesignerName] = useState('')
  const [designerEmail, setDesignerEmail] = useState('')
  const [designerPhone, setDesignerPhone] = useState('')
  const [designerCompany, setDesignerCompany] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugEdited) setSlug(generateSlug(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch('/api/patches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, designerName, designerEmail, designerPhone, designerCompany, notes }),
    })
    setSaving(false)
    if (res.ok) {
      const data = await res.json()
      router.push(`/patches/${data.slug}`)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Failed to create patch')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">New Patch</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patch Title *</label>
          <input value={title} onChange={(e) => handleTitleChange(e.target.value)} required placeholder="e.g. Main Stage 2024" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">/patches/</span>
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
              onBlur={(e) => setSlug(generateSlug(e.target.value))}
              required
              placeholder="my-patch-name"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Auto-generated from title. Only lowercase letters, numbers and hyphens.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Designer Name *</label>
          <input value={designerName} onChange={(e) => setDesignerName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={designerEmail} onChange={(e) => setDesignerEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={designerPhone} onChange={(e) => setDesignerPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input value={designerCompany} onChange={(e) => setDesignerCompany(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium">{saving ? 'Creating…' : 'Create Patch'}</button>
          <Link href="/dashboard" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
