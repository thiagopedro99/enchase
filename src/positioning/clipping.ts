import { viewportRect } from './viewport.ts'

import type { Rect, VirtualElement } from './types.ts'

const clippingOverflow = /auto|scroll|hidden|clip|overlay/

const transformedProperties = ['transform', 'translate', 'scale', 'rotate', 'perspective', 'filter', 'backdropFilter'] as const

const isClipping = (style: CSSStyleDeclaration) => clippingOverflow.test(`${style.overflowX} ${style.overflowY}`) && !['inline', 'contents'].includes(style.display)

const isContainingBlock = (style: CSSStyleDeclaration) =>
  transformedProperties.some((property) => style[property] && style[property] !== 'none') || /transform|translate|scale|rotate|perspective|filter/.test(style.willChange) || /paint|layout|strict|content/.test(style.contain)

const ancestorsOf = (element: Element | null | undefined): Element[] => {
  const parent = element?.parentElement
  if (!parent || parent === document.body || parent === document.documentElement) return []

  return [parent, ...ancestorsOf(parent)]
}

type Chain = {
  position: string
  clips: Rect[]
}

const innerBox = (node: Element): Rect => {
  const rect = node.getBoundingClientRect()

  return { x: rect.x + node.clientLeft, y: rect.y + node.clientTop, width: node.clientWidth, height: node.clientHeight }
}

export const clippingRects = (element: Element | undefined): Rect[] => {
  if (!element) return []

  const start: Chain = { position: getComputedStyle(element).position, clips: [] }

  return ancestorsOf(element).reduce<Chain>((chain, node) => {
    const style = getComputedStyle(node)
    const escapes = !isContainingBlock(style) && (chain.position === 'fixed' || (chain.position === 'absolute' && style.position === 'static'))
    if (escapes) return chain

    return { position: style.position, clips: isClipping(style) ? [...chain.clips, innerBox(node)] : chain.clips }
  }, start).clips
}

export const isHidden = (reference: Element | VirtualElement, rect: Rect) => {
  const context = reference instanceof Element ? reference : reference.contextElement

  return [viewportRect(), ...clippingRects(context)].some((clip) => rect.x >= clip.x + clip.width || rect.x + rect.width <= clip.x || rect.y >= clip.y + clip.height || rect.y + rect.height <= clip.y)
}
