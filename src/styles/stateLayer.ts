export const stateOpacity = {
  hover: 8,
  focus: 10,
  pressed: 10
}

export const stateLayer = (color: string, opacity: number) => `color-mix(in srgb, ${color} ${opacity}%, transparent)`
