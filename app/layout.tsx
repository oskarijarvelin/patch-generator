import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import Nav from '@/components/Nav'
import { Open_Sans, Roboto_Condensed } from 'next/font/google'

const bodyFont = Open_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const titleFont = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-title',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Patch Generator',
  description: 'Lighting patch generator for lighting designers',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </head>
      <body className={`${bodyFont.variable} ${titleFont.variable} font-body`}>
        <SessionProvider>
          <Nav />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
