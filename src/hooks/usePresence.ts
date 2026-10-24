import { useEffect, useRef, useState } from 'react'

export type PresenceState = 'entering' | 'open' | 'exiting' | 'closed'

export type PresenceOptions = {
  exitMs?: number | undefined
}

const defaultExitMs = 300

const exitMarginMs = 50

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

const toMilliseconds = (value: string) => {
  const text = value.trim()
  const number = Number.parseFloat(text)
  if (!Number.isFinite(number)) return 0

  return text.endsWith('ms') ? number : number * 1000
}

const longest = (durations: string, delays: string) => {
  const durationList = durations.split(',').filter((item) => item.trim() !== '')
  const delayList = delays.split(',').filter((item) => item.trim() !== '')
  if (durationList.length === 0) return undefined

  return Math.max(...durationList.map((duration, index) => toMilliseconds(duration) + (delayList.length === 0 ? 0 : toMilliseconds(delayList[index % delayList.length]))))
}

export const measureExitMs = (element: HTMLElement): number | undefined => {
  if (typeof getComputedStyle !== 'function') return undefined

  const style = getComputedStyle(element)
  const transition = longest(style.transitionDuration ?? '', style.transitionDelay ?? '')
  const animation = style.animationName && style.animationName !== 'none' ? longest(style.animationDuration ?? '', style.animationDelay ?? '') : undefined
  const values = [transition, animation].filter((value): value is number => value !== undefined)

  return values.length === 0 ? undefined : Math.max(...values)
}

export const usePresence = <Element extends HTMLElement = HTMLElement>(open: boolean, { exitMs }: PresenceOptions = {}) => {
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
    const measured = element ? measureExitMs(element) : undefined
    const timer = setTimeout(finish, exitMs ?? (measured === undefined ? defaultExitMs : measured + exitMarginMs))

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
