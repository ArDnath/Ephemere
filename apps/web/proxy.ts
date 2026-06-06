import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { apiUrl } from './lib/config/urls'

const protectedPaths = ['/dashboard', '/history']
const authPaths = ['/login', '/register']

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token) {
    try {
      const response = await fetch(apiUrl('/api/v1/auth/me'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const response = NextResponse.redirect(
          new URL('/login?error=no_user_found', request.url)
        )
        response.cookies.delete('token')
        return response
      }

      const { user } = await response.json()
      if (!user) {
        const response = NextResponse.redirect(
          new URL('/login?error=no_user_found', request.url)
        )
        response.cookies.delete('token')
        return response
      }
      if (authPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      const response = NextResponse.redirect(
        new URL('/error?code=something_went_wrong', request.url)
      )
      response.cookies.delete('token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/history/:path*',
    '/login',
    '/register',
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
