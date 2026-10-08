import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

import { defaultMenuItems, drawerSlideDistance } from './defaultData.ts'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { useModalBehavior } from '@hooks/useModalBehavior.ts'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { Container } from '@components/common/index.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { classNames } from '@utils/classNames.ts'
import { baseTokens } from '@styles/tokens/base.ts'
import styles from './styles.module.css'

import type { MobileDrawerProps, NavbarProps } from './types.ts'

const navLinkClassName = (base: string) => ({ isActive }: { isActive: boolean }) => classNames(base, isActive && styles.active)

const drawerOverride = { tuning: { distance: drawerSlideDistance } }

const MobileDrawer = ({ id, menuItems, onClose }: MobileDrawerProps) => {
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
          {menuItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={navLinkClassName(styles.mobileMenuLink)} onClick={onClose}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </motion.div>
    </div>
  )
}

const Navbar = ({ logo = 'Logo', menuItems = defaultMenuItems }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerId = useId()
  const { labels } = useUIConfig()

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
            <Link to="/" className={styles.logo}>
              {logo}
            </Link>

            <div className={styles.headerActions}>
              <nav className={styles.desktopMenu} aria-label={labels.mainNavigation}>
                {menuItems.map((item) => (
                  <NavLink key={item.path} to={item.path} className={navLinkClassName(styles.menuLink)}>
                    {item.label}
                  </NavLink>
                ))}
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

      <AnimatePresence>{mobileOpen && <MobileDrawer key="mobile-drawer" id={drawerId} menuItems={menuItems} onClose={handleClose} />}</AnimatePresence>
    </>
  )
}

export default Navbar
