'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Nav() {
  const { data: session } = useSession()
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">PatchGen</Link>
          <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm">Dashboard</Link>
          <Link href="/fixtures" className="text-gray-300 hover:text-white text-sm">Fixtures</Link>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="text-gray-300 text-sm">{session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1.5 rounded"
              >Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-300 hover:text-white text-sm">Sign In</Link>
              <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
