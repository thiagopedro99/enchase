import { useRef } from 'react'

import { useModalBehavior } from '@hooks/useModalBehavior.ts'
import { useOverlayStack } from '@hooks/useOverlayStack.ts'

import type { DrawerLayerProps } from './types.ts'

export const DrawerLayer = ({ open, state, panelRef, label, onClose, root, overlay, panel, children }: DrawerLayerProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const isTop = useOverlayStack(open)

  useModalBehavior({ rootRef, dialogRef: panelRef, onEscape: () => isTop() && onClose?.() })

  return (
    <div ref={rootRef} {...root}>
      <div {...overlay} data-state={state} onClick={() => isTop.wasTopAtPointerDown() && onClose?.()} />

      <div ref={panelRef} {...panel} data-state={state} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        {children}
      </div>
    </div>
  )
}
