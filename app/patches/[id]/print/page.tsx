import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PrintPatchTable from '@/components/PrintPatchTable'
import PrintButton from '@/components/PrintButton'

export default async function PrintPage({ params }: { params: Promise<{ id?: string }> }) {
  const { id } = await params
  if (!id) notFound()

  const patch = await prisma.patch.findUnique({
    where: { id },
    include: { groups: { include: { fixture: true, mode: true }, orderBy: { order: 'asc' } } },
  })
  if (!patch) notFound()

  const dateStr = new Date(patch.updatedAt).toLocaleDateString('fi-FI')

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 bg-white min-h-screen print:px-0 print:py-0">
      {/* Top header: date left, designer info right */}
      <div className="flex justify-between items-start mb-8 text-sm">
        <div className="text-gray-500">Updated {dateStr}</div>
        <div className="text-right">
          <div className="font-bold">{patch.designerName}</div>
          {patch.designerPhone && <div>{patch.designerPhone}</div>}
          {patch.designerEmail && <div>{patch.designerEmail}</div>}
          {patch.designerCompany && <div>{patch.designerCompany}</div>}
        </div>
      </div>

      {/* Centered title block */}
      <div className="text-center mb-10">
        <h1 className="text-7xl font-black tracking-widest text-gray-900 mb-4">PATCH</h1>
        <h2 className="text-2xl font-bold text-gray-800">{patch.title}</h2>
      </div>

      {/* Grouped fixture tables */}
      <div className="mb-8">
        <PrintPatchTable groups={patch.groups} />
      </div>

      {patch.notes && (
        <div className="mt-6 border border-gray-300 rounded p-4">
          <div className="font-medium text-gray-700 mb-1">Notes</div>
          <div className="text-sm text-gray-600">{patch.notes}</div>
        </div>
      )}

      {/* Page footer */}
      <div className="mt-12 text-sm text-gray-400">Page 1 of 1</div>

      <div className="mt-8 print:hidden">
        <PrintButton />
      </div>
    </div>
  )
}
