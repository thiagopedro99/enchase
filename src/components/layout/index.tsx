import { useEffect, useId } from 'react'

import { defaultBrand, defaultBrandLogo, defaultCentered, defaultNavigationSections } from './defaultData.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import AppSidebar from './subcomponentes/AppSidebar/index.tsx'
import { useCurrentHref } from '@hooks/useCurrentHref.ts'
import { useStoredCollapsed } from '@hooks/useStoredCollapsed.ts'
import { useMediaQuery } from '@hooks/useMediaQuery.ts'
import { Container } from '@components/common/index.ts'
import AppBar from './subcomponentes/AppBar/index.tsx'
import { deriveBreadcrumbs } from './breadcrumbs.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { useControllableState } from '@hooks/useControllableState.ts'
import { baseTokens } from '@styles/tokens/base.ts'
import Navbar from '@components/navbar/index.tsx'
import Footer from '@components/footer/index.tsx'
import styles from './styles.module.css'

import type { LayoutProps } from './types.ts'

const mainId = 'main-content'

const Layout = ({
  children,
  pageTitle,
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
  breadcrumbs,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  storageKey,
  open: openProp,
  defaultOpen = false,
  onOpenChange
}: LayoutProps) => {
  const { labels } = useUIConfig()
  const navId = useId()
  const currentHref = useCurrentHref()
  const isDesktop = useMediaQuery(`(min-width: ${baseTokens.breakpoints.md})`)
  const [collapsed, setCollapsed] = useControllableState(collapsedProp, defaultCollapsed, onCollapsedChange)
  const [sidebarOpen, setSidebarOpen] = useControllableState(openProp, defaultOpen, onOpenChange)
  useStoredCollapsed(collapsedProp === undefined ? storageKey : undefined, collapsed, setCollapsed)
  const closeSidebar = () => setSidebarOpen(false)
  const usesSidebar = navigation === 'sidebar' && !hideNavbar
  const sections = [...navigationSections, ...pageSections]
  const trail = breadcrumbs ?? deriveBreadcrumbs({ sections: navigationSections, pageSections, currentHref, pageTitle, activePageSectionId })

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
          onMenuToggle={isDesktop ? () => setCollapsed((previous) => !previous) : () => setSidebarOpen(true)}
          actions={<ThemeToggle />}
        />
      )}

      {navigation === 'navbar' && !hideNavbar && (
        <div className={styles.navbarArea}>
          <Navbar logo={brand} sections={sections} activeSectionId={activePageSectionId} />
        </div>
      )}

      {usesSidebar && isDesktop && (
        <div className={styles.sidebarArea}>
          <AppSidebar brand={brand} brandLogo={brandLogo} footer={sidebarFooter} sections={sections} variant="permanent" activeSectionId={activePageSectionId} navId={navId} collapsed={collapsed} open={sidebarOpen} onClose={closeSidebar} />
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

      {usesSidebar && !isDesktop && <AppSidebar brand={brand} brandLogo={brandLogo} footer={sidebarFooter} sections={sections} variant="modal" activeSectionId={activePageSectionId} navId={navId} collapsed={collapsed} open={sidebarOpen} onClose={closeSidebar} />}
    </div>
  )
}

export default Layout
