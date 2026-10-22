export const variableGroups = ['color', 'shadow', 'font', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'space', 'radius', 'transition', 'motion', 'control', 'focus', 'border', 'halo', 'hit', 'state', 'z'] as const

export type VariableGroup = (typeof variableGroups)[number]
