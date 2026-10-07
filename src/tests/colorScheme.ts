type Scheme = 'light' | 'dark'

type Listener = (event: MediaQueryListEvent) => void

const darkQuery = '(prefers-color-scheme: dark)'

export const mockSystemColorScheme = (initial: Scheme) => {
  let dark = initial === 'dark'
  const listeners = new Set<Listener>()
  const original = window.matchMedia

  window.matchMedia = ((query: string) => {
    if (query !== darkQuery) return original(query)

    return {
      matches: dark,
      media: query,
      onchange: null,
      addEventListener: (_: string, listener: Listener) => listeners.add(listener),
      removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true
    } as MediaQueryList
  }) as typeof window.matchMedia

  return {
    set: (scheme: Scheme) => {
      dark = scheme === 'dark'
      listeners.forEach((listener) => listener({ matches: dark, media: darkQuery } as MediaQueryListEvent))
    },
    restore: () => {
      window.matchMedia = original
    }
  }
}
