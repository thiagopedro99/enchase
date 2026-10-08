export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'end'
export type Placement = Side | `${Side}-${Align}`

export interface VirtualElement {
  getBoundingClientRect: () => DOMRect
  contextElement?: Element
}

export interface PositionOptions {
  placement?: Placement
  offset?: number
  padding?: number
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

const viewportRect = (): Rect => {
  const viewport = window.visualViewport

  return viewport
    ? { x: viewport.offsetLeft, y: viewport.offsetTop, width: viewport.width, height: viewport.height }
    : { x: 0, y: 0, width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }
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

const scrollParents = (element: Element | undefined) => {
  const parents: Element[] = []
  for (let node = element?.parentElement; node && node !== document.documentElement; node = node.parentElement) {
    if (/auto|scroll|hidden|clip|overlay/.test(getComputedStyle(node).overflow)) parents.push(node)
  }

  return parents
}

const isHidden = (reference: Element | VirtualElement, ref: Rect) => {
  const context = reference instanceof Element ? reference : reference.contextElement
  const clips = [viewportRect(), ...scrollParents(context).map((node) => node.getBoundingClientRect())]

  return clips.some((clip) => ref.x >= clip.x + clip.width || ref.x + ref.width <= clip.x || ref.y >= clip.y + clip.height || ref.y + ref.height <= clip.y)
}

export const computePosition = (reference: Element | VirtualElement, floating: HTMLElement, options: PositionOptions = {}): PositionResult => {
  const { placement: initial = 'bottom', offset = 0, padding = 0 } = options
  const rtl = getComputedStyle(floating).direction === 'rtl'
  const ref = reference.getBoundingClientRect()
  const size = { x: 0, y: 0, width: floating.offsetWidth, height: floating.offsetHeight }
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

  return {
    x: coords.x,
    y: coords.y,
    placement,
    availableWidth: axis === 'x' ? clipWidth : Math.min(size.width - overflow[side], clipWidth),
    availableHeight: axis === 'y' ? clipHeight : Math.min(size.height - overflow[side], clipHeight),
    referenceHidden: isHidden(reference, ref)
  }
}

export const autoUpdate = (reference: Element | VirtualElement, floating: HTMLElement, update: () => void, everyFrame = false) => {
  let frame = 0
  let last = ''
  const schedule = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(update)
  }
  const element = reference instanceof Element ? reference : reference.contextElement
  const observer = new ResizeObserver(schedule)
  if (element) observer.observe(element)
  observer.observe(floating)
  const targets: EventTarget[] = [window, ...(window.visualViewport ? [window.visualViewport] : [])]
  targets.forEach((target) => target.addEventListener('resize', schedule))
  targets.forEach((target) => target.addEventListener('scroll', schedule, { capture: true, passive: true }))
  const loop = () => {
    const rect = reference.getBoundingClientRect()
    const key = `${rect.x},${rect.y},${rect.width},${rect.height}`
    if (key !== last) update()
    last = key
    frame = requestAnimationFrame(loop)
  }
  if (everyFrame) loop()
  else update()

  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    targets.forEach((target) => target.removeEventListener('resize', schedule))
    targets.forEach((target) => target.removeEventListener('scroll', schedule, { capture: true }))
  }
}
