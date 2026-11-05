export type HookExports = { values: string[]; types: string[] }

export const exportsOf: (declaration: string) => HookExports

export const wrapperOf: (name: string, exported: HookExports) => string

export const deprecationGaps: (headlessDeclaration: string, experimentalDeclaration: string) => string[]
