import type { Kind, Status, Suggestion, SuggestionsResult } from './types.ts'

interface GithubLabel {
  name: string
}

export interface GithubIssue {
  number: number
  html_url: string
  title: string
  body: string | null
  state: 'open' | 'closed'
  state_reason: string | null
  comments: number
  created_at: string
  labels: GithubLabel[]
  milestone: { title: string } | null
  reactions?: { '+1'?: number }
}

export interface GithubComment {
  issue_url: string
  body: string | null
  author_association: string
}

const repository = 'thiagopedro99/enchase'

const query = `repo:${repository} is:issue label:enhancement,bug`

export const issuesEndpoint = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=100`

export const commentsEndpoint = `https://api.github.com/repos/${repository}/issues/comments?sort=created&direction=desc&per_page=100`

const cacheKey = 'enchase-suggestions'

const cacheLife = 5 * 60 * 1000

const summaryLimit = 150

const reasonLimit = 200

const maintainers = ['OWNER', 'MEMBER', 'COLLABORATOR']

const areaPrefix = 'area:'

const templateLines = ['The props, the CSS hooks or the markup that you have in mind.']

const clip = (text: string, limit: number) => (text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text)

export const plainText = (body: string | null, limit: number) => {
  const lines = (body ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !/^\*\*.*\*\*$/.test(line) && !line.startsWith('#') && !line.startsWith('<!--') && !templateLines.includes(line))

  const text = lines
    .join(' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return clip(text, limit)
}

const statusOf = ({ state, state_reason }: GithubIssue, labels: string[]): Status => {
  if (labels.includes('wontfix') || state_reason === 'not_planned') return 'recusado'
  if (state === 'closed') return 'lancado'
  if (labels.includes('in progress')) return 'desenvolvimento'
  if (labels.includes('backlog')) return 'backlog'

  return 'analise'
}

const kindOf = (labels: string[]): Kind => {
  if (labels.includes('component')) return 'componente'
  if (labels.includes('bug')) return 'correcao'

  return 'melhoria'
}

const numberOf = (issueUrl: string) => Number(issueUrl.slice(issueUrl.lastIndexOf('/') + 1))

export const reasonsOf = (comments: GithubComment[]) => {
  const reasons = new Map<number, string>()

  for (const { issue_url, body, author_association } of comments) {
    const id = numberOf(issue_url)
    const text = plainText(body, reasonLimit)

    if (!reasons.has(id) && maintainers.includes(author_association) && text !== '') reasons.set(id, text)
  }

  return reasons
}

export const toSuggestion = (issue: GithubIssue, reasons: Map<number, string> = new Map()): Suggestion => {
  const labels = issue.labels.map(({ name }) => name.toLowerCase())
  const status = statusOf(issue, labels)
  const area = issue.labels.find(({ name }) => name.toLowerCase().startsWith(areaPrefix))?.name.slice(areaPrefix.length).trim()
  const version = status === 'lancado' ? issue.milestone?.title.replace(/^v/, '') : undefined
  const reason = status === 'recusado' ? reasons.get(issue.number) : undefined

  return {
    id: issue.number,
    url: issue.html_url,
    title: issue.title,
    text: plainText(issue.body, summaryLimit),
    kind: kindOf(labels),
    votes: issue.reactions?.['+1'] ?? 0,
    comments: issue.comments,
    status,
    createdAt: issue.created_at,
    ...(area ? { area } : {}),
    ...(version ? { version } : {}),
    ...(reason ? { reason } : {})
  }
}

const readCache = (): Suggestion[] | null => {
  try {
    const stored = window.sessionStorage.getItem(cacheKey)
    const { at, items } = stored ? JSON.parse(stored) : { at: 0, items: null }

    return Array.isArray(items) && Date.now() - at < cacheLife ? items : null
  } catch {
    return null
  }
}

const writeCache = (items: Suggestion[]) => {
  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), items }))
  } catch {
    return
  }
}

const headers = { Accept: 'application/vnd.github+json' }

const limited = ({ status }: Response) => status === 403 || status === 429

export const loadSuggestions = async (signal: AbortSignal, fresh = false): Promise<SuggestionsResult> => {
  const cached = fresh ? null : readCache()

  if (cached) return { ok: true, items: cached }

  try {
    const response = await fetch(issuesEndpoint, { headers, signal })

    if (!response.ok) return { ok: false, limited: limited(response) }

    const { items: issues }: { items: GithubIssue[] } = await response.json()
    const declined = issues.some((issue) => statusOf(issue, issue.labels.map(({ name }) => name.toLowerCase())) === 'recusado')
    const reply = declined ? await fetch(commentsEndpoint, { headers, signal }) : null
    const comments: GithubComment[] = reply?.ok ? await reply.json() : []
    const reasons = reasonsOf(comments)
    const items = issues.map((issue) => toSuggestion(issue, reasons))

    writeCache(items)

    return { ok: true, items }
  } catch {
    return { ok: false, limited: false }
  }
}
