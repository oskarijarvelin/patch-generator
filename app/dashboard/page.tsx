import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type PatchRow = {
  id: string
  slug: string
  title: string
  designerName: string
  updatedAt: Date
  _count: { groups: number }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const patches: PatchRow[] = await prisma.patch.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      designerName: true,
      updatedAt: true,
      _count: { select: { groups: true } },
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {session.user.name}</p>
        </div>
        <Link href="/patches/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">+ New Patch</Link>
      </div>

      {patches.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-semibold text-gray-700 mb-2">No patches yet</h3>
          <p className="text-gray-500 text-sm mb-4">Create your first lighting patch to get started.</p>
          <Link href="/patches/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Create Patch</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {patches.map((p) => (
            <Link key={p.id} href={`/patches/${p.slug}`} className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{p.title}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{p.designerName} · {p._count.groups} group{p._count.groups !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-xs text-gray-400">{new Date(p.updatedAt).toLocaleDateString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
