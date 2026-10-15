import type { Rect } from './types.ts'

export const viewportRect = (): Rect => {
  const visual = window.visualViewport
  const root = document.documentElement

  return visual ? { x: visual.offsetLeft, y: visual.offsetTop, width: visual.width, height: visual.height } : { x: 0, y: 0, width: root.clientWidth, height: root.clientHeight }
}

export const dimensionsOf = (element: HTMLElement): Rect => {
  const style = getComputedStyle(element)
  const width = parseFloat(style.width) || 0
  const height = parseFloat(style.height) || 0
  const rounded = Math.round(width) !== element.offsetWidth || Math.round(height) !== element.offsetHeight

  return rounded ? { x: 0, y: 0, width: element.offsetWidth, height: element.offsetHeight } : { x: 0, y: 0, width, height }
}

export const isRtl = (element: Element) => getComputedStyle(element).direction === 'rtl'
