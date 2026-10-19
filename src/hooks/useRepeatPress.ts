import { useCallback, useEffect, useRef } from 'react'

import type { MouseEvent, PointerEvent } from 'react'

const defaultDelay = 400

const defaultInterval = 60

export const useRepeatPress = (action: () => void, enabled = true, delay = defaultDelay, interval = defaultInterval) => {
  const actionRef = useRef(action)
  const timers = useRef<{ wait?: ReturnType<typeof setTimeout>; repeat?: ReturnType<typeof setInterval> }>({})

  actionRef.current = action

  const stop = useCallback(() => {
    clearTimeout(timers.current.wait)
    clearInterval(timers.current.repeat)
    timers.current = {}
  }, [])

  const start = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return

      stop()
      actionRef.current()
      timers.current.wait = setTimeout(() => {
        timers.current.repeat = setInterval(() => actionRef.current(), interval)
      }, delay)
    },
    [delay, interval, stop]
  )

  useEffect(() => {
    if (!enabled) stop()
  }, [enabled, stop])

  useEffect(() => stop, [stop])

  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onBlur: stop,
    onMouseDown: (event: MouseEvent) => event.preventDefault(),
    onClick: (event: MouseEvent) => {
      if (event.detail === 0) actionRef.current()
    }
  }
}
