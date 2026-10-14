import { useEffect, useRef, useState } from 'react'

export type PresenceState = 'entering' | 'open' | 'exiting' | 'closed'

export type PresenceOptions = {
  exitMs?: number
}

const defaultExitMs = 300

const afterTwoFrames = (callback: () => void) => {
  if (typeof requestAnimationFrame !== 'function') {
    const timer = setTimeout(callback, 0)

    return () => clearTimeout(timer)
  }

  let second = 0
  const first = requestAnimationFrame(() => {
    second = requestAnimationFrame(callback)
  })

  return () => {
    cancelAnimationFrame(first)
    cancelAnimationFrame(second)
  }
}

export const usePresence = <Element extends HTMLElement = HTMLElement>(open: boolean, { exitMs = defaultExitMs }: PresenceOptions = {}) => {
  const [state, setState] = useState<PresenceState>(open ? 'open' : 'closed')
  const ref = useRef<Element>(null)

  if (open && (state === 'closed' || state === 'exiting')) setState('entering')
  if (!open && (state === 'open' || state === 'entering')) setState('exiting')

  useEffect(() => {
    if (state === 'entering') return afterTwoFrames(() => setState('open'))

    if (state !== 'exiting') return undefined

    const element = ref.current
    const finish = () => setState('closed')
    const handleEnd = (event: Event) => {
      if (event.target === element) finish()
    }
    const timer = setTimeout(finish, exitMs)

    element?.addEventListener('transitionend', handleEnd)
    element?.addEventListener('animationend', handleEnd)

    return () => {
      clearTimeout(timer)
      element?.removeEventListener('transitionend', handleEnd)
      element?.removeEventListener('animationend', handleEnd)
    }
  }, [state, exitMs])

  return { mounted: state !== 'closed', state, ref }
}
