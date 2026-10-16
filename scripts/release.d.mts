export type ParsedVersion = { core: number[]; prerelease: string[] }

export type ReleaseAction = 'publish' | 'tag' | 'skip' | 'fail'

export type ReleaseDecision = { action: ReleaseAction; tag: 'latest' | 'next'; reason: string }

export const parseVersion: (value: string) => ParsedVersion

export const compareVersions: (first: string, second: string) => number

export const distTag: (version: string) => 'latest' | 'next'

export const decideRelease: (input: { version: string; published: string[]; tagExists: boolean }) => ReleaseDecision

export const extractSection: (markdown: string, version: string) => string

export const syncLockVersion: (lock: Record<string, unknown>, version: string) => Record<string, unknown>
