import { useEffect } from 'react'

import { shared } from '../utils/shared.ts'

const lock = shared('scrollLock.v1', () => ({ count: 0, overflow: '', overscroll: '' }))

export const useScrollLock = (active = true) => {
  useEffect(() => {
    if (!active) return

    if (lock.count === 0) {
      lock.overflow = document.body.style.overflow
      lock.overscroll = document.body.style.overscrollBehavior
      document.body.style.overflow = 'hidden'
      document.body.style.overscrollBehavior = 'none'
    }
    lock.count += 1

    return () => {
      lock.count -= 1
      if (lock.count === 0) {
        document.body.style.overflow = lock.overflow
        document.body.style.overscrollBehavior = lock.overscroll
      }
    }
  }, [active])
}
