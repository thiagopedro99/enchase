const staleMs = 1000

const tinyThreshold = 1e-7

const sameBox = (a: DOMRect, b: DOMRect) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height

const rootMarginOf = (rect: DOMRect) => {
  const root = document.documentElement

  return [rect.top, root.clientWidth - rect.right, root.clientHeight - rect.bottom, rect.left].map((value) => `${-Math.floor(value)}px`).join(' ')
}

export const observeMove = (element: Element, onMove: () => void) => {
  if (typeof IntersectionObserver === 'undefined') return () => undefined

  const state: { observer?: IntersectionObserver; timer: number; active: boolean } = { timer: 0, active: true }

  const refresh = (skip = false, threshold = 1): void => {
    clearTimeout(state.timer)
    state.observer?.disconnect()
    if (!state.active) return

    const rect = element.getBoundingClientRect()
    if (!skip) onMove()
    if (!rect.width || !rect.height) return

    const first = { value: true }
    state.observer = new IntersectionObserver(
      ([entry]) => {
        if (!sameBox(element.getBoundingClientRect(), rect)) return refresh()

        const ratio = entry.intersectionRatio
        if (ratio !== threshold && !first.value) return refresh()
        if (ratio !== threshold && !ratio) state.timer = window.setTimeout(() => refresh(false, tinyThreshold), staleMs)
        if (ratio !== threshold && ratio) refresh(false, ratio)
        first.value = false
      },
      { root: document, rootMargin: rootMarginOf(rect), threshold: Math.max(0, Math.min(1, threshold)) || 1 }
    )
    state.observer.observe(element)
  }

  const onResize = () => refresh(true)
  window.addEventListener('resize', onResize)
  refresh(true)

  return () => {
    state.active = false
    clearTimeout(state.timer)
    window.removeEventListener('resize', onResize)
    state.observer?.disconnect()
  }
}
