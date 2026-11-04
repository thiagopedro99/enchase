export type Surface = {
  name: string
  version: string
  exports: Record<string, Record<string, string>>
  bin: Record<string, string>
  minimums: { node: string | undefined; peers: Record<string, string>; optionalPeers: string[]; browsers: string[] }
  entries: { key: string; label: string; experimental: boolean; lines: [string, string][] }[]
  css: { hooks: string[]; slots: string[] }
  styles: Record<string, string[]>
}

export type Break = { section: string; key: string; detail: string; names: string[] }

export type ExperimentalChange = { label: string; hook: string; kind: 'added' | 'removed' | 'changed'; items: string[] }

export type Comparison = { breaks: Break[]; notes: string[]; widened: string[]; added: string[]; experimental: ExperimentalChange[] }

export type LineDiff = { removed: { key: string; detail: string }[]; changed: { key: string; detail: string }[]; widened: { key: string; detail: string }[]; added: { key: string; detail: string }[]; addedRequired: { key: string; detail: string }[] }

export type BreaksFile = { since: string; breaks: { key: string; note: string }[] }

export const topLevelIndex: (text: string, needle: string) => number

export const unionMembers: (text: string) => string[]

export const isWidened: (before: string, after: string) => boolean

export const lowerBound: (range: string) => number[] | undefined

export const readSurface: (packageDir: string, load?: (url: string) => Promise<Record<string, unknown>>) => Promise<Surface>

export const readCss: (packageDir: string) => { hooks: string[]; slots: string[] }

export const diffLines: (before: Map<string, string>, after: Map<string, string>) => LineDiff

export const compareSurfaces: (before: Surface, after: Surface) => Comparison

export const applyBreaks: (input: { detected: Break[]; file: unknown; baseline: string }) => { errors: string[]; warnings: string[]; declared: string[] }

export const renderReport: (input: { before: Surface; after: Surface; result: Comparison; errors: string[]; warnings: string[] }) => string

export const resolveBaseline: (name: string, requested?: string) => { dir: string; temporary?: string } | undefined
