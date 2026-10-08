import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { useRef } from 'react'

import { useInertSiblings } from '@hooks/useInertSiblings.ts'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { useScrollLock } from '@hooks/useScrollLock.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { InlineLoadingProps, LoadingProps } from './types.ts'

const spinnerColorStyle = (color?: string): CSSProperties | undefined => (color ? ({ '--spinner-color': color } as CSSProperties) : undefined)

const OverlayLoading = ({ size, text, color, animation }: Required<Pick<LoadingProps, 'size'>> & Omit<LoadingProps, 'size' | 'overlay'>) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const { labels } = useUIConfig()
  const spinMotion = useMotionRecipe('spin', animation)

  useInertSiblings(rootRef)
  useScrollLock()

  return (
    <div ref={rootRef}>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.container} data-overlay="" role="status" aria-live="polite">
        <motion.div {...spinMotion} className={styles.spinner} data-size={size} style={spinnerColorStyle(color)} aria-hidden="true" />
        {text ? <p className={styles.text}>{text}</p> : <VisuallyHidden>{labels.loading}</VisuallyHidden>}
      </div>
    </div>
  )
}

export const Loading = ({ size = 'md', overlay = false, text, color, animation }: LoadingProps) => {
  const { labels } = useUIConfig()
  const spinMotion = useMotionRecipe('spin', animation)

  if (overlay) {
    if (typeof document === 'undefined') return null

    return createPortal(<OverlayLoading size={size} text={text} color={color} animation={animation} />, document.body)
  }

  return (
    <div className={styles.container} role="status" aria-live="polite">
      <motion.div {...spinMotion} className={styles.spinner} data-size={size} style={spinnerColorStyle(color)} aria-hidden="true" />
      {text ? <p className={styles.text}>{text}</p> : <VisuallyHidden>{labels.loading}</VisuallyHidden>}
    </div>
  )
}

export const InlineLoading = ({ size = 'sm', color, label, animation }: InlineLoadingProps) => {
  const { labels } = useUIConfig()
  const spinMotion = useMotionRecipe('spin', animation)

  return (
    <span role="status">
      <motion.div {...spinMotion} className={classNames(styles.spinner, styles.inlineSpinner)} data-size={size} style={spinnerColorStyle(color)} aria-hidden="true" />
      <VisuallyHidden>{label ?? labels.loading}</VisuallyHidden>
    </span>
  )
}

export default Loading
