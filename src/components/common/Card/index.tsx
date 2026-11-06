import { defaultTag, roleOf } from '@utils/structureTag.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { defaultVariant } from './defaultData.ts'
import { cardPaddingStyle, useCardSurface } from './surface.ts'
import styles from './styles.module.css'

import type { HTMLAttributes, ReactNode } from 'react'
import type { CardProps } from './types.ts'

const filled = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== ''

export const Card = ({ as: Tag = defaultTag, children, animation, variant = defaultVariant, padding, header, headerExtra, ...props }: CardProps) => {
  const withHeader = filled(header) || filled(headerExtra)
  const surface = useCardSurface({ variant, padding: withHeader ? undefined : padding, animation })
  const own = { ...slot('card'), ...surface, className: styles.card, role: roleOf(Tag), 'data-with-header': withHeader ? '' : undefined }

  if (!withHeader) return <Tag {...(mergeProps(own, props) as HTMLAttributes<HTMLElement>)}>{children}</Tag>

  return (
    <Tag {...(mergeProps(own, props) as HTMLAttributes<HTMLElement>)}>
      <div className={styles.header} {...slot('card', 'header')}>
        <div className={styles.title} {...slot('card', 'title')}>
          {header}
        </div>

        {filled(headerExtra) && (
          <div className={styles.extra} {...slot('card', 'extra')}>
            {headerExtra}
          </div>
        )}
      </div>

      <div className={styles.body} style={cardPaddingStyle(padding)} {...slot('card', 'body')}>
        {children}
      </div>
    </Tag>
  )
}

export default Card
