import { NextRequest } from 'next/server'

/**
 * Returns true when the incoming API request originates from localhost.
 * Works with the x-is-localhost header set by proxy.ts.
 */
export function isLocalhostRequest(request: NextRequest): boolean {
  return request.headers.get('x-is-localhost') === '1'
}
