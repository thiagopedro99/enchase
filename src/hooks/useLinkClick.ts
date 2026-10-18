import { shouldNavigate } from '@utils/href.ts'

import { useCurrentHref } from './useCurrentHref.ts'
import { useNavigator } from './useNavigator.ts'

import type { MouseEvent } from 'react'

type LinkClickOptions = {
  href: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  target?: string
  download?: unknown
  native?: boolean
}

export const useLinkClick = ({ href, onClick, target, download, native }: LinkClickOptions) => {
  const navigate = useNavigator()
  const currentHref = useCurrentHref()

  return (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)

    if (!navigate || !shouldNavigate(href, event, { target, download, native }, currentHref ?? window.location.pathname)) return

    event.preventDefault()
    navigate(href)
  }
}
