import type { VariableGroup } from '../tokens/groups.ts'

const prefix = '--enchase'

export type { VariableGroup }

const toKebabCase = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase()

export const variableName = (group: VariableGroup, ...path: string[]) => [prefix, group, ...path.map(toKebabCase)].join('-')

export const cssVar = (group: VariableGroup, ...path: string[]) => `var(${variableName(group, ...path)})`
