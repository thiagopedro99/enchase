import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useTheme } from 'styled-components'
import { Menu, X } from 'lucide-react'

import { Header, HeaderBar, Logo, DesktopMenu, MenuLink, MobileMenuButton, MobileMenu, MobileMenuLink, MobileNav, Overlay, CloseButton, DrawerHeader, HeaderActions } from './styles.ts'
import { defaultMenuItems, drawerSlideDistance } from './defaultData.ts'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { useModalBehavior } from '@hooks/useModalBehavior.ts'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { Container } from '@components/common/index.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'

import type { MobileDrawerProps, NavbarProps } from './types.ts'

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
      <Overlay {...overlayMotion} onClick={onClose} />

      <MobileMenu {...drawerMotion} ref={drawerRef} id={id} role="dialog" aria-modal="true" aria-label={labels.mobileNavigation} tabIndex={-1}>
        <DrawerHeader>
          <ThemeToggle />
          <CloseButton type="button" onClick={onClose} aria-label={labels.closeMenu}>
            <X size={24} aria-hidden="true" />
          </CloseButton>
        </DrawerHeader>

        <MobileNav aria-label={labels.mobileNavigation}>
          {menuItems.map((item) => (
            <MobileMenuLink key={item.path} to={item.path} onClick={onClose}>
              {item.label}
            </MobileMenuLink>
          ))}
        </MobileNav>
      </MobileMenu>
    </div>
  )
}

const Navbar = ({ logo = 'Logo', menuItems = defaultMenuItems }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerId = useId()
  const theme = useTheme()
  const { labels } = useUIConfig()

  const handleClose = () => setMobileOpen(false)

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${theme.breakpoints.md})`)
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false)
    }

    query.addEventListener('change', handleChange)

    return () => query.removeEventListener('change', handleChange)
  }, [theme.breakpoints.md])

  return (
    <>
      <Header>
        <Container $maxWidth="xl">
          <HeaderBar>
            <Logo to="/">{logo}</Logo>

            <HeaderActions>
              <DesktopMenu aria-label={labels.mainNavigation}>
                {menuItems.map((item) => (
                  <MenuLink key={item.path} to={item.path}>
                    {item.label}
                  </MenuLink>
                ))}
              </DesktopMenu>

              <ThemeToggle />

              <MobileMenuButton
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label={labels.openMenu}
                aria-expanded={mobileOpen}
                aria-controls={drawerId}
                aria-haspopup="dialog"
              >
                <Menu size={24} aria-hidden="true" />
              </MobileMenuButton>
            </HeaderActions>
          </HeaderBar>
        </Container>
      </Header>

      <AnimatePresence>{mobileOpen && <MobileDrawer key="mobile-drawer" id={drawerId} menuItems={menuItems} onClose={handleClose} />}</AnimatePresence>
    </>
  )
}

export default Navbar
