import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const role = request.cookies.get('role')?.value
  
  const { pathname } = request.nextUrl

  // Protected routes
  const isProtectedRoute = pathname.startsWith('/student') || 
                           pathname.startsWith('/tentor') || 
                           pathname.startsWith('/admin')

  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login if unauthenticated
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based routing validation
    if (pathname.startsWith('/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (pathname.startsWith('/tentor') && role !== 'TENTOR') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Prevent logged-in users from seeing login/root page
  if (pathname === '/login' || pathname === '/') {
    if (token && role) {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } else if (role === 'TENTOR') {
        return NextResponse.redirect(new URL('/tentor/dashboard', request.url))
      } else if (role === 'STUDENT') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url))
      }
    } else if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files with extensions (e.g., .svg, .png)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
