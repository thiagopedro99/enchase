import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'

import { usePortalContainer } from '@hooks/usePortalContainer.ts'
import { useInertSiblings } from '@hooks/useInertSiblings.ts'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useScrollLock } from '@hooks/useScrollLock.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { usePresence } from '@hooks/usePresence.ts'
import { resolveLoopMotion } from '@motion/loop.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { InlineLoadingProps, LoadingProps, SpinnerProps } from './types.ts'

const Spinner = ({ part, size, color, animation }: SpinnerProps) => {
  const { motion: settings } = useUIConfig()
  const { motion, style } = resolveLoopMotion('spin', settings, animation)
  const merged = { ...style, ...(color ? { '--spinner-color': color } : undefined) } as CSSProperties

  return <span {...slot(part, 'spinner')} className={styles.spinner} data-size={size} data-motion={motion} style={merged} aria-hidden="true" />
}

const OverlayLoading = ({ size, text, color, animation, ...props }: Required<Pick<LoadingProps, 'size'>> & Omit<LoadingProps, 'size' | 'overlay' | 'container'>) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const { labels } = useUIConfig()
  const [shown, setShown] = useState(false)
  const { state } = usePresence(shown)

  useEffect(() => setShown(true), [])
  useInertSiblings(rootRef)
  useScrollLock()

  const own = { ...slot('loading'), className: styles.root, 'data-state': state }

  return (
    <div ref={rootRef} {...mergeProps(own, props)}>
      <div {...slot('loading', 'backdrop')} className={styles.overlay} aria-hidden="true" />
      <div {...slot('loading', 'content')} className={styles.container} data-overlay="" role="status" aria-live="polite">
        <Spinner part="loading" size={size} color={color} animation={animation} />
        {text ? <p {...slot('loading', 'text')} className={styles.text}>{text}</p> : <VisuallyHidden>{labels.loading}</VisuallyHidden>}
      </div>
    </div>
  )
}

export const Loading = ({ size = 'md', overlay = false, container, text, color, animation, ...props }: LoadingProps) => {
  const { labels } = useUIConfig()
  const target = usePortalContainer(container)

  if (overlay) {
    if (!target) return null

    return createPortal(<OverlayLoading size={size} text={text} color={color} animation={animation} {...props} />, target)
  }

  const own = { ...slot('loading'), className: styles.container, role: 'status', 'aria-live': 'polite' as const }

  return (
    <div {...mergeProps(own, props)}>
      <Spinner part="loading" size={size} color={color} animation={animation} />
      {text ? <p {...slot('loading', 'text')} className={styles.text}>{text}</p> : <VisuallyHidden>{labels.loading}</VisuallyHidden>}
    </div>
  )
}

export const InlineLoading = ({ size = 'sm', color, label, animation, ...props }: InlineLoadingProps) => {
  const { labels } = useUIConfig()
  const own = { ...slot('inline-loading'), className: styles.inline, role: 'status' }

  return (
    <span {...mergeProps(own, props)}>
      <Spinner part="inline-loading" size={size} color={color} animation={animation} />
      <VisuallyHidden>{label ?? labels.loading}</VisuallyHidden>
    </span>
  )
}

export default Loading
