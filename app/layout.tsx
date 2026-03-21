import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Patch Generator',
  description: 'Lighting patch generator for lighting designers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <SessionProvider>
          <Nav />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
