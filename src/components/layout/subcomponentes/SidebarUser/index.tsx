import { LogOut } from 'lucide-react'

import { VisuallyHidden } from '@components/common/VisuallyHidden/index.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { SidebarUserProps } from './types.ts'

export const SidebarUser = ({ name, collapsed, onLogout }: SidebarUserProps) => {
  const { labels } = useUIConfig()

  return (
    <div className={styles.wrapper} data-collapsed={collapsed ? '' : undefined}>
      <div className={styles.info}>
        <span className={styles.avatar} aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
        {collapsed ? <VisuallyHidden>{name}</VisuallyHidden> : <span className={styles.name}>{name}</span>}
      </div>
      {!collapsed && onLogout && (
        <button type="button" className={styles.logout} onClick={onLogout} aria-label={labels.logout}>
          <LogOut size={22} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default SidebarUser
