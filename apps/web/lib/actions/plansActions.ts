'use server'
import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'

import { apiUrl } from '@/lib/config/urls'

import { actionClient } from './safe-actions'

export const activateFreePlanAction = actionClient.action(async () => {
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')
  if (!token) {
    throw new Error('User not logged in')
  }
  const res = await fetch(
    apiUrl('/api/v1/plans/activate-free'),
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    }
  )
  if (res.ok) {
    revalidateTag('user')
    return { success: true }
  } else {
    return { success: false }
  }
})

export const activateProPlanAction = actionClient.action(async () => {
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')
  if (!token) {
    throw new Error('User not logged in')
  }
  const res = await fetch(
    apiUrl('/api/v1/plans/activate-pro'),
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    }
  )
  if (res.ok) {
    revalidateTag('user')
    return { success: true }
  } else {
    return { success: false }
  }
})
