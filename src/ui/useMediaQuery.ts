import { useEffect, useState } from 'react'

/** Track a CSS media query. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    if (!window.matchMedia) return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * Whether to use the desktop "code editor" layout: wide screens with a mouse or
 * trackpad. `?layout=ide` / `?layout=mobile` force either layout.
 */
export function useDesktopLayout(): boolean {
  const wide = useMediaQuery('(min-width: 1024px) and (pointer: fine)')
  const forced = new URLSearchParams(window.location.search).get('layout')
  if (forced === 'ide') return true
  if (forced === 'mobile') return false
  return wide
}
