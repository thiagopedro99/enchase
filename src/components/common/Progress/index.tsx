import { useMemo } from 'react'

import { defaultMax, defaultShowValue, defaultSize, defaultVariant } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { resolveLocale } from '@utils/resolveLocale.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { resolveLoopMotion } from '@motion/loop.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { ProgressProps } from './types.ts'

export const Progress = ({ value, max = defaultMax, variant = defaultVariant, size = defaultSize, showValue = defaultShowValue, animation, ...props }: ProgressProps) => {
  const { labels, locale, motion: settings } = useUIConfig()
  const percent = useMemo(() => new Intl.NumberFormat(resolveLocale(locale, Intl.NumberFormat), { style: 'percent', maximumFractionDigits: 0 }), [locale])
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
    'data-show-value': showValue ? '' : undefined,
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

      {showValue && current !== undefined && circular && (
        <span className={styles.value} aria-hidden="true" {...slot('progress', 'ring-value')}>
          {percent.format(fraction)}
        </span>
      )}

      {showValue && current !== undefined && !circular && (
        <span className={styles.value} aria-hidden="true" {...slot('progress', 'value')}>
          {percent.format(fraction)}
        </span>
      )}
    </div>
  )
}

export default Progress
