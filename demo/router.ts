import { useSyncExternalStore } from 'react'

import { routes } from './defaultData.ts'

const listeners = new Set<() => void>()

const pages: string[] = Object.values(routes)

const trim = (path: string) => path.replace(/\/+$/, '') || routes.home

const subscribe = (notify: () => void) => {
  listeners.add(notify)
  window.addEventListener('popstate', notify)

  return () => {
    listeners.delete(notify)
    window.removeEventListener('popstate', notify)
  }
}

const settle = (hash: string) => {
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null

  if (target) target.scrollIntoView()
  else window.scrollTo(0, 0)
}

export const navigate = (href: string) => {
  const url = new URL(href, window.location.href)

  if (!pages.includes(trim(url.pathname))) {
    window.location.assign(href)

    return
  }

  window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`)
  listeners.forEach((notify) => notify())
  window.requestAnimationFrame(() => settle(url.hash))
}

export const usePath = () =>
  useSyncExternalStore(
    subscribe,
    () => trim(window.location.pathname),
    () => routes.home
  )
