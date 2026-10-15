import { useEffect } from 'react'

let lockCount = 0
let previousOverflow = ''
let previousOverscroll = ''

export const useScrollLock = (active = true) => {
  useEffect(() => {
    if (!active) return

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow
      previousOverscroll = document.body.style.overscrollBehavior
      document.body.style.overflow = 'hidden'
      document.body.style.overscrollBehavior = 'none'
    }
    lockCount += 1

    return () => {
      lockCount -= 1
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow
        document.body.style.overscrollBehavior = previousOverscroll
      }
    }
  }, [active])
}
