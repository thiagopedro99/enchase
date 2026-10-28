import { useLayoutEffect } from 'react'

import { autoUpdate, computePosition, resolvePlacement } from '../../../../../positioning/index.ts'
import { listboxOffset, listboxPadding, listboxPlacement } from '../../defaultData.ts'

import type { RefObject } from 'react'

type ListboxPositionOptions = {
  anchorRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  mounted: boolean
  rtl: boolean
}

const px = (value: number | undefined) => (value === undefined ? '' : `${value}px`)

export const useListboxPosition = ({ anchorRef, contentRef, mounted, rtl }: ListboxPositionOptions) => {
  useLayoutEffect(() => {
    const anchor = anchorRef.current
    const content = contentRef.current

    if (!mounted || !anchor || !content) return undefined

    const update = () => {
      const result = computePosition(anchor, content, {
        placement: resolvePlacement(listboxPlacement, rtl),
        offset: listboxOffset,
        padding: listboxPadding,
        apply: ({ availableWidth, availableHeight }) => {
          content.style.setProperty('--combobox-max-width', px(Math.max(0, availableWidth)))
          content.style.setProperty('--combobox-max-height', px(Math.max(0, availableHeight)))
        }
      })

      content.style.left = px(result.x)
      content.style.top = px(result.y)
      content.style.setProperty('--combobox-anchor-width', px(anchor.getBoundingClientRect().width))
      content.dataset.placement = result.placement
      content.toggleAttribute('data-reference-hidden', result.referenceHidden)
    }

    return autoUpdate(anchor, content, update)
  }, [mounted, anchorRef, contentRef, rtl])
}
