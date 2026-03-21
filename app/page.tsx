import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Patch Generator</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Professional DMX patch management for lighting designers. Create, manage, and print patch sheets with automatic address calculation and conflict detection.
        </p>
      </div>
      <div className="flex justify-center gap-4 mb-16">
        <Link href="/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg">Sign In</Link>
        <Link href="/auth/register" className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-medium text-lg">Create Account</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: '📋', title: 'Patch Management', desc: 'Create and manage multiple lighting patches with full designer contact details.' },
          { icon: '⚡', title: 'Auto Calculations', desc: 'Automatic DMX address calculation, power consumption, weight totals, and phase requirements.' },
          { icon: '🖨️', title: 'Print Ready', desc: 'Generate print-optimized patch sheets with professional formatting for on-site use.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
