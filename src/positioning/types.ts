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
  contextElement?: Element
}

export type AvailableSize = {
  availableWidth: number
  availableHeight: number
}

export type ArrowOptions = {
  element: HTMLElement
  padding?: number
}

export type PositionOptions = {
  placement?: PlacementInput
  offset?: number
  padding?: number
  arrow?: ArrowOptions
  apply?: (size: AvailableSize) => void
}

export type ArrowPosition = {
  x?: number
  y?: number
}

export type PositionResult = AvailableSize & {
  x: number
  y: number
  placement: Placement
  referenceHidden: boolean
  arrow?: ArrowPosition
}
