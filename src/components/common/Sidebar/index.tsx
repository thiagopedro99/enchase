import { drawerOverride, drawerWidth, itemMotionVariables } from './defaultData.ts'
import { DrawerLayer } from '../Drawer/DrawerLayer.tsx'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useCollapsePhase } from '@hooks/useCollapsePhase.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { usePresence } from '@hooks/usePresence.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import SidebarContent from './SidebarContent.tsx'
import styles from './styles.module.css'

import type { PresenceState } from '@hooks/usePresence.ts'
import type { CSSProperties, RefObject } from 'react'
import type { SidebarProps } from './types.ts'

const PermanentSidebar = ({ sections, activeSectionId, currentHref, header, footer, collapsed = false, onToggleCollapsed, ariaLabel, id, className, style, animation }: SidebarProps) => {
  const { labels } = useUIConfig()
  const motionStyle = useMotionStyle('resize', 'sidebar', animation)
  const { phase, ref, compact } = useCollapsePhase<HTMLDivElement>(collapsed)
  const rootProps = mergeProps(
    {
      ...slot('sidebar'),
      className: styles.aside,
      style: { ...motionStyle, ...itemMotionVariables(motionStyle) },
      'data-variant': 'permanent',
      'data-state': phase
    },
    { className, style }
  )

  return (
    <div ref={ref} id={id} {...rootProps}>
      <SidebarContent
        sections={sections}
        activeSectionId={activeSectionId}
        currentHref={currentHref}
        header={header}
        footer={footer}
        collapsed={collapsed}
        compact={compact}
        onToggleCollapsed={onToggleCollapsed}
        ariaLabel={ariaLabel ?? labels.mainNavigation}
      />
    </div>
  )
}

type ModalPanelProps = SidebarProps & { open: boolean; state: PresenceState; panelRef: RefObject<HTMLDivElement | null>; motionStyle: CSSProperties }

const ModalSidebarPanel = ({ sections, activeSectionId, currentHref, header, footer, onClose, ariaLabel, id, className, style, open, state, panelRef, motionStyle }: ModalPanelProps) => {
  const { labels } = useUIConfig()
  const name = ariaLabel ?? labels.mobileNavigation

  const panelProps = mergeProps(
    {
      id,
      ...slot('sidebar', 'panel'),
      className: styles.panel,
      style: { ...motionStyle, ...itemMotionVariables(motionStyle), inlineSize: drawerWidth },
      'data-variant': 'modal'
    },
    { className, style }
  )

  return (
    <DrawerLayer
      open={open}
      state={state}
      panelRef={panelRef}
      label={name}
      onClose={onClose}
      root={{ ...slot('sidebar'), 'data-variant': 'modal' }}
      overlay={{ ...slot('sidebar', 'overlay'), className: styles.overlay, style: motionStyle }}
      panel={panelProps}
    >
      <SidebarContent sections={sections} activeSectionId={activeSectionId} currentHref={currentHref} header={header} footer={footer} collapsed={false} onSelect={onClose} ariaLabel={name} />
    </DrawerLayer>
  )
}

const ModalSidebar = (props: SidebarProps) => {
  const motionStyle = useMotionStyle('slide', 'sidebar', props.animation ?? drawerOverride, 'left')
  const open = Boolean(props.open)
  const { mounted, state, ref } = usePresence<HTMLDivElement>(open)

  if (!mounted) return null

  return <ModalSidebarPanel {...props} open={open} state={state} panelRef={ref} motionStyle={motionStyle} />
}

export const Sidebar = ({ variant = 'permanent', ...props }: SidebarProps) => {
  if (variant === 'modal') return <ModalSidebar {...props} />

  return <PermanentSidebar {...props} />
}

export default Sidebar
