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
  comments: number
  created_at: string
  labels: GithubLabel[]
  milestone: { title: string } | null
  locked?: boolean
  reactions?: { '+1'?: number }
}

export type ListedIssue = GithubIssue & { pull_request?: unknown }

export interface GithubComment {
  issue_url: string
  body: string | null
  author_association: string
}

export type Requester = (url: string) => Promise<Response>

export const repository = 'thiagopedro99/enchase'

export const boardLabels = ['enhancement', 'bug']

export const query = `repo:${repository} is:issue label:${boardLabels.join(',')}`

export const issuesEndpoint = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=100`

export const listEndpoints = boardLabels.map((label) => `https://api.github.com/repos/${repository}/issues?state=all&labels=${encodeURIComponent(label)}&per_page=100`)

export const commentsEndpoint = `https://api.github.com/repos/${repository}/issues/comments?sort=created&direction=desc&per_page=100`

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

const labelsOf = ({ labels }: GithubIssue) => labels.map(({ name }) => name.toLowerCase())

const declined = (issue: GithubIssue) => labelsOf(issue).includes('wontfix')

const statusOf = ({ state, milestone }: GithubIssue, labels: string[]): Status | null => {
  if (labels.includes('wontfix')) return 'recusado'
  if (state === 'closed') return milestone ? 'lancado' : null
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

export const toSuggestion = (issue: GithubIssue, reasons: Map<number, string> = new Map()): Suggestion | null => {
  const labels = labelsOf(issue)
  const status = statusOf(issue, labels)

  if (!status) return null

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

const limited = ({ status }: Response) => status === 403 || status === 429

const searched = async (request: Requester): Promise<GithubIssue[] | Response> => {
  const response = await request(issuesEndpoint)

  if (!response.ok) return response

  const { items }: { items: GithubIssue[] } = await response.json()

  return items
}

const listed = async (request: Requester): Promise<GithubIssue[] | Response> => {
  const responses = await Promise.all(listEndpoints.map(request))
  const refused = responses.find((response) => !response.ok)

  if (refused) return refused

  const pages: ListedIssue[][] = await Promise.all(responses.map((response) => response.json()))
  const issues = new Map(pages.flatMap((page) => page.filter((issue) => !issue.pull_request).map((issue) => [issue.number, issue] as const)))

  return Array.from(issues.values())
}

export const readSuggestions = async (request: Requester, direct = false): Promise<SuggestionsResult> => {
  const issues = await (direct ? listed(request) : searched(request))

  if (issues instanceof Response) return { ok: false, limited: limited(issues) }

  const reply = issues.some(declined) ? await request(commentsEndpoint) : null
  const comments: GithubComment[] = reply?.ok ? await reply.json() : []
  const reasons = reasonsOf(comments)

  return { ok: true, items: issues.flatMap((issue) => toSuggestion(issue, reasons) ?? []) }
}
