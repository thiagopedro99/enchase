import { useLocation } from 'react-router-dom'
import { useTheme } from 'styled-components'
import { useEffect, useId } from 'react'

import { defaultBrand, defaultBrandLogo, defaultCentered, defaultNavigationSections } from './defaultData.ts'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import AppSidebar from './subcomponentes/AppSidebar/index.tsx'
import { useMediaQuery } from '@hooks/useMediaQuery.ts'
import { Container } from '@components/common/index.ts'
import AppBar from './subcomponentes/AppBar/index.tsx'
import { deriveBreadcrumbs } from './breadcrumbs.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { useAppStore } from '@stores/app/index.ts'
import Navbar from '@components/navbar/index.tsx'
import Footer from '@components/footer/index.tsx'
import styles from './styles.module.css'

import type { LayoutProps } from './types.ts'

const mainId = 'main-content'

const Layout = ({
  children,
  pageTitle = 'Meu App',
  maxWidth = 'lg',
  padding = true,
  hideNavbar = false,
  hideFooter = false,
  centered = defaultCentered,
  navigation = 'sidebar',
  brand = defaultBrand,
  brandLogo = defaultBrandLogo,
  sidebarFooter,
  navigationSections = defaultNavigationSections,
  pageSections = [],
  activePageSectionId,
  breadcrumbs
}: LayoutProps) => {
  const { labels } = useUIConfig()
  const theme = useTheme()
  const navId = useId()
  const { pathname } = useLocation()
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.md})`)
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  const toggleCollapsed = useAppStore((state) => state.toggleSidebarCollapsed)
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const usesSidebar = navigation === 'sidebar' && !hideNavbar
  const sections = [...navigationSections, ...pageSections]
  const trail = breadcrumbs ?? deriveBreadcrumbs({ sections: navigationSections, pageSections, pathname, pageTitle, activePageSectionId })

  useEffect(() => {
    document.title = `${pageTitle} · ${brand}`
  }, [pageTitle, brand])

  useEffect(() => {
    if (isDesktop && sidebarOpen) setSidebarOpen(false)
  }, [isDesktop, sidebarOpen, setSidebarOpen])

  return (
    <div className={styles.wrapper} data-sidebar={usesSidebar && isDesktop ? '' : undefined}>
      <a href={`#${mainId}`} className={styles.skipLink}>
        {labels.skipToContent}
      </a>

      {usesSidebar && (
        <AppBar
          items={trail}
          menuLabel={isDesktop ? (collapsed ? labels.expandSidebar : labels.collapseSidebar) : labels.openMenu}
          menuExpanded={isDesktop ? !collapsed : sidebarOpen}
          menuControls={navId}
          menuHasPopup={!isDesktop}
          onMenuToggle={isDesktop ? toggleCollapsed : () => setSidebarOpen(true)}
          actions={<ThemeToggle />}
        />
      )}

      {navigation === 'navbar' && !hideNavbar && (
        <div className={styles.navbarArea}>
          <Navbar logo={brand} />
        </div>
      )}

      {usesSidebar && isDesktop && (
        <div className={styles.sidebarArea}>
          <AppSidebar brand={brand} brandLogo={brandLogo} footer={sidebarFooter} sections={sections} variant="permanent" activeId={activePageSectionId} navId={navId} />
        </div>
      )}

      <main id={mainId} tabIndex={-1} className={styles.main} data-centered={centered ? '' : undefined}>
        <Container maxWidth={maxWidth} padding={padding}>
          {children}
        </Container>
      </main>

      {!hideFooter && (
        <div className={styles.footerArea}>
          <Footer />
        </div>
      )}

      {usesSidebar && !isDesktop && <AppSidebar brand={brand} brandLogo={brandLogo} footer={sidebarFooter} sections={sections} variant="modal" activeId={activePageSectionId} navId={navId} />}
    </div>
  )
}

export default Layout
