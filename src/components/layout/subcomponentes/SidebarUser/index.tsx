import { LogOut } from 'lucide-react'

import { Avatar, LogoutButton, UserInfo, UserName, UserWrapper } from './styles.ts'
import { VisuallyHidden } from '@components/common/VisuallyHidden/index.tsx'
import { useAuthStore } from '@stores/auth/index.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'

import type { SidebarUserProps } from './types.ts'

export const SidebarUser = ({ collapsed }: SidebarUserProps) => {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { labels } = useUIConfig()

  if (!user) return null

  return (
    <UserWrapper $collapsed={collapsed}>
      <UserInfo>
        <Avatar aria-hidden="true">{user.name.charAt(0).toUpperCase()}</Avatar>
        {collapsed ? <VisuallyHidden>{user.name}</VisuallyHidden> : <UserName>{user.name}</UserName>}
      </UserInfo>
      {!collapsed && (
        <LogoutButton type="button" onClick={logout} aria-label={labels.logout}>
          <LogOut size={22} aria-hidden="true" />
        </LogoutButton>
      )}
    </UserWrapper>
  )
}

export default SidebarUser
