import { forwardRef } from 'react'

import { defaultHeadingLevel, defaultIconPosition, defaultVariant, accordionBase } from './defaultData.ts'
import { ChevronDownIcon } from '../Icon/icons/ChevronDownIcon.tsx'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useAccordion } from './useAccordion.ts'
import styles from './styles.module.css'

import type { AccordionProps } from './types.ts'

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(({ items, multiple, value, defaultValue, onValueChange, headingLevel = defaultHeadingLevel, variant = defaultVariant, iconPosition = defaultIconPosition, animation, ...props }, ref) => {
  const accordion = useAccordion({ items, multiple, value, defaultValue, onValueChange })
  const motionStyle = useMotionStyle('pop', 'accordion', animation, undefined, accordionBase)

  const root = mergeProps(
    {
      ...slot('accordion'),
      className: styles.accordion,
      style: motionStyle,
      'data-variant': variant === defaultVariant ? undefined : variant,
      'data-icon-position': iconPosition === defaultIconPosition ? undefined : iconPosition
    },
    props
  )

  const Heading = `h${headingLevel}` as const

  return (
    <div {...root} ref={ref}>
      {items.map((item) => (
        <div key={item.value} className={styles.item} data-open={accordion.expanded.includes(item.value) ? '' : undefined} {...slot('accordion', 'item')}>
          <Heading className={styles.heading} {...slot('accordion', 'heading')}>
            <button {...accordion.getTriggerProps(item.value, { className: styles.trigger, ...slot('accordion', 'trigger') })}>
              <span className={styles.title} {...slot('accordion', 'title')}>
                {item.title}
              </span>

              <span className={styles.icon} aria-hidden="true" {...slot('accordion', 'icon')}>
                <ChevronDownIcon size={20} />
              </span>
            </button>
          </Heading>

          <div {...accordion.getPanelProps(item.value, { className: styles.panel, ...slot('accordion', 'panel') })}>{item.content}</div>
        </div>
      ))}
    </div>
  )
})

Accordion.displayName = 'Accordion'

export default Accordion
