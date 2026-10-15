import { useEffect, useRef, useState } from 'react'
import { ChevronRightIcon } from '../Icon/icons/ChevronRightIcon.tsx'

import { Link } from '../Link/index.tsx'
import { collapseTrail, defaultMaxItems } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { BreadcrumbItem, BreadcrumbsProps } from './types.ts'

const CrumbLink = ({ item }: { item: BreadcrumbItem }) => {
  if (item.href)
    return (
      <Link href={item.href} native={item.native} title={item.label} className={styles.crumb} {...slot('breadcrumbs', 'link')}>
        {item.label}
      </Link>
    )

  return (
    <span className={styles.crumbText} title={item.label} {...slot('breadcrumbs', 'text')}>
      {item.label}
    </span>
  )
}

export const Breadcrumbs = ({ items, maxItems = defaultMaxItems, ariaLabel, ...props }: BreadcrumbsProps) => {
  const { labels } = useUIConfig()
  const [expanded, setExpanded] = useState(false)
  const listRef = useRef<HTMLOListElement>(null)
  const entries = expanded ? items : collapseTrail(items, maxItems)
  const own = { ...slot('breadcrumbs'), className: styles.nav, 'aria-label': ariaLabel ?? labels.breadcrumb }

  useEffect(() => {
    if (expanded) listRef.current?.querySelectorAll<HTMLElement>('a, button')[1]?.focus()
  }, [expanded])

  if (items.length === 0) return null

  return (
    <nav {...mergeProps(own, props)}>
      <ol ref={listRef} className={styles.list} {...slot('breadcrumbs', 'list')}>
        {entries.map((entry, index) => {
          const isLast = index === entries.length - 1
          const key = entry === 'ellipsis' ? 'ellipsis' : entry.id

          return (
            <li key={key} className={styles.item} {...slot('breadcrumbs', 'item')} data-priority={index < entries.length - 2 ? 'low' : undefined}>
              {entry === 'ellipsis' ? (
                <button type="button" className={styles.ellipsis} {...slot('breadcrumbs', 'ellipsis')} aria-label={labels.showFullPath} onClick={() => setExpanded(true)}>
                  …
                </button>
              ) : isLast ? (
                <span className={styles.current} title={entry.label} {...slot('breadcrumbs', 'current')} aria-current="page">
                  {entry.label}
                </span>
              ) : (
                <CrumbLink item={entry} />
              )}
              {!isLast && (
                <span className={styles.separator} {...slot('breadcrumbs', 'separator')} aria-hidden="true">
                  <ChevronRightIcon size={16} />
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
