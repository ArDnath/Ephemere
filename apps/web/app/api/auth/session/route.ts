import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { apiUrl } from '@/lib/config/urls'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  if (!token) {
    return new NextResponse(null, { status: 404 })
  }

  try {
    const response = await fetch(
      apiUrl('/api/v1/auth/me'),
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
        next: {
          tags: ['user'],
          revalidate: 60,
        },
        cache: 'force-cache',
      }
    )

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ user: data.user })
    } else {
      return new NextResponse(null, { status: 404 })
    }
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
