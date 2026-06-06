'use client'

import { Input } from '@ephemere/ui/components/ui/input.tsx'
import { LoaderCircle, Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useDebounce } from '@/hooks/useDebounce'

export default function SearchBar({ search }: { search: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const [value, setValue] = useState(search)
  const debouncedValue = useDebounce(value, 500)
  const isLoading = value !== debouncedValue

  useEffect(() => {
    const currentParams = new URLSearchParams(searchParamsString)
    const currentValue = currentParams.get('search') ?? ''
    if (currentValue === debouncedValue) return

    const params = new URLSearchParams(searchParamsString)
    if (debouncedValue) {
      params.set('search', debouncedValue)
    } else {
      params.delete('search')
    }
    const query = params.toString()
    router.replace(query ? `/dashboard?${query}` : '/dashboard', {
      scroll: false,
    })
  }, [debouncedValue, router, searchParamsString])

  return (
    <div className="relative w-full lg:w-96">
      <Input
        className="peer w-full rounded-md border-[hsl(var(--border))] bg-[hsl(var(--background))] pe-9 ps-9 text-[hsl(var(--foreground))]"
        placeholder="Search..."
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
        {isLoading ? (
          <LoaderCircle
            className="animate-spin"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
            role="presentation"
          />
        ) : (
          <Search size={16} strokeWidth={2} aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
