export type Status = 'analise' | 'backlog' | 'desenvolvimento' | 'lancado' | 'recusado'

export type Kind = 'componente' | 'melhoria' | 'correcao'

export type KindFilter = Kind | 'todos'

export type Sort = 'votos' | 'recentes'

export interface Suggestion {
  id: number
  url: string
  title: string
  text: string
  kind: Kind
  area?: string
  votes: number
  comments: number
  status: Status
  createdAt: string
  version?: string
  reason?: string
}

export interface StatusInfo {
  value: Status
  label: string
  text: string
}

export interface Column extends StatusInfo {
  items: Suggestion[]
}

export interface Filters {
  query: string
  kind: KindFilter
  sort: Sort
}

export type SuggestionsResult = { ok: true; items: Suggestion[] } | { ok: false; limited: boolean }

export type SuggestionsState = { status: 'loading' } | { status: 'ready'; items: Suggestion[] } | { status: 'error'; limited: boolean }

export interface Viewer {
  login: string
  avatarUrl: string
}

export type AccountState = { status: 'unavailable' } | { status: 'anonymous' } | { status: 'signed'; user: Viewer; voted: number[]; canMove: boolean }

export type VoteResult = 'ok' | 'signedOut' | 'limited' | 'failed'

export type VotingMode = 'off' | 'anonymous' | 'signed'

export interface Voting {
  mode: VotingMode
  voted: number[]
  deltas: Record<number, number>
  pending: number[]
  onVote: (suggestion: Suggestion) => void
}

export type LoginReason = 'vote' | 'suggest'

export interface LoginRequest {
  reason: LoginReason
  suggestion?: Suggestion
}

export type SendResult = { status: 'ok'; suggestion: Suggestion; listed: boolean } | { status: 'invalid'; problems: Record<string, string> } | { status: 'signedOut' | 'daily' | 'limited' | 'failed' }

export type SendFailure = Exclude<SendResult['status'], 'ok' | 'invalid'>

export type MoveResult = { status: 'ok'; suggestion: Suggestion } | { status: 'invalid'; problems: Record<string, string> } | { status: 'signedOut' | 'forbidden' | 'limited' | 'failed' }

export type MoveFailure = Exclude<MoveResult['status'], 'ok' | 'invalid'>

export interface MoveRequest {
  suggestion: Suggestion
  status: Status
}
