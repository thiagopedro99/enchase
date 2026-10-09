import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { useAppStore } from '@stores/app/index.ts'
import Brand from '../Brand/index.tsx'

import type { AppSidebarProps } from './types.ts'

export const AppSidebar = ({ brand, brandLogo, sections, variant, activeSectionId, navId, footer }: AppSidebarProps) => {
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  const open = useAppStore((state) => state.sidebarOpen)
  const setOpen = useAppStore((state) => state.setSidebarOpen)

  return (
    <Sidebar
      id={navId}
      variant={variant}
      sections={sections}
      activeSectionId={activeSectionId}
      header={({ collapsed: isCollapsed }) => <Brand name={brand} logo={brandLogo} compact={isCollapsed} />}
      footer={footer}
      collapsed={collapsed}
      open={open}
      onClose={() => setOpen(false)}
    />
  )
}

export default AppSidebar
