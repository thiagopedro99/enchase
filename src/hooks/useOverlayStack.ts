import { useCallback, useEffect, useRef } from 'react'

const stack: symbol[] = []

const pointer: { top: symbol | undefined; installed: boolean } = { top: undefined, installed: false }

const topOfStack = () => stack[stack.length - 1]

const installPointerTracking = () => {
  if (pointer.installed || typeof document === 'undefined') return

  pointer.installed = true
  document.addEventListener(
    'pointerdown',
    () => {
      pointer.top = topOfStack()
    },
    true
  )
  document.addEventListener('click', () => queueMicrotask(() => (pointer.top = undefined)))
}

export const useOverlayStack = (active: boolean) => {
  const token = useRef(Symbol('overlay'))

  useEffect(() => {
    if (!active) return undefined

    installPointerTracking()
    const current = token.current
    stack.push(current)

    return () => {
      const index = stack.indexOf(current)
      if (index >= 0) stack.splice(index, 1)
    }
  }, [active])

  const isTop = useCallback(() => topOfStack() === token.current, [])
  const wasTopAtPointerDown = useCallback(() => (pointer.top === undefined ? topOfStack() === token.current : pointer.top === token.current), [])

  return Object.assign(isTop, { wasTopAtPointerDown })
}
