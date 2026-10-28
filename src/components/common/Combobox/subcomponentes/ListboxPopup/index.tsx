import { createPortal } from 'react-dom'

import { PopoverTreeContext, usePopoverTree } from '../../../Popover/popoverTree.ts'
import { useListboxPosition } from './useListboxPosition.ts'
import { useListboxDismiss } from './useListboxDismiss.ts'
import { usePortalContainer } from '@hooks/usePortalContainer.ts'
import { useOverlayStack } from '@hooks/useOverlayStack.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { usePresence } from '@hooks/usePresence.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { listboxBase } from '../../defaultData.ts'
import styles from './styles.module.css'

import type { MouseEvent } from 'react'
import type { ListboxPopupProps } from './types.ts'

export const ListboxPopup = ({ open, anchorRef, id, labelledBy, label, multiple, busy, container, animation, className, style, onClose, children }: ListboxPopupProps) => {
  const { dir } = useUIConfig()
  const target = usePortalContainer(container)
  const { mounted, state, ref } = usePresence<HTMLDivElement>(open)
  const isTop = useOverlayStack(open)
  const { contains, tree } = usePopoverTree(ref, mounted)
  const motionStyle = useMotionStyle('pop', 'combobox', animation, undefined, listboxBase)

  useListboxPosition({ anchorRef, contentRef: ref, mounted: mounted && target !== null, rtl: dir === 'rtl' })
  useListboxDismiss({ open, anchorRef, isTop, contains, onClose })

  const listbox = mergeProps(
    {
      ref,
      id,
      role: 'listbox',
      dir,
      'aria-labelledby': labelledBy,
      'aria-label': labelledBy ? undefined : label,
      'aria-multiselectable': multiple || undefined,
      'aria-busy': busy || undefined,
      'data-state': state,
      ...slot('combobox', 'listbox'),
      className: styles.listbox,
      style: motionStyle,
      onMouseDown: (event: MouseEvent) => event.preventDefault()
    },
    { className, style }
  )

  if (!target) return null

  return createPortal(
    mounted ? (
      <PopoverTreeContext.Provider value={tree}>
        <div {...listbox}>{children}</div>
      </PopoverTreeContext.Provider>
    ) : null,
    target
  )
}

export default ListboxPopup
