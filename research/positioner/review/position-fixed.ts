export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'end'
export type Placement = Side | `${Side}-${Align}`

export interface VirtualElement {
  getBoundingClientRect: () => DOMRect
  contextElement?: Element
}

export interface AvailableSize {
  availableWidth: number
  availableHeight: number
}

export interface PositionOptions {
  placement?: Placement
  offset?: number
  padding?: number
  apply?: (size: AvailableSize) => void
}

export interface PositionResult {
  x: number
  y: number
  placement: Placement
  availableWidth: number
  availableHeight: number
  referenceHidden: boolean
}

type Rect = { x: number; y: number; width: number; height: number }
type Overflow = Record<Side, number>

const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

const split = (placement: Placement) => placement.split('-') as [Side, Align | undefined]

const join = (side: Side, align?: Align) => (align ? `${side}-${align}` : side) as Placement

const isVertical = (side: Side) => side === 'top' || side === 'bottom'

const flipAlign = (placement: Placement) => {
  const [side, align] = split(placement)

  return join(side, align === 'start' ? 'end' : align === 'end' ? 'start' : undefined)
}

const flipSide = (placement: Placement) => {
  const [side, align] = split(placement)

  return join(opposite[side], align)
}

const scrollbarMaximum = 25

const stableGutter = () => {
  const html = document.documentElement
  const bodyStyle = getComputedStyle(document.body)
  const margins = parseFloat(bodyStyle.marginLeft) + parseFloat(bodyStyle.marginRight) || 0
  const reserved = Math.abs(html.clientWidth - document.body.clientWidth - margins)
  const gutter = getComputedStyle(html).scrollbarGutter === 'stable both-edges' ? reserved / 2 : reserved

  return gutter <= scrollbarMaximum ? gutter : 0
}

const viewportRect = (): Rect => {
  const viewport = window.visualViewport
  const base = viewport
    ? { x: viewport.offsetLeft, y: viewport.offsetTop, width: viewport.width, height: viewport.height }
    : { x: 0, y: 0, width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }

  return { ...base, width: base.width - stableGutter() }
}

const dimensionsOf = (element: HTMLElement): Rect => {
  const style = getComputedStyle(element)
  const width = parseFloat(style.width) || 0
  const height = parseFloat(style.height) || 0
  const fallback = Math.round(width) !== element.offsetWidth || Math.round(height) !== element.offsetHeight

  return fallback ? { x: 0, y: 0, width: element.offsetWidth, height: element.offsetHeight } : { x: 0, y: 0, width, height }
}

const coordsFor = (placement: Placement, ref: Rect, size: Rect, gap: number, rtl: boolean) => {
  const [side, align] = split(placement)
  const vertical = isVertical(side)
  const centerX = ref.x + ref.width / 2 - size.width / 2
  const centerY = ref.y + ref.height / 2 - size.height / 2
  const coords = {
    top: { x: centerX, y: ref.y - size.height - gap },
    bottom: { x: centerX, y: ref.y + ref.height + gap },
    left: { x: ref.x - size.width - gap, y: centerY },
    right: { x: ref.x + ref.width + gap, y: centerY }
  }[side]
  const axis = vertical ? 'x' : 'y'
  const half = vertical ? ref.width / 2 - size.width / 2 : ref.height / 2 - size.height / 2
  const direction = (align === 'start' ? -1 : align === 'end' ? 1 : 0) * (rtl && vertical ? -1 : 1)
  coords[axis] += half * direction

  return coords
}

const overflowOf = (x: number, y: number, size: Rect, bounds: Rect, padding: number): Overflow => ({
  top: bounds.y - y + padding,
  left: bounds.x - x + padding,
  bottom: y + size.height - (bounds.y + bounds.height) + padding,
  right: x + size.width - (bounds.x + bounds.width) + padding
})

const alignmentSides = (placement: Placement, ref: Rect, size: Rect, rtl: boolean): [Side, Side] => {
  const [side, align] = split(placement)
  const horizontal = isVertical(side)
  let main: Side = horizontal ? (align === (rtl ? 'end' : 'start') ? 'right' : 'left') : align === 'start' ? 'bottom' : 'top'
  if (horizontal ? ref.width > size.width : ref.height > size.height) main = opposite[main]

  return [main, opposite[main]]
}

const pickPlacement = (initial: Placement, ref: Rect, size: Rect, measure: (placement: Placement) => Overflow, rtl: boolean) => {
  const [, align] = split(initial)
  const candidates = align ? [initial, flipAlign(initial), flipSide(initial), flipAlign(flipSide(initial))] : [initial, flipSide(initial)]
  const tried: { placement: Placement; overflows: number[] }[] = []
  for (const placement of candidates) {
    const overflow = measure(placement)
    const [first, second] = alignmentSides(placement, ref, size, rtl)
    const overflows = [overflow[split(placement)[0]], overflow[first], overflow[second]]
    if (overflows.every((value) => value <= 0)) return placement
    tried.push({ placement, overflows })
  }
  const mainFits = tried.filter((entry) => entry.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]
  if (mainFits) return mainFits.placement
  const total = (entry: { overflows: number[] }) => entry.overflows.reduce((sum, value) => sum + Math.max(value, 0), 0)

  return [...tried].sort((a, b) => total(a) - total(b))[0].placement
}

const isClipping = (style: CSSStyleDeclaration) => /auto|scroll|hidden|clip|overlay/.test(`${style.overflowX} ${style.overflowY}`) && !['inline', 'contents'].includes(style.display)

const isContainingBlock = (style: CSSStyleDeclaration) => [style.transform, style.translate, style.scale, style.rotate, style.perspective, style.filter, style.backdropFilter].some((value) => value && value !== 'none') || /transform|translate|scale|rotate|perspective|filter/.test(style.willChange) || /paint|layout|strict|content/.test(style.contain)

const ancestorsOf = (element: Element | null | undefined): Element[] => {
  const parent = element?.parentElement
  if (!parent || parent === document.body || parent === document.documentElement) return []

  return [parent, ...ancestorsOf(parent)]
}

const clippingRects = (element: Element | undefined) => {
  if (!element) return []

  return ancestorsOf(element).reduce(
    (state, node) => {
      const style = getComputedStyle(node)
      const escapes = !isContainingBlock(style) && (state.chain === 'fixed' || (state.chain === 'absolute' && style.position === 'static'))
      if (escapes) return state
      const rect = node.getBoundingClientRect()
      const clip = isClipping(style) ? [{ x: rect.x + node.clientLeft, y: rect.y + node.clientTop, width: node.clientWidth, height: node.clientHeight }] : []

      return { chain: style.position, clips: [...state.clips, ...clip] }
    },
    { chain: getComputedStyle(element).position, clips: [] as Rect[] }
  ).clips
}

const isHidden = (reference: Element | VirtualElement, ref: Rect) => {
  const context = reference instanceof Element ? reference : reference.contextElement
  const clips = [viewportRect(), ...clippingRects(context)]

  return clips.some((clip) => ref.x >= clip.x + clip.width || ref.x + ref.width <= clip.x || ref.y >= clip.y + clip.height || ref.y + ref.height <= clip.y)
}

export const computePosition = (reference: Element | VirtualElement, floating: HTMLElement, options: PositionOptions = {}, attempt = 0): PositionResult => {
  const { placement: initial = 'bottom', offset = 0, padding = 0 } = options
  const rtl = getComputedStyle(floating).direction === 'rtl'
  const ref = reference.getBoundingClientRect()
  const size = dimensionsOf(floating)
  const bounds = viewportRect()
  const measure = (placement: Placement) => {
    const { x, y } = coordsFor(placement, ref, size, offset, rtl)

    return overflowOf(x, y, size, bounds, padding)
  }
  const placement = pickPlacement(initial, ref, size, measure, rtl)
  const [side] = split(placement)
  const coords = coordsFor(placement, ref, size, offset, rtl)
  const overflow = overflowOf(coords.x, coords.y, size, bounds, padding)
  const axis = isVertical(side) ? 'x' : 'y'
  const [low, high]: [Side, Side] = axis === 'x' ? ['left', 'right'] : ['top', 'bottom']
  coords[axis] = Math.max(coords[axis] + overflow[low], Math.min(coords[axis], coords[axis] - overflow[high]))
  const clipWidth = size.width - overflow.left - overflow.right
  const clipHeight = size.height - overflow.top - overflow.bottom

  const result = {
    x: coords.x,
    y: coords.y,
    placement,
    availableWidth: axis === 'x' ? clipWidth : Math.min(size.width - overflow[side], clipWidth),
    availableHeight: axis === 'y' ? clipHeight : Math.min(size.height - overflow[side], clipHeight),
    referenceHidden: isHidden(reference, ref)
  }
  if (!options.apply) return result
  options.apply(result)
  const next = dimensionsOf(floating)
  if (attempt > 2 || (next.width === size.width && next.height === size.height)) return result

  return computePosition(reference, floating, options, attempt + 1)
}

const observeMove = (element: Element, onMove: () => void) => {
  let observer: IntersectionObserver | undefined
  let timer = 0
  const refresh = (skip = false, threshold = 1) => {
    clearTimeout(timer)
    observer?.disconnect()
    const rect = element.getBoundingClientRect()
    if (!skip) onMove()
    if (!rect.width || !rect.height) return
    const root = document.documentElement
    const rootMargin = [rect.top, root.clientWidth - rect.right, root.clientHeight - rect.bottom, rect.left].map((value) => `${-Math.floor(value)}px`).join(' ')
    let first = true
    observer = new IntersectionObserver(
      ([entry]) => {
        const now = element.getBoundingClientRect()
        if (now.x !== rect.x || now.y !== rect.y || now.width !== rect.width || now.height !== rect.height) return refresh()
        const ratio = entry.intersectionRatio
        if (ratio !== threshold && !first) return refresh()
        if (ratio !== threshold && !ratio) timer = window.setTimeout(() => refresh(false, 1e-7), 1000)
        if (ratio !== threshold && ratio) refresh(false, ratio)
        first = false
      },
      { root: document, rootMargin, threshold: Math.max(0, Math.min(1, threshold)) || 1 }
    )
    observer.observe(element)
  }
  const onResize = () => refresh(true)
  window.addEventListener('resize', onResize)
  refresh(true)

  return () => {
    clearTimeout(timer)
    window.removeEventListener('resize', onResize)
    observer?.disconnect()
  }
}

export const autoUpdate = (reference: Element | VirtualElement, floating: HTMLElement, update: () => void, everyFrame = false) => {
  let frame = 0
  let reobserve = 0
  let active = true
  let last = ''
  const run = () => {
    if (active) update()
  }
  const element = reference instanceof Element ? reference : reference.contextElement
  const observer: ResizeObserver = new ResizeObserver(([entry]) => {
    if (entry?.target === element) {
      observer.unobserve(floating)
      cancelAnimationFrame(reobserve)
      reobserve = requestAnimationFrame(() => observer.observe(floating))
    }
    run()
  })
  if (element && !everyFrame) observer.observe(element)
  observer.observe(floating)
  const stopMove = element && !everyFrame ? observeMove(element, run) : undefined
  const targets: EventTarget[] = [window, ...(window.visualViewport ? [window.visualViewport] : [])]
  targets.forEach((target) => target.addEventListener('resize', run))
  targets.forEach((target) => target.addEventListener('scroll', run, { capture: true, passive: true }))
  const loop = () => {
    const rect = reference.getBoundingClientRect()
    const key = `${rect.x},${rect.y},${rect.width},${rect.height}`
    if (key !== last) run()
    last = key
    if (active) frame = requestAnimationFrame(loop)
  }
  if (everyFrame) loop()
  else update()

  return () => {
    active = false
    cancelAnimationFrame(frame)
    cancelAnimationFrame(reobserve)
    stopMove?.()
    observer.disconnect()
    targets.forEach((target) => target.removeEventListener('resize', run))
    targets.forEach((target) => target.removeEventListener('scroll', run, { capture: true }))
  }
}
