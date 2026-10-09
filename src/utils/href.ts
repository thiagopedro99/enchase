type ClickLike = Pick<MouseEvent, 'button' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'defaultPrevented'>

type LinkAttributes = { target?: string; download?: unknown }

const pathOf = (href: string) => {
  const path = href.split(/[?#]/)[0].replace(/\/+$/, '')

  return path === '' ? '/' : path
}

export const isSectionHref = (href: string) => href.startsWith('#')

export const isInternalHref = (href: string) => href.startsWith('/') && !href.startsWith('//')

export const isCurrentHref = (href: string, currentHref: string | undefined) => {
  if (currentHref === undefined || !isInternalHref(href)) return false

  const target = pathOf(href)
  const location = pathOf(currentHref)

  return target === '/' ? location === '/' : location === target || location.startsWith(`${target}/`)
}

export const shouldNavigate = (href: string, event: ClickLike, { target, download }: LinkAttributes) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false
  if (target && target !== '_self') return false
  if (download !== undefined && download !== false) return false

  return isInternalHref(href)
}
