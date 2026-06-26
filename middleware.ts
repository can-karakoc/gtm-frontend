import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Check for session cookie
  const sessionToken = request.cookies.get('session')

  // If not logged in and trying to access protected route, redirect to login
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (sessionToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/overview', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
