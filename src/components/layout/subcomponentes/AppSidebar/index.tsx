import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { useAuthStore } from '@stores/auth/index.ts'
import { useAppStore } from '@stores/app/index.ts'
import SidebarUser from '../SidebarUser/index.tsx'
import Brand from '../Brand/index.tsx'

import type { AppSidebarProps } from './types.ts'

export const AppSidebar = ({ brand, brandLogo, sections, variant, activeId, navId }: AppSidebarProps) => {
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  const open = useAppStore((state) => state.sidebarOpen)
  const setOpen = useAppStore((state) => state.setSidebarOpen)
  const hasUser = useAuthStore((state) => state.user !== null)

  return (
    <Sidebar
      id={navId}
      variant={variant}
      sections={sections}
      activeId={activeId}
      header={({ collapsed: isCollapsed }) => <Brand name={brand} logo={brandLogo} compact={isCollapsed} />}
      footer={hasUser ? ({ collapsed: isCollapsed }) => <SidebarUser collapsed={isCollapsed} /> : undefined}
      collapsed={collapsed}
      open={open}
      onClose={() => setOpen(false)}
    />
  )
}

export default AppSidebar
