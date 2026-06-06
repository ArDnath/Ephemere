'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { Suspense, useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { LoadingSvgScreen } from '@/components/ui/LoadingSvgScreen'
import { GithubAuthAction } from '@/lib/actions/authActions'

function GitHubCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const code = searchParams.get('code')
  const hasStartedRef = useRef(false)

  const { execute } = useAction(GithubAuthAction, {
    onSuccess: (result) => {
      if (result.data?.success) {
        toast.success('Successfully authenticated with GitHub', {
          id: 'github-auth',
        })
        // Use setTimeout to ensure cookie is set before navigation
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      } else {
        toast.error('Authentication failed', { id: 'github-auth' })
        setTimeout(() => {
          router.push('/login')
        }, 500)
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Authentication failed', {
        id: 'github-auth',
      })
      setTimeout(() => {
        router.push('/login')
      }, 500)
    },
  })

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    if (error) {
      toast.error('GitHub authentication failed')
      setTimeout(() => {
        router.push('/login')
      }, 500)
      return
    }

    if (!code) {
      toast.error('No authorization code received from GitHub')
      setTimeout(() => {
        router.push('/login')
      }, 500)
      return
    }

    const toastId = 'github-auth'
    toast.loading('Authenticating with GitHub...', { id: toastId })

    execute({ code })
  }, [error, code, router, execute])

  return <LoadingSvgScreen message="Authenticating with GitHub..." />
}

export default function GitHubCallbackPage() {
  return (
    <Suspense
      fallback={<LoadingSvgScreen message="Loading authentication..." />}
    >
      <GitHubCallbackContent />
    </Suspense>
  )
}
