import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    // Sync initial state without creating a dependency on `matches`
    setMatches(media.matches)

    // Use the native MediaQueryList change event instead of resize
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query]) // Only re-run when the query string itself changes

  return matches
}
