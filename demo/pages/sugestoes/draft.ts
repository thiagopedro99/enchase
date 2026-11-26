import type { Kind } from './types.ts'

export interface Draft {
  kind: Kind
  title: string
  need: string
  proposal: string
}

export type DraftField = keyof Draft

export type DraftProblem = 'missing' | 'short' | 'long' | 'invalid'

export type DraftProblems = Partial<Record<DraftField, DraftProblem>>

export type DraftCheck = { ok: true; draft: Draft } | { ok: false; problems: DraftProblems }

export const draftLimits = {
  title: { min: 8, max: 120 },
  need: { min: 20, max: 3000 },
  proposal: { min: 0, max: 3000 }
}

export const dailySuggestions = 3

export const emptyDraft: Draft = { kind: 'melhoria', title: '', need: '', proposal: '' }

const kinds: Kind[] = ['componente', 'melhoria', 'correcao']

const labels: Record<Kind, string[]> = {
  componente: ['enhancement', 'component'],
  melhoria: ['enhancement'],
  correcao: ['bug']
}

const headings: Record<Kind, { need: string; proposal: string }> = {
  componente: { need: 'What you need, and what you do today instead', proposal: 'What it would look like' },
  melhoria: { need: 'What you need, and what you do today instead', proposal: 'What it would look like' },
  correcao: { need: 'What happened, and what you expected', proposal: 'How to reproduce it' }
}

const origin = '<!-- sent from the suggestions page of the site -->'

const tab = 9

const lineFeed = 10

const lastControl = 31

const deleteCode = 127

const printable = (char: string) => {
  const code = char.charCodeAt(0)

  return code === tab || code === lineFeed || (code > lastControl && code !== deleteCode)
}

const textOf = (value: unknown) =>
  typeof value === 'string'
    ? Array.from(value.replace(/\r\n?/g, '\n'))
        .filter(printable)
        .join('')
        .trim()
    : ''

const lineOf = (value: unknown) => textOf(value).replace(/\s+/g, ' ')

const problemOf = (text: string, { min, max }: { min: number; max: number }): DraftProblem | null => {
  if (text.length === 0 && min > 0) return 'missing'
  if (text.length < min) return 'short'

  return text.length > max ? 'long' : null
}

export const checkDraft = (value: unknown): DraftCheck => {
  const { kind, title, need, proposal } = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>
  const draft: Draft = { kind: kinds.find((item) => item === kind) ?? emptyDraft.kind, title: lineOf(title), need: textOf(need), proposal: textOf(proposal) }
  const found: [DraftField, DraftProblem | null][] = [
    ['kind', kinds.includes(kind as Kind) ? null : 'invalid'],
    ['title', problemOf(draft.title, draftLimits.title)],
    ['need', problemOf(draft.need, draftLimits.need)],
    ['proposal', problemOf(draft.proposal, draftLimits.proposal)]
  ]
  const problems: DraftProblems = Object.fromEntries(found.filter(([, problem]) => problem !== null))

  return Object.keys(problems).length === 0 ? { ok: true, draft } : { ok: false, problems }
}

export const issueOf = ({ kind, title, need, proposal }: Draft) => {
  const sections = [`**${headings[kind].need}**`, need, ...(proposal ? [`**${headings[kind].proposal}**`, proposal] : []), origin]

  return { title, body: sections.join('\n\n'), labels: labels[kind] }
}
