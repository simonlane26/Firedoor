import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // Extract subdomain
  const subdomain = getSubdomain(hostname)

  // Clone the request headers
  const requestHeaders = new Headers(request.headers)

  // Add subdomain to headers for use in API routes and pages
  requestHeaders.set('x-tenant-subdomain', subdomain)

  // Continue with the request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

function getSubdomain(hostname: string): string {
  // Remove port if present
  const host = hostname.split(':')[0]

  // For localhost, always use 'default'
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'default'
  }

  // Split hostname by dots
  const parts = host.split('.')

  // If we have at least 3 parts (subdomain.domain.tld), extract subdomain
  if (parts.length >= 3) {
    return parts[0]
  }

  // Default to 'default' subdomain
  return 'default'
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
