import { LogOut } from 'lucide-react'

import { Avatar, LogoutButton, UserInfo, UserName, UserWrapper } from './styles.ts'
import { VisuallyHidden } from '@components/common/VisuallyHidden/index.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'

import type { SidebarUserProps } from './types.ts'

export const SidebarUser = ({ name, collapsed, onLogout }: SidebarUserProps) => {
  const { labels } = useUIConfig()

  return (
    <UserWrapper $collapsed={collapsed}>
      <UserInfo>
        <Avatar aria-hidden="true">{name.charAt(0).toUpperCase()}</Avatar>
        {collapsed ? <VisuallyHidden>{name}</VisuallyHidden> : <UserName>{name}</UserName>}
      </UserInfo>
      {!collapsed && onLogout && (
        <LogoutButton type="button" onClick={onLogout} aria-label={labels.logout}>
          <LogOut size={22} aria-hidden="true" />
        </LogoutButton>
      )}
    </UserWrapper>
  )
}

export default SidebarUser
