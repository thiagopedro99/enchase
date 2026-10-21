import type { CssHooksGroup } from './apiDocs.mjs'

export type CssHook = { name: string; fallback: string; properties: string[]; components: string[] }

export const collectCssHooks: (componentsRoot: string) => CssHook[]

export const ownerOf: (hook: { name: string; components: string[] }) => string

export const resolveToken: (reference: string, tokens: Record<string, string>, depth?: number) => string | undefined

export const cssHooksModel: (componentsRoot: string, tokens?: Record<string, string>) => CssHooksGroup[]
