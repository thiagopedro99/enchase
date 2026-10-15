import type { Align, LogicalSide, Placement, PlacementInput, Side } from './types.ts'

export const opposite: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
}

export const split = (placement: Placement) => placement.split('-') as [Side, Align | undefined]

export const join = (side: Side, align?: Align) => (align ? `${side}-${align}` : side) as Placement

export const isVertical = (side: Side) => side === 'top' || side === 'bottom'

export const flipAlign = (placement: Placement) => {
  const [side, align] = split(placement)

  return join(side, align === 'start' ? 'end' : align === 'end' ? 'start' : undefined)
}

export const flipSide = (placement: Placement) => {
  const [side, align] = split(placement)

  return join(opposite[side], align)
}

export const candidatesOf = (initial: Placement): Placement[] => {
  const [, align] = split(initial)

  return align ? [initial, flipAlign(initial), flipSide(initial), flipAlign(flipSide(initial))] : [initial, flipSide(initial)]
}

const logicalSides: Record<LogicalSide, { ltr: Side; rtl: Side }> = {
  start: { ltr: 'left', rtl: 'right' },
  end: { ltr: 'right', rtl: 'left' }
}

const isLogical = (side: string): side is LogicalSide => side === 'start' || side === 'end'

export const resolvePlacement = (input: PlacementInput, rtl: boolean): Placement => {
  const [side, align] = input.split('-') as [Side | LogicalSide, Align | undefined]
  const physical = isLogical(side) ? logicalSides[side][rtl ? 'rtl' : 'ltr'] : side

  return join(physical, align)
}
