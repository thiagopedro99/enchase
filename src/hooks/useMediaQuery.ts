import { useEffect, useState } from 'react'

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    const list = window.matchMedia(query)
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches)

    setMatches(list.matches)
    list.addEventListener('change', handleChange)

    return () => list.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
