'use client'

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded text-sm font-medium"
    >
      🖨️ Print / Save PDF
    </button>
  )
}
