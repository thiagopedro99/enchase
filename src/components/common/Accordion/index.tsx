import { forwardRef, useId, useRef } from 'react'

import { defaultHeadingLevel, defaultMultiple, accordionBase } from './defaultData.ts'
import { ChevronDownIcon } from '../Icon/icons/ChevronDownIcon.tsx'
import { useControllableState } from '@hooks/useControllableState.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { KeyboardEvent } from 'react'
import type { AccordionProps } from './types.ts'

const targetPosition = (key: string, position: number, count: number) => {
  if (key === 'ArrowDown') return position + 1
  if (key === 'ArrowUp') return position - 1
  if (key === 'Home') return 0
  if (key === 'End') return count - 1

  return undefined
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ items, multiple = defaultMultiple, value, defaultValue, onValueChange, headingLevel = defaultHeadingLevel, animation, ...props }, ref) => {
    const baseId = useId()
    const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
    const [openValues, setOpenValues] = useControllableState<string[]>(value, defaultValue ?? [], onValueChange)
    const expanded = multiple ? openValues : openValues.slice(0, 1)
    const motionStyle = useMotionStyle('pop', 'accordion', animation, undefined, accordionBase)
    const root = mergeProps({ ...slot('accordion'), className: styles.accordion, style: motionStyle }, props)
    const Heading = `h${headingLevel}` as const

    const toggle = (itemValue: string) => {
      const isOpen = expanded.includes(itemValue)

      if (multiple) setOpenValues(isOpen ? expanded.filter((entry) => entry !== itemValue) : [...expanded, itemValue])
      else setOpenValues(isOpen ? [] : [itemValue])
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

      const enabled = items.flatMap((item, position) => (item.disabled ? [] : [position]))
      const target = targetPosition(event.key, enabled.indexOf(index), enabled.length)

      if (target === undefined) return

      event.preventDefault()
      triggerRefs.current[enabled[(target + enabled.length) % enabled.length]]?.focus()
    }

    return (
      <div {...root} ref={ref}>
        {items.map((item, index) => {
          const isOpen = expanded.includes(item.value)
          const triggerId = `${baseId}-trigger-${index}`
          const panelId = `${baseId}-panel-${index}`

          return (
            <div key={item.value} className={styles.item} data-open={isOpen ? '' : undefined} {...slot('accordion', 'item')}>
              <Heading className={styles.heading} {...slot('accordion', 'heading')}>
                <button
                  ref={(node) => {
                    triggerRefs.current[index] = node
                  }}
                  type="button"
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  disabled={item.disabled}
                  className={styles.trigger}
                  onClick={() => toggle(item.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  {...slot('accordion', 'trigger')}
                >
                  <span className={styles.title} {...slot('accordion', 'title')}>
                    {item.title}
                  </span>

                  <span className={styles.icon} aria-hidden="true" {...slot('accordion', 'icon')}>
                    <ChevronDownIcon size={20} />
                  </span>
                </button>
              </Heading>

              <div role="region" id={panelId} aria-labelledby={triggerId} hidden={!isOpen} className={styles.panel} {...slot('accordion', 'panel')}>
                {item.content}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
)

Accordion.displayName = 'Accordion'

export default Accordion
