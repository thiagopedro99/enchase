import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'

import { defaultSections, drawerSlideDistance } from './defaultData.ts'
import { currentOf } from '../common/Sidebar/defaultData.ts'
import { useCurrentHref } from '@hooks/useCurrentHref.ts'
import { Link } from '@components/common/Link/index.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { useModalBehavior } from '@hooks/useModalBehavior.ts'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { Container } from '@components/common/index.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { baseTokens } from '@styles/tokens/base.ts'
import styles from './styles.module.css'

import type { MobileDrawerProps, NavbarLinksProps, NavbarProps } from './types.ts'

const drawerOverride = { tuning: { distance: drawerSlideDistance } }

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

const MobileDrawer = ({ id, items, activeSectionId, onClose }: MobileDrawerProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const { labels } = useUIConfig()
  const overlayMotion = useMotionRecipe('fade')
  const drawerMotion = useMotionRecipe('slide', drawerOverride, 'right')

  useModalBehavior({ rootRef, dialogRef: drawerRef, onEscape: onClose })

  return (
    <div ref={rootRef}>
      <motion.div {...overlayMotion} className={styles.overlay} onClick={onClose} />

      <motion.div {...drawerMotion} ref={drawerRef} id={id} className={styles.mobileMenu} role="dialog" aria-modal="true" aria-label={labels.mobileNavigation} tabIndex={-1}>
        <div className={styles.drawerHeader}>
          <ThemeToggle />
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label={labels.closeMenu}>
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <nav className={styles.mobileNav} aria-label={labels.mobileNavigation}>
          <NavbarLinks items={items} activeSectionId={activeSectionId} linkClassName={styles.mobileMenuLink} onSelect={onClose} />
        </nav>
      </motion.div>
    </div>
  )
}

const Navbar = ({ logo = 'Logo', sections = defaultSections, activeSectionId }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerId = useId()
  const { labels } = useUIConfig()
  const items = sections.flatMap((section) => section.items).filter((item) => item.href)

  const handleClose = () => setMobileOpen(false)

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${baseTokens.breakpoints.md})`)
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false)
    }

    query.addEventListener('change', handleChange)

    return () => query.removeEventListener('change', handleChange)
  }, [])

  return (
    <>
      <header className={styles.header}>
        <Container maxWidth="xl">
          <div className={styles.headerBar}>
            <Link href="/" className={styles.logo}>
              {logo}
            </Link>

            <div className={styles.headerActions}>
              <nav className={styles.desktopMenu} aria-label={labels.mainNavigation}>
                <NavbarLinks items={items} activeSectionId={activeSectionId} linkClassName={styles.menuLink} />
              </nav>

              <ThemeToggle />

              <button
                type="button"
                className={styles.mobileMenuButton}
                onClick={() => setMobileOpen(true)}
                aria-label={labels.openMenu}
                aria-expanded={mobileOpen}
                aria-controls={drawerId}
                aria-haspopup="dialog"
              >
                <Menu size={24} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <AnimatePresence>{mobileOpen && <MobileDrawer key="mobile-drawer" id={drawerId} items={items} activeSectionId={activeSectionId} onClose={handleClose} />}</AnimatePresence>
    </>
  )
}

export default Navbar
