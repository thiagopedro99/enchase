import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import Tooltip from '../Tooltip/index.tsx'
import styles from './styles.module.css'

import type { SidebarContentProps, SidebarItemViewProps } from './types.ts'

const SidebarItemView = ({ item, active, collapsed, onSelect }: SidebarItemViewProps) => {
  const Icon = item.icon

  const handleClick = () => {
    item.onClick?.()
    onSelect?.()
  }

  const content = (
    <>
      <span className={styles.itemIcon} aria-hidden="true">
        {Icon ? <Icon size={22} /> : item.label.charAt(0).toUpperCase()}
      </span>
      {collapsed ? <VisuallyHidden>{item.label}</VisuallyHidden> : <span className={styles.itemText}>{item.label}</span>}
      {!collapsed && item.badge && <span className={styles.itemBadge}>{item.badge}</span>}
    </>
  )

  const element = item.to ? (
    <NavLink to={item.to} end={item.to === '/'} onClick={handleClick} className={styles.item} data-collapsed={collapsed ? '' : undefined}>
      {content}
    </NavLink>
  ) : item.href ? (
    <a href={item.href} aria-current={active ? 'location' : undefined} onClick={handleClick} className={styles.item} data-collapsed={collapsed ? '' : undefined}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={handleClick} className={styles.item} data-collapsed={collapsed ? '' : undefined}>
      {content}
    </button>
  )

  return (
    <li className={styles.listItem}>
      {collapsed ? (
        <Tooltip text={item.label} position="right" describe={false}>
          {element}
        </Tooltip>
      ) : (
        element
      )}
    </li>
  )
}

export const SidebarContent = ({ sections, activeId, header, footer, collapsed, onToggleCollapsed, onSelect, ariaLabel }: SidebarContentProps) => {
  const { labels } = useUIConfig()
  const toggleLabel = collapsed ? labels.expandSidebar : labels.collapseSidebar
  const headerContent = typeof header === 'function' ? header({ collapsed }) : header
  const footerContent = typeof footer === 'function' ? footer({ collapsed }) : footer

  return (
    <>
      {headerContent && (
        <div className={styles.headerSlot} data-collapsed={collapsed ? '' : undefined}>
          {headerContent}
        </div>
      )}

      <nav className={styles.nav} aria-label={ariaLabel}>
        {sections.map((section, index) => (
          <div key={section.id} className={styles.section}>
            {section.title && !collapsed && (
              <p className={styles.sectionTitle} aria-hidden="true">
                {section.title}
              </p>
            )}
            {collapsed && index > 0 && <hr className={styles.sectionDivider} />}
            <ul className={styles.itemList} aria-label={section.title}>
              {section.items.map((item) => (
                <SidebarItemView key={item.id} item={item} active={item.id === activeId} collapsed={collapsed} onSelect={onSelect} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {(footerContent || onToggleCollapsed) && (
        <div className={styles.footerSlot} data-collapsed={collapsed ? '' : undefined}>
          {footerContent}
          {onToggleCollapsed && (
            <button type="button" className={styles.collapseButton} onClick={onToggleCollapsed} aria-label={toggleLabel} aria-expanded={!collapsed}>
              {collapsed ? <ChevronsRight size={22} aria-hidden="true" /> : <ChevronsLeft size={22} aria-hidden="true" />}
            </button>
          )}
        </div>
      )}
    </>
  )
}

export default SidebarContent
