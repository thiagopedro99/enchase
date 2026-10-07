import { ChevronsLeft, ChevronsRight } from 'lucide-react'

import { CollapseButton, FooterSlot, HeaderSlot, ItemAnchor, ItemBadge, ItemButton, ItemIcon, ItemList, ItemRouterLink, ItemText, ListItem, Nav, Section, SectionDivider, SectionTitle } from './styles.ts'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import Tooltip from '../Tooltip/index.tsx'

import type { SidebarContentProps, SidebarItemViewProps } from './types.ts'

const SidebarItemView = ({ item, active, collapsed, onSelect }: SidebarItemViewProps) => {
  const Icon = item.icon

  const handleClick = () => {
    item.onClick?.()
    onSelect?.()
  }

  const content = (
    <>
      <ItemIcon aria-hidden="true">{Icon ? <Icon size={22} /> : item.label.charAt(0).toUpperCase()}</ItemIcon>
      {collapsed ? <VisuallyHidden>{item.label}</VisuallyHidden> : <ItemText>{item.label}</ItemText>}
      {!collapsed && item.badge && <ItemBadge>{item.badge}</ItemBadge>}
    </>
  )

  const element = item.to ? (
    <ItemRouterLink to={item.to} end={item.to === '/'} onClick={handleClick} $collapsed={collapsed}>
      {content}
    </ItemRouterLink>
  ) : item.href ? (
    <ItemAnchor href={item.href} aria-current={active ? 'location' : undefined} onClick={handleClick} $collapsed={collapsed}>
      {content}
    </ItemAnchor>
  ) : (
    <ItemButton type="button" onClick={handleClick} $collapsed={collapsed}>
      {content}
    </ItemButton>
  )

  return (
    <ListItem>
      {collapsed ? (
        <Tooltip text={item.label} position="right" describe={false}>
          {element}
        </Tooltip>
      ) : (
        element
      )}
    </ListItem>
  )
}

export const SidebarContent = ({ sections, activeId, header, footer, collapsed, onToggleCollapsed, onSelect, ariaLabel }: SidebarContentProps) => {
  const { labels } = useUIConfig()
  const toggleLabel = collapsed ? labels.expandSidebar : labels.collapseSidebar
  const headerContent = typeof header === 'function' ? header({ collapsed }) : header
  const footerContent = typeof footer === 'function' ? footer({ collapsed }) : footer

  return (
    <>
      {headerContent && <HeaderSlot $collapsed={collapsed}>{headerContent}</HeaderSlot>}

      <Nav aria-label={ariaLabel}>
        {sections.map((section, index) => (
          <Section key={section.id}>
            {section.title && !collapsed && <SectionTitle aria-hidden="true">{section.title}</SectionTitle>}
            {collapsed && index > 0 && <SectionDivider />}
            <ItemList aria-label={section.title}>
              {section.items.map((item) => (
                <SidebarItemView key={item.id} item={item} active={item.id === activeId} collapsed={collapsed} onSelect={onSelect} />
              ))}
            </ItemList>
          </Section>
        ))}
      </Nav>

      {(footerContent || onToggleCollapsed) && (
        <FooterSlot $collapsed={collapsed}>
          {footerContent}
          {onToggleCollapsed && (
            <CollapseButton type="button" onClick={onToggleCollapsed} aria-label={toggleLabel} aria-expanded={!collapsed}>
              {collapsed ? <ChevronsRight size={22} aria-hidden="true" /> : <ChevronsLeft size={22} aria-hidden="true" />}
            </CollapseButton>
          )}
        </FooterSlot>
      )}
    </>
  )
}

export default SidebarContent
