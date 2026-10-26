import { defaultMax, defaultSize, defaultVariant } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { resolveLoopMotion } from '@motion/loop.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { ProgressProps } from './types.ts'

export const Progress = ({ value, max = defaultMax, variant = defaultVariant, size = defaultSize, animation, ...props }: ProgressProps) => {
  const { labels, motion: settings } = useUIConfig()
  const circular = variant === 'circular'
  const end = Number.isFinite(max) && max > 0 ? max : defaultMax
  const current = value !== undefined && Number.isFinite(value) ? Math.min(Math.max(value, 0), end) : undefined
  const fraction = current === undefined ? 0 : current / end
  const { motion, style } = resolveLoopMotion(circular ? 'spin' : 'shimmer', settings, animation, circular ? '--enchase-progress-ring-duration' : '--enchase-progress-indicator-duration')
  const own = {
    ...slot('progress'),
    className: styles.progress,
    role: 'progressbar',
    'aria-label': labels.loading,
    'aria-valuemin': 0,
    'aria-valuemax': end,
    'aria-valuenow': current,
    'data-variant': variant,
    'data-size': size,
    'data-state': current === undefined ? 'indeterminate' : current >= end ? 'complete' : 'loading',
    'data-motion': motion,
    style: { ...style, '--progress': fraction } as CSSProperties
  }

  return (
    <div {...mergeProps(own, props)}>
      {circular ? (
        <svg className={styles.svg} {...slot('progress', 'ring')} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <circle className={styles.ring} {...slot('progress', 'track')} cx="24" cy="24" r="20" />
          <circle className={styles.arc} {...slot('progress', 'indicator')} cx="24" cy="24" r="20" pathLength={100} style={current === undefined ? undefined : { strokeDasharray: `${fraction * 100} 100` }} />
        </svg>
      ) : (
        <div className={styles.track} {...slot('progress', 'track')}>
          <div className={styles.bar} {...slot('progress', 'indicator')} />
        </div>
      )}
    </div>
  )
}

export default Progress
