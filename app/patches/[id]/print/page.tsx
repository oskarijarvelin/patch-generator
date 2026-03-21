import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PatchTable from '@/components/PatchTable'
import PatchCalculations from '@/components/PatchCalculations'

export default async function PrintPage({ params }: { params: { id: string } }) {
  const patch = await prisma.patch.findUnique({
    where: { id: params.id },
    include: { groups: { include: { fixture: true, mode: true }, orderBy: { order: 'asc' } } },
  })
  if (!patch) notFound()

  return (
    <div className="max-w-5xl mx-auto px-8 py-10 print:p-4">
      <div className="mb-6 print:mb-4">
        <h1 className="text-6xl font-black tracking-widest text-gray-900 mb-1">PATCH</h1>
        <div className="text-xl font-semibold text-gray-700 mb-1">{patch.title}</div>
        <div className="text-sm text-gray-500">Last updated: {new Date(patch.updatedAt).toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="space-y-1">
          <div><span className="font-medium">Designer:</span> {patch.designerName}</div>
          {patch.designerCompany && <div><span className="font-medium">Company:</span> {patch.designerCompany}</div>}
          {patch.designerEmail && <div><span className="font-medium">Email:</span> {patch.designerEmail}</div>}
          {patch.designerPhone && <div><span className="font-medium">Phone:</span> {patch.designerPhone}</div>}
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <PatchTable groups={patch.groups} />
      </div>

      <PatchCalculations groups={patch.groups} />

      {patch.notes && (
        <div className="mt-6 border border-gray-300 rounded p-4">
          <div className="font-medium text-gray-700 mb-1">Notes</div>
          <div className="text-sm text-gray-600">{patch.notes}</div>
        </div>
      )}

      <div className="mt-8 print:hidden">
        <button onClick={() => window.print()} className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded text-sm font-medium">🖨️ Print / Save PDF</button>
      </div>
    </div>
  )
}
