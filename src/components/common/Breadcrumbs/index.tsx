import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'

import { CrumbAnchor, CrumbRouterLink, CrumbText, Current, EllipsisButton, Item, List, Nav, Separator } from './styles.ts'
import { collapseTrail, defaultMaxItems } from './defaultData.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'

import type { BreadcrumbItem, BreadcrumbsProps } from './types.ts'

const CrumbLink = ({ item }: { item: BreadcrumbItem }) => {
  if (item.to) return <CrumbRouterLink to={item.to}>{item.label}</CrumbRouterLink>
  if (item.href) return <CrumbAnchor href={item.href}>{item.label}</CrumbAnchor>

  return <CrumbText>{item.label}</CrumbText>
}

export const Breadcrumbs = ({ items, maxItems = defaultMaxItems, ariaLabel }: BreadcrumbsProps) => {
  const { labels } = useUIConfig()
  const [expanded, setExpanded] = useState(false)
  const listRef = useRef<HTMLOListElement>(null)
  const entries = expanded ? items : collapseTrail(items, maxItems)

  useEffect(() => {
    if (expanded) listRef.current?.querySelectorAll<HTMLElement>('a, button')[1]?.focus()
  }, [expanded])

  if (items.length === 0) return null

  return (
    <Nav aria-label={ariaLabel ?? labels.breadcrumb}>
      <List ref={listRef}>
        {entries.map((entry, index) => {
          const isLast = index === entries.length - 1
          const key = entry === 'ellipsis' ? 'ellipsis' : entry.id

          return (
            <Item key={key} $hideOnMobile={index < entries.length - 2}>
              {entry === 'ellipsis' ? (
                <EllipsisButton type="button" aria-label={labels.showFullPath} onClick={() => setExpanded(true)}>
                  …
                </EllipsisButton>
              ) : isLast ? (
                <Current aria-current="page">{entry.label}</Current>
              ) : (
                <CrumbLink item={entry} />
              )}
              {!isLast && (
                <Separator aria-hidden="true">
                  <ChevronRight size={16} />
                </Separator>
              )}
            </Item>
          )
        })}
      </List>
    </Nav>
  )
}

export default Breadcrumbs
