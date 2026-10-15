import { ChevronsRightIcon } from '../Icon/icons/ChevronsRightIcon.tsx'
import { ChevronsLeftIcon } from '../Icon/icons/ChevronsLeftIcon.tsx'

import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { useCurrentHref } from '@hooks/useCurrentHref.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { slot } from '@utils/mergeProps.ts'
import { Link } from '../Link/index.tsx'
import { currentOf } from './defaultData.ts'
import Tooltip from '../Tooltip/index.tsx'
import styles from './styles.module.css'

import type { SidebarContentProps, SidebarItemViewProps } from './types.ts'

const SidebarItemView = ({ item, current, collapsed, onSelect }: SidebarItemViewProps) => {
  const handleClick = () => {
    item.onClick?.()
    onSelect?.()
  }

  const content = (
    <>
      <span {...slot('sidebar', 'item-icon')} className={styles.itemIcon} aria-hidden="true">
        {item.icon ?? item.label.charAt(0).toUpperCase()}
      </span>
      {collapsed ? (
        <VisuallyHidden>{item.label}</VisuallyHidden>
      ) : (
        <span {...slot('sidebar', 'item-label')} className={styles.itemText}>
          {item.label}
        </span>
      )}
      {!collapsed && item.badge && (
        <span {...slot('sidebar', 'item-badge')} className={styles.itemBadge}>
          {item.badge}
        </span>
      )}
    </>
  )

  const element = item.href ? (
    <Link href={item.href} native={item.native} aria-current={current} onClick={handleClick} className={styles.item} data-collapsed={collapsed ? '' : undefined}>
      {content}
    </Link>
  ) : (
    <button {...slot('sidebar', 'item-control')} type="button" onClick={handleClick} className={styles.item} data-collapsed={collapsed ? '' : undefined}>
      {content}
    </button>
  )

  return (
    <li {...slot('sidebar', 'item')} className={styles.listItem}>
      {collapsed ? (
        <Tooltip text={item.label} position="end" describe={false}>
          {element}
        </Tooltip>
      ) : (
        element
      )}
    </li>
  )
}

export const SidebarContent = ({ sections, activeSectionId, currentHref, header, footer, collapsed, compact = collapsed, onToggleCollapsed, onSelect, ariaLabel }: SidebarContentProps) => {
  const { labels } = useUIConfig()
  const contextHref = useCurrentHref()
  const location = currentHref ?? contextHref
  const toggleLabel = collapsed ? labels.expandSidebar : labels.collapseSidebar
  const headerContent = typeof header === 'function' ? header({ collapsed: compact }) : header
  const footerContent = typeof footer === 'function' ? footer({ collapsed: compact }) : footer

  return (
    <>
      {headerContent && (
        <div {...slot('sidebar', 'header')} className={styles.headerSlot} data-collapsed={compact ? '' : undefined}>
          {headerContent}
        </div>
      )}

      <nav {...slot('sidebar', 'nav')} className={styles.nav} aria-label={ariaLabel}>
        {sections.map((section, index) => (
          <div key={section.id} {...slot('sidebar', 'section')} className={styles.section}>
            {section.title && !compact && (
              <p {...slot('sidebar', 'section-title')} className={styles.sectionTitle} aria-hidden="true">
                {section.title}
              </p>
            )}
            {compact && index > 0 && <hr {...slot('sidebar', 'section-divider')} className={styles.sectionDivider} />}
            <ul className={styles.itemList} aria-label={section.title}>
              {section.items.map((item) => (
                <SidebarItemView key={item.id} item={item} current={currentOf(item, activeSectionId, location)} collapsed={compact} onSelect={onSelect} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {(footerContent || onToggleCollapsed) && (
        <div {...slot('sidebar', 'footer')} className={styles.footerSlot} data-collapsed={compact ? '' : undefined}>
          {footerContent}
          {onToggleCollapsed && (
            <button {...slot('sidebar', 'collapse-button')} type="button" className={styles.collapseButton} onClick={onToggleCollapsed} aria-label={toggleLabel} aria-expanded={!collapsed}>
              {collapsed ? <ChevronsRightIcon size={22} /> : <ChevronsLeftIcon size={22} />}
            </button>
          )}
        </div>
      )}
    </>
  )
}

export default SidebarContent
