import { AnimatePresence } from 'motion/react'
import { useRef } from 'react'

import { collapsedWidth, drawerWidth, expandedWidth } from './defaultData.ts'
import { ModalOverlay, ModalPanel, SidebarAside } from './styles.ts'
import { useModalBehavior } from '@hooks/useModalBehavior.ts'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import SidebarContent from './SidebarContent.tsx'

import type { SidebarProps } from './types.ts'

const drawerOverride = { tuning: { distance: drawerWidth } }

const PermanentSidebar = ({ sections, activeId, header, footer, collapsed = false, onToggleCollapsed, ariaLabel, id, animation }: SidebarProps) => {
  const { labels } = useUIConfig()
  const resizeMotion = useMotionRecipe('resize', animation)

  return (
    <SidebarAside {...resizeMotion} id={id} initial={false} animate={{ width: collapsed ? collapsedWidth : expandedWidth }}>
      <SidebarContent
        sections={sections}
        activeId={activeId}
        header={header}
        footer={footer}
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
        ariaLabel={ariaLabel ?? labels.mainNavigation}
      />
    </SidebarAside>
  )
}

const ModalSidebarPanel = ({ sections, activeId, header, footer, onClose, ariaLabel, id, animation }: SidebarProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { labels } = useUIConfig()
  const overlayMotion = useMotionRecipe('fade', animation === false ? false : undefined)
  const panelMotion = useMotionRecipe('slide', animation ?? drawerOverride, 'left')
  const name = ariaLabel ?? labels.mobileNavigation

  useModalBehavior({ rootRef, dialogRef: panelRef, onEscape: onClose })

  return (
    <div ref={rootRef}>
      <ModalOverlay {...overlayMotion} onClick={onClose} />

      <ModalPanel {...panelMotion} ref={panelRef} id={id} role="dialog" aria-modal="true" aria-label={name} tabIndex={-1}>
        <SidebarContent sections={sections} activeId={activeId} header={header} footer={footer} collapsed={false} onSelect={onClose} ariaLabel={name} />
      </ModalPanel>
    </div>
  )
}

export const Sidebar = ({ variant = 'permanent', open = false, ...props }: SidebarProps) => {
  if (variant === 'modal') {
    return <AnimatePresence>{open && <ModalSidebarPanel key="sidebar-drawer" {...props} />}</AnimatePresence>
  }

  return <PermanentSidebar {...props} />
}

export default Sidebar
