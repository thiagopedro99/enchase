import type { CodeLanguage } from '../../components/CodeBlock/types.ts'

export type GroupKind = 'novo' | 'mudou' | 'corrigido'

export interface ReleaseGroup {
  kind: GroupKind
  items: string[]
}

export interface ReleaseBlock {
  label: string
  language: CodeLanguage
  code: string
}

export interface ReleaseMigration {
  text: string
  blocks: ReleaseBlock[]
}

export interface ReleaseNote {
  version: string
  previous: string
  date: string
  shortDate: string
  title: string
  summary: string
  behavior: boolean
  groups: ReleaseGroup[]
  migration?: ReleaseMigration
}
