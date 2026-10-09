import { AnimatePresence, motion } from 'motion/react'
import { useRef } from 'react'

import { collapsedWidth, drawerWidth, expandedWidth } from './defaultData.ts'
import { useModalBehavior } from '@hooks/useModalBehavior.ts'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import SidebarContent from './SidebarContent.tsx'
import styles from './styles.module.css'

import type { SidebarProps } from './types.ts'

const drawerOverride = { tuning: { distance: drawerWidth } }

const PermanentSidebar = ({ sections, activeSectionId, currentHref, header, footer, collapsed = false, onToggleCollapsed, ariaLabel, id, animation }: SidebarProps) => {
  const { labels } = useUIConfig()
  const resizeMotion = useMotionRecipe('resize', animation)

  return (
    <motion.div {...resizeMotion} id={id} className={styles.aside} initial={false} animate={{ width: collapsed ? collapsedWidth : expandedWidth }}>
      <SidebarContent
        sections={sections}
        activeSectionId={activeSectionId}
        currentHref={currentHref}
        header={header}
        footer={footer}
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
        ariaLabel={ariaLabel ?? labels.mainNavigation}
      />
    </motion.div>
  )
}

const ModalSidebarPanel = ({ sections, activeSectionId, currentHref, header, footer, onClose, ariaLabel, id, animation }: SidebarProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { labels } = useUIConfig()
  const overlayMotion = useMotionRecipe('fade', animation === false ? false : undefined)
  const panelMotion = useMotionRecipe('slide', animation ?? drawerOverride, 'left')
  const name = ariaLabel ?? labels.mobileNavigation

  useModalBehavior({ rootRef, dialogRef: panelRef, onEscape: onClose })

  return (
    <div ref={rootRef}>
      <motion.div {...overlayMotion} className={styles.overlay} onClick={onClose} />

      <motion.div {...panelMotion} ref={panelRef} id={id} className={styles.panel} style={{ width: drawerWidth }} role="dialog" aria-modal="true" aria-label={name} tabIndex={-1}>
        <SidebarContent sections={sections} activeSectionId={activeSectionId} currentHref={currentHref} header={header} footer={footer} collapsed={false} onSelect={onClose} ariaLabel={name} />
      </motion.div>
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
