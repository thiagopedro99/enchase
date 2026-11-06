import { useMemo, useRef } from 'react'

import { useModalBehavior } from '@hooks/useModalBehavior.ts'
import { useOverlayStack } from '@hooks/useOverlayStack.ts'
import { mergeRefs } from '@utils/mergeRefs.ts'

import type { DrawerLayerProps } from './types.ts'

export const DrawerLayer = ({ open, state, panelRef, userRef, label, labelledBy, onClose, closeOnOverlayClick = true, closeOnEsc = true, root, overlay, panel, children }: DrawerLayerProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const isTop = useOverlayStack(open)
  const mergedPanelRef = useMemo(() => mergeRefs(panelRef, userRef), [panelRef, userRef])

  useModalBehavior({ rootRef, dialogRef: panelRef, onEscape: closeOnEsc ? () => isTop() && onClose?.() : undefined })

  return (
    <div ref={rootRef} {...root}>
      <div {...overlay} data-state={state} onClick={closeOnOverlayClick ? () => isTop.wasTopAtPointerDown() && onClose?.() : undefined} />

      <div ref={mergedPanelRef} {...panel} data-state={state} role="dialog" aria-modal="true" aria-label={label} aria-labelledby={labelledBy} tabIndex={-1}>
        {children}
      </div>
    </div>
  )
}
