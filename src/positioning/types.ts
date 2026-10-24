export type Side = 'top' | 'right' | 'bottom' | 'left'

export type Align = 'start' | 'end'

export type Placement = Side | `${Side}-${Align}`

export type LogicalSide = 'start' | 'end'

export type PlacementInput = Placement | LogicalSide | `${LogicalSide}-${Align}`

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type Overflow = Record<Side, number>

export type VirtualElement = {
  getBoundingClientRect: () => DOMRect
  contextElement?: Element | undefined
}

export type AvailableSize = {
  availableWidth: number
  availableHeight: number
}

export type ArrowOptions = {
  element: HTMLElement
  padding?: number | undefined
}

export type PositionOptions = {
  placement?: PlacementInput | undefined
  offset?: number | undefined
  padding?: number | undefined
  arrow?: ArrowOptions | undefined
  apply?: ((size: AvailableSize) => void) | undefined
}

export type ArrowPosition = {
  x?: number | undefined
  y?: number | undefined
}

export type PositionResult = AvailableSize & {
  x: number
  y: number
  placement: Placement
  referenceHidden: boolean
  arrow?: ArrowPosition | undefined
}
