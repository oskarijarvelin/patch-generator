import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">PatchGen</Link>
          <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm">Dashboard</Link>
          <Link href="/fixtures" className="text-gray-300 hover:text-white text-sm">Fixtures</Link>
        </div>
      </div>
    </nav>
  )
}
