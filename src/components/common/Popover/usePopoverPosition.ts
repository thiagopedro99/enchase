import { useLayoutEffect } from 'react'

import { autoUpdate, computePosition, resolvePlacement } from '../../../positioning/index.ts'
import { arrowPadding } from './defaultData.ts'

import type { PlacementInput } from '../../../positioning/index.ts'
import type { RefObject } from 'react'

type PopoverPositionOptions = {
  triggerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  arrowRef: RefObject<HTMLElement | null>
  mounted: boolean
  placement: PlacementInput
  offset: number
  padding: number
  rtl: boolean
}

const px = (value: number | undefined) => (value === undefined ? '' : `${value}px`)

export const usePopoverPosition = ({ triggerRef, contentRef, arrowRef, mounted, placement, offset, padding, rtl }: PopoverPositionOptions) => {
  useLayoutEffect(() => {
    const trigger = triggerRef.current
    const content = contentRef.current
    if (!mounted || !trigger || !content) return undefined

    const update = () => {
      const arrow = arrowRef.current
      const result = computePosition(trigger, content, {
        placement: resolvePlacement(placement, rtl),
        offset,
        padding,
        arrow: arrow ? { element: arrow, padding: arrowPadding } : undefined,
        apply: ({ availableWidth, availableHeight }) => {
          content.style.setProperty('--enchase-popover-max-width', px(Math.max(0, availableWidth)))
          content.style.setProperty('--enchase-popover-max-height', px(Math.max(0, availableHeight)))
        }
      })
      content.style.left = px(result.x)
      content.style.top = px(result.y)
      content.dataset.placement = result.placement
      content.toggleAttribute('data-reference-hidden', result.referenceHidden)
      if (arrow) {
        arrow.style.left = px(result.arrow?.x)
        arrow.style.top = px(result.arrow?.y)
      }
    }

    return autoUpdate(trigger, content, update)
  }, [mounted, triggerRef, contentRef, arrowRef, placement, offset, padding, rtl])
}
