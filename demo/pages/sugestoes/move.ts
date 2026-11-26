import type { Status } from './types.ts'

export interface Move {
  status: Status
  version: string
  reason: string
}

export type MoveField = 'status' | 'version' | 'reason'

export type MoveProblem = 'missing' | 'short' | 'long' | 'invalid'

export type MoveProblems = Partial<Record<MoveField, MoveProblem>>

export type MoveCheck = { ok: true; move: Move } | { ok: false; problems: MoveProblems }

export const reasonLimits = { min: 10, max: 600 }

export const statusLabels: Record<Status, string | null> = {
  analise: null,
  backlog: 'backlog',
  desenvolvimento: 'in progress',
  lancado: null,
  recusado: 'wontfix'
}

const statuses = Object.keys(statusLabels) as Status[]

const managed = Object.values(statusLabels).filter((label): label is string => label !== null)

const versionPattern = /^v?(\d{1,4}\.\d{1,4}\.\d{1,4})$/

const textOf = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const reasonProblem = (reason: string): MoveProblem | null => {
  if (reason === '') return 'missing'
  if (reason.length < reasonLimits.min) return 'short'

  return reason.length > reasonLimits.max ? 'long' : null
}

export const checkMove = (value: unknown): MoveCheck => {
  const { status, version, reason } = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>
  const target = statuses.find((item) => item === status)
  const number = versionPattern.exec(textOf(version))?.[1] ?? ''
  const why = textOf(reason)
  const found: [MoveField, MoveProblem | null][] = [
    ['status', target ? null : 'invalid'],
    ['version', target === 'lancado' && number === '' ? (textOf(version) === '' ? 'missing' : 'invalid') : null],
    ['reason', target === 'recusado' ? reasonProblem(why) : null]
  ]
  const problems: MoveProblems = Object.fromEntries(found.filter(([, problem]) => problem !== null))

  if (!target || Object.keys(problems).length > 0) return { ok: false, problems }

  return { ok: true, move: { status: target, version: target === 'lancado' ? number : '', reason: target === 'recusado' ? why : '' } }
}

export const milestoneOf = ({ version }: Move) => `v${version}`

export const labelsAfter = (current: string[], { status }: Move) => {
  const kept = current.filter((label) => !managed.includes(label.toLowerCase()))
  const added = statusLabels[status]

  return added ? [...kept, added] : kept
}

export const stateAfter = ({ status }: Move): { state: 'open' | 'closed'; state_reason?: 'completed' | 'not_planned' | 'reopened' } => {
  if (status === 'lancado') return { state: 'closed', state_reason: 'completed' }
  if (status === 'recusado') return { state: 'closed', state_reason: 'not_planned' }

  return { state: 'open' }
}
