import { useEffect, useId, useRef, useState } from 'react'
import { CloseIcon } from '@components/common/Icon/icons/CloseIcon.tsx'
import { MenuIcon } from '@components/common/Icon/icons/MenuIcon.tsx'

import { defaultSections, drawerOverride } from './defaultData.ts'
import { currentOf } from '../common/Sidebar/defaultData.ts'
import { useCurrentHref } from '@hooks/useCurrentHref.ts'
import { Link } from '@components/common/Link/index.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { useModalBehavior } from '@hooks/useModalBehavior.ts'
import { useOverlayStack } from '@hooks/useOverlayStack.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { useMediaQuery } from '@hooks/useMediaQuery.ts'
import { useIsClient } from '@hooks/useIsClient.ts'
import { usePresence } from '@hooks/usePresence.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { Container } from '@components/common/index.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { MobileDrawerProps, NavbarLinksProps, NavbarProps } from './types.ts'

const NavbarLinks = ({ items, activeSectionId, linkClassName, onSelect }: NavbarLinksProps) => {
  const currentHref = useCurrentHref()

  return items.map((item) => (
    <Link
      key={item.id}
      href={item.href as string}
      native={item.native}
      aria-current={currentOf(item, activeSectionId, currentHref)}
      className={linkClassName}
      onClick={() => {
        item.onClick?.()
        onSelect?.()
      }}
    >
      {item.label}
    </Link>
  ))
}

const MobileDrawer = ({ layout, id, items, activeSectionId, open, state, drawerRef, motionStyle, onClose }: MobileDrawerProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const { labels } = useUIConfig()
  const isTop = useOverlayStack(open)

  useModalBehavior({ rootRef, dialogRef: drawerRef, onEscape: () => isTop() && onClose() })

  return (
    <div ref={rootRef} {...slot('navbar', 'drawer-root')} className={styles.drawerRoot} data-layout={layout}>
      <div {...slot('navbar', 'overlay')} className={styles.overlay} style={motionStyle} data-state={state} onClick={onClose} />

      <div
        ref={drawerRef}
        {...slot('navbar', 'drawer')}
        id={id}
        className={styles.mobileMenu}
        style={motionStyle}
        data-state={state}
        role="dialog"
        aria-modal="true"
        aria-label={labels.mobileNavigation}
        tabIndex={-1}
      >
        <div {...slot('navbar', 'drawer-header')} className={styles.drawerHeader}>
          <ThemeToggle />
          <button {...slot('navbar', 'drawer-close')} type="button" className={styles.closeButton} onClick={onClose} aria-label={labels.closeMenu}>
            <CloseIcon />
          </button>
        </div>

        <nav {...slot('navbar', 'drawer-nav')} className={styles.mobileNav} aria-label={labels.mobileNavigation}>
          <NavbarLinks items={items} activeSectionId={activeSectionId} linkClassName={styles.mobileMenuLink} onSelect={onClose} />
        </nav>
      </div>
    </div>
  )
}

const Navbar = ({ logo = 'Logo', breakpoint = 'md', sections = defaultSections, activeSectionId, className, style }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerId = useId()
  const { labels, breakpoints } = useUIConfig()
  const wide = useMediaQuery(`(min-width: ${breakpoints[breakpoint]})`, true)
  const isClient = useIsClient()
  const motionStyle = useMotionStyle('slide', 'navbar', drawerOverride, 'right')
  const { mounted, state, ref } = usePresence<HTMLDivElement>(mobileOpen)
  const items = sections.flatMap((section) => section.items).filter((item) => item.href)

  const handleClose = () => setMobileOpen(false)

  const wasWide = useRef(wide)

  useEffect(() => {
    if (wide && !wasWide.current) setMobileOpen(false)
    wasWide.current = wide
  }, [wide])

  const headerProps = mergeProps({ ...slot('navbar'), className: styles.header, 'data-layout': isClient ? (wide ? 'wide' : 'compact') : 'auto', 'data-breakpoint': breakpoint }, { className, style })

  return (
    <>
      <header {...headerProps}>
        <Container maxWidth="xl">
          <div {...slot('navbar', 'bar')} className={styles.headerBar}>
            <Link href="/" className={styles.logo}>
              {logo}
            </Link>

            <div {...slot('navbar', 'actions')} className={styles.headerActions}>
              <nav {...slot('navbar', 'menu')} className={styles.desktopMenu} aria-label={labels.mainNavigation}>
                <NavbarLinks items={items} activeSectionId={activeSectionId} linkClassName={styles.menuLink} />
              </nav>

              <ThemeToggle />

              <button
                {...slot('navbar', 'menu-button')}
                type="button"
                className={styles.mobileMenuButton}
                onClick={() => setMobileOpen(true)}
                aria-label={labels.openMenu}
                aria-expanded={mobileOpen}
                aria-controls={drawerId}
                aria-haspopup="dialog"
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {mounted && <MobileDrawer layout={wide ? 'wide' : 'compact'} id={drawerId} items={items} activeSectionId={activeSectionId} open={mobileOpen} state={state} drawerRef={ref} motionStyle={motionStyle} onClose={handleClose} />}
    </>
  )
}

export default Navbar
