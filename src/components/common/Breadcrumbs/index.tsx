import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { collapseTrail, defaultMaxItems } from './defaultData.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { BreadcrumbItem, BreadcrumbsProps } from './types.ts'

const CrumbLink = ({ item }: { item: BreadcrumbItem }) => {
  if (item.to)
    return (
      <Link to={item.to} className={styles.crumb}>
        {item.label}
      </Link>
    )

  if (item.href)
    return (
      <a href={item.href} className={styles.crumb}>
        {item.label}
      </a>
    )

  return <span className={styles.crumbText}>{item.label}</span>
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
    <nav className={styles.nav} aria-label={ariaLabel ?? labels.breadcrumb}>
      <ol ref={listRef} className={styles.list}>
        {entries.map((entry, index) => {
          const isLast = index === entries.length - 1
          const key = entry === 'ellipsis' ? 'ellipsis' : entry.id

          return (
            <li key={key} className={styles.item} data-hide-on-mobile={index < entries.length - 2 ? '' : undefined}>
              {entry === 'ellipsis' ? (
                <button type="button" className={styles.ellipsis} aria-label={labels.showFullPath} onClick={() => setExpanded(true)}>
                  …
                </button>
              ) : isLast ? (
                <span className={styles.current} aria-current="page">
                  {entry.label}
                </span>
              ) : (
                <CrumbLink item={entry} />
              )}
              {!isLast && (
                <span className={styles.separator} aria-hidden="true">
                  <ChevronRight size={16} />
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
