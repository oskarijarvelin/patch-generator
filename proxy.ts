import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : ''
  const isLocalhost =
    ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip === ''

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-is-localhost', isLocalhost ? '1' : '0')

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
