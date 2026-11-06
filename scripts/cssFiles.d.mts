export type CssModule = { path: string; css: string }

export type CssComponent = { key: string; file: string; files: string[]; needs: string[]; css: string; bytes: number; gzip: number }

export type CssMapEntry = { file: string; needs: string[]; files: string[]; bytes: number; gzip: number }

export type CssMap = { format: number; components: Record<string, CssMapEntry> }

export const formatVersion: number

export const kebab: (name: string) => string

export const componentOf: (modulePath: string) => { key: string; folder: string }

export const jsOf: (modulePath: string) => string

export const firstRule: (css: string) => string

export const orderModules: (styles: string, modules: CssModule[]) => CssModule[]

export const joinModules: (modules: CssModule[]) => string

export const rulesOf: (css: string) => string[]

export const normalizeCss: (css: string) => string

export const keepsOrder: (fileCss: string, stylesCss: string) => boolean

export const keepsMapOrder: (fileCssList: string[], stylesCss: string) => boolean

export const sameRules: (stylesCss: string, fileCssList: string[]) => boolean

export const importsOf: (source: string) => string[]

export const reachable: (js: Record<string, string>, entries: string[]) => Set<string>

export const needsOf: (input: { groups: { key: string; folder: string; files: string[] }[]; js: Record<string, string> }) => Record<string, string[]>

export const cssComponents: (input: { modules: CssModule[]; js: Record<string, string> }) => CssComponent[]

export const cssMap: (components: CssComponent[]) => CssMap

export const cssFileProblems: (input: { map: CssMap; files: Record<string, string>; styles: string; sources: string[]; js: Record<string, string> }) => string[]
