import { LogOutIcon } from '@components/common/Icon/icons/LogOutIcon.tsx'

import { VisuallyHidden } from '@components/common/VisuallyHidden/index.tsx'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { SidebarUserProps } from './types.ts'

export const SidebarUser = ({ name, collapsed, onLogout, ...props }: SidebarUserProps) => {
  const { labels } = useUIConfig()
  const own = { ...slot('sidebar-user'), className: styles.wrapper, 'data-collapsed': collapsed ? '' : undefined }

  return (
    <div {...mergeProps(own, props)}>
      <div className={styles.info} {...slot('sidebar-user', 'info')}>
        <span className={styles.avatar} {...slot('sidebar-user', 'avatar')} aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
        {collapsed ? (
          <VisuallyHidden>{name}</VisuallyHidden>
        ) : (
          <span className={styles.name} {...slot('sidebar-user', 'name')}>
            {name}
          </span>
        )}
      </div>
      {!collapsed && onLogout && (
        <button type="button" className={styles.logout} {...slot('sidebar-user', 'logout')} onClick={onLogout} aria-label={labels.logout}>
          <LogOutIcon size={22} />
        </button>
      )}
    </div>
  )
}

export default SidebarUser
