import { Sidebar } from '@components/common/Sidebar/index.tsx'
import Brand from '../Brand/index.tsx'

import type { AppSidebarProps } from './types.ts'

export const AppSidebar = ({ brand, brandLogo, sections, variant, activeSectionId, navId, footer, collapsed, open, onClose }: AppSidebarProps) => (

    <Sidebar
      id={navId}
      variant={variant}
      sections={sections}
      activeSectionId={activeSectionId}
      header={({ collapsed: isCollapsed }) => <Brand name={brand} logo={brandLogo} compact={isCollapsed} />}
      footer={footer}
      collapsed={collapsed}
      open={open}
      onClose={onClose}
    />
)

export default AppSidebar
