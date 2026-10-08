const prefix = '--enchase'

export type VariableGroup = 'color' | 'shadow' | 'font' | 'font-size' | 'font-weight' | 'space' | 'radius' | 'transition' | 'state' | 'z'

const toKebabCase = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase()

export const variableName = (group: VariableGroup, ...path: string[]) => [prefix, group, ...path.map(toKebabCase)].join('-')

export const cssVar = (group: VariableGroup, ...path: string[]) => `var(${variableName(group, ...path)})`
