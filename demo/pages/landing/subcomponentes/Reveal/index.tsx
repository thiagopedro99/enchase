import { useLayoutEffect, useRef } from 'react'

import { prefersReducedMotion } from '../../reveal.ts'
import styles from './styles.module.css'

import type { RevealProps } from './types.ts'

const Reveal = ({ children, className }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = ref.current

    if (!element || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) return undefined
    if (element.getBoundingClientRect().top < window.innerHeight) return undefined

    element.dataset.reveal = 'pending'

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return

        element.dataset.reveal = 'shown'
        observer.disconnect()
      },
      { rootMargin: '0px 0px -12% 0px' }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={[styles.reveal, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export default Reveal
