import { mergeProps, slot } from '@utils/mergeProps.ts'
import { defaultSize } from './defaultData.ts'
import styles from './styles.module.css'

import type { BaseIconProps } from './types.ts'

export const Icon = ({ name, size = defaultSize, directional = false, title, children, ...props }: BaseIconProps) => {
  const own = {
    ...slot('icon'),
    className: styles.icon,
    'data-icon': name,
    'data-directional': directional ? '' : undefined,
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    role: title ? 'img' : undefined,
    'aria-hidden': title ? undefined : 'true',
    focusable: 'false'
  }

  const merged = mergeProps(own, props)
  const slotOverride = props['data-slot' as keyof typeof props]

  return (
    <svg {...merged} {...(slotOverride ? { 'data-slot': slotOverride } : {})}>
      {title && <title>{title}</title>}
      {children}
    </svg>
  )
}

export default Icon
