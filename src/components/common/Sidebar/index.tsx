import { useRef } from 'react'

import { drawerOverride, drawerWidth, itemMotionVariables } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useOverlayStack } from '@hooks/useOverlayStack.ts'
import { useModalBehavior } from '@hooks/useModalBehavior.ts'
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
  const rootRef = useRef<HTMLDivElement>(null)
  const { labels } = useUIConfig()
  const isTop = useOverlayStack(open)
  const name = ariaLabel ?? labels.mobileNavigation

  useModalBehavior({ rootRef, dialogRef: panelRef, onEscape: () => isTop() && onClose?.() })

  const panelProps = mergeProps(
    {
      ...slot('sidebar', 'panel'),
      className: styles.panel,
      style: { ...motionStyle, ...itemMotionVariables(motionStyle), inlineSize: drawerWidth },
      'data-variant': 'modal',
      'data-state': state,
      role: 'dialog',
      'aria-modal': true,
      'aria-label': name,
      tabIndex: -1
    },
    { className, style }
  )

  return (
    <div ref={rootRef} {...slot('sidebar')} data-variant="modal">
      <div {...slot('sidebar', 'overlay')} className={styles.overlay} style={motionStyle} data-state={state} onClick={onClose} />

      <div ref={panelRef} id={id} {...panelProps}>
        <SidebarContent sections={sections} activeSectionId={activeSectionId} currentHref={currentHref} header={header} footer={footer} collapsed={false} onSelect={onClose} ariaLabel={name} />
      </div>
    </div>
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
