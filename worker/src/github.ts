import { boardLabels, query as boardQuery, repository } from '../../demo/pages/sugestoes/github.ts'
import { api, githubHeaders, tokenFor } from './token.ts'

import { fullText, shownComments } from '../../demo/pages/sugestoes/comment.ts'

import type { GithubIssue } from '../../demo/pages/sugestoes/github.ts'
import type { Comment, Thread } from '../../demo/pages/sugestoes/comment.ts'
import type { Account, Env, User } from './types.ts'

interface Group {
  content: string
  viewerHasReacted: boolean
}

interface Found {
  search: { nodes: { number?: number; reactionGroups?: Group[] }[] }
}

interface Looked {
  repository: { issue: { id: string; labels: { nodes: { name: string }[] }; reactionGroups: Group[] } | null } | null
}

interface Answer<Data> {
  status: number
  data: Data | null
}

export interface Subject {
  id: string
  voted: boolean
}

const thumbsUp = 'THUMBS_UP'

const tokenEndpoint = 'https://github.com/login/oauth/access_token'

const votedQuery = 'query($search: String!) { search(query: $search, type: ISSUE, first: 100) { nodes { ... on Issue { number reactionGroups { content viewerHasReacted } } } } }'

const issueQuery = 'query($owner: String!, $name: String!, $number: Int!) { repository(owner: $owner, name: $name) { issue(number: $number) { id labels(first: 50) { nodes { name } } reactionGroups { content viewerHasReacted } } } }'

const addMutation = `mutation($id: ID!) { addReaction(input: { subjectId: $id, content: ${thumbsUp} }) { clientMutationId } }`

const removeMutation = `mutation($id: ID!) { removeReaction(input: { subjectId: $id, content: ${thumbsUp} }) { clientMutationId } }`

const [owner = '', name = ''] = repository.split('/')

const reacted = (groups: Group[] = []) => groups.some(({ content, viewerHasReacted }) => content === thumbsUp && viewerHasReacted)

const graphql = async <Data>(token: string, query: string, variables: object): Promise<Answer<Data>> => {
  const response = await fetch(`${api}/graphql`, { method: 'POST', headers: { ...githubHeaders, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables }) })
  const body: { data?: Data; errors?: unknown[] } | null = response.ok ? await response.json() : null

  return { status: response.status, data: body && !body.errors ? (body.data ?? null) : null }
}

const parse = (text: string): Record<string, unknown> => {
  try {
    return JSON.parse(text)
  } catch {
    return Object.fromEntries(new URLSearchParams(text))
  }
}

export const exchange = async ({ GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET }: Account, code: string, verifier: string, redirectUri: string) => {
  const body = JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code, code_verifier: verifier, redirect_uri: redirectUri })
  const response = await fetch(tokenEndpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': githubHeaders['User-Agent'] }, body })
  const { access_token: token, expires_in: expiresIn } = response.ok ? parse(await response.text()) : {}

  return typeof token === 'string' && token !== '' ? { token, expiresIn: Number(expiresIn) || undefined } : null
}

export const userOf = async (token: string): Promise<User | null> => {
  const response = await fetch(`${api}/user`, { headers: { ...githubHeaders, Authorization: `Bearer ${token}` } })
  const { id, login, avatar_url: avatarUrl }: { id?: number; login?: string; avatar_url?: string } = response.ok ? await response.json() : {}

  return typeof id === 'number' && typeof login === 'string' ? { id, login, avatarUrl: typeof avatarUrl === 'string' ? avatarUrl : '' } : null
}

export const revoke = async ({ GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET }: Account, token: string) =>
  fetch(`${api}/applications/${GITHUB_CLIENT_ID}/token`, {
    method: 'DELETE',
    headers: { ...githubHeaders, Authorization: `Basic ${btoa(`${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: token })
  })

export const votedBy = async (token: string): Promise<Answer<number[]>> => {
  const { status, data } = await graphql<Found>(token, votedQuery, { search: boardQuery })

  return { status, data: data ? data.search.nodes.flatMap(({ number, reactionGroups }) => (typeof number === 'number' && reacted(reactionGroups) ? [number] : [])) : null }
}

export const subjectOf = async (token: string, number: number): Promise<Answer<Subject>> => {
  const { status, data } = await graphql<Looked>(token, issueQuery, { owner, name, number })
  const issue = data?.repository?.issue
  const onBoard = issue?.labels.nodes.some((label) => boardLabels.includes(label.name.toLowerCase()))

  return { status, data: issue && onBoard ? { id: issue.id, voted: reacted(issue.reactionGroups) } : null }
}

export const react = async (token: string, id: string, voted: boolean) => {
  const { data } = await graphql<object>(token, voted ? addMutation : removeMutation, { id })

  return data !== null
}

export const openIssue = async (token: string, title: string, body: string): Promise<Answer<GithubIssue>> => {
  const response = await fetch(`${api}/repos/${repository}/issues`, { method: 'POST', headers: { ...githubHeaders, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title, body }) })
  const issue: Partial<GithubIssue> | null = response.ok ? await response.json() : null

  return { status: response.status, data: issue && typeof issue.number === 'number' && typeof issue.html_url === 'string' ? { ...(issue as GithubIssue), labels: [], milestone: null } : null }
}

export const labelIssue = async (env: Env, number: number, labels: string[]) => {
  try {
    const token = await tokenFor(env, 'write')
    const response = await fetch(`${api}/repos/${repository}/issues/${number}/labels`, { method: 'POST', headers: { ...githubHeaders, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ labels }) })

    return response.ok
  } catch {
    return false
  }
}

const movers = ['admin', 'maintain', 'write', 'triage']

const asUser = (token: string, json = false) => ({ ...githubHeaders, Authorization: `Bearer ${token}`, ...(json ? { 'Content-Type': 'application/json' } : {}) })

const byRepository = async (token: string) => {
  const response = await fetch(`${api}/repos/${repository}`, { headers: asUser(token) })
  const { permissions = {} }: { permissions?: Record<string, boolean> } = response.ok ? await response.json() : {}

  return Boolean(permissions.admin || permissions.maintain || permissions.push || permissions.triage)
}

const permissionLife = 5 * 60 * 1000

const known = new Map<number, { allowed: boolean; until: number }>()

const askPermission = async (env: Env, { login }: User, token: string) => {
  try {
    const response = await fetch(`${api}/repos/${repository}/collaborators/${encodeURIComponent(login)}/permission`, { headers: asUser(await tokenFor(env)) })

    if (!response.ok) return await byRepository(token)

    const { permission, role_name: role }: { permission?: string; role_name?: string } = await response.json()

    return movers.includes(role ?? permission ?? '')
  } catch {
    return false
  }
}

export const forgetPermission = (id: number) => known.delete(id)

export const canMove = async (env: Env, user: User, token: string, fresh = false) => {
  const remembered = known.get(user.id)

  if (!fresh && remembered && remembered.until > Date.now()) return remembered.allowed

  const allowed = await askPermission(env, user, token)

  known.set(user.id, { allowed, until: Date.now() + permissionLife })

  return allowed
}

export const readIssue = async (token: string, number: number): Promise<Answer<GithubIssue>> => {
  const response = await fetch(`${api}/repos/${repository}/issues/${number}`, { headers: asUser(token) })
  const issue: (GithubIssue & { pull_request?: unknown }) | null = response.ok ? await response.json() : null

  return { status: response.status, data: issue && !issue.pull_request && Array.isArray(issue.labels) ? issue : null }
}

export const milestoneNumber = async (token: string, title: string): Promise<number | null> => {
  const listed = await fetch(`${api}/repos/${repository}/milestones?state=all&per_page=100`, { headers: asUser(token) })
  const milestones: { number: number; title: string }[] = listed.ok ? await listed.json() : []
  const found = milestones.find((milestone) => milestone.title === title)

  if (found || !listed.ok) return found?.number ?? null

  const created = await fetch(`${api}/repos/${repository}/milestones`, { method: 'POST', headers: asUser(token, true), body: JSON.stringify({ title }) })
  const { number }: { number?: number } = created.ok ? await created.json() : {}

  return typeof number === 'number' ? number : null
}

export const changeIssue = async (token: string, number: number, changes: object): Promise<Answer<GithubIssue>> => {
  const response = await fetch(`${api}/repos/${repository}/issues/${number}`, { method: 'PATCH', headers: asUser(token, true), body: JSON.stringify(changes) })
  const issue: GithubIssue | null = response.ok ? await response.json() : null

  return { status: response.status, data: issue && Array.isArray(issue.labels) ? issue : null }
}

interface Posted {
  id?: number
  html_url?: string
  created_at?: string
  author_association?: string
  user?: { login?: string; avatar_url?: string } | null
}

const maintainers = ['OWNER', 'MEMBER', 'COLLABORATOR']

export const postComment = async (token: string, number: number, body: string): Promise<Answer<Comment>> => {
  const response = await fetch(`${api}/repos/${repository}/issues/${number}/comments`, { method: 'POST', headers: asUser(token, true), body: JSON.stringify({ body }) })
  const { id, html_url: url, created_at: createdAt, author_association: association, user }: Posted = response.ok ? await response.json() : {}
  const posted = typeof id === 'number' && typeof url === 'string' && typeof createdAt === 'string'

  return { status: response.status, data: posted ? { id, url, author: user?.login ?? 'ghost', avatarUrl: user?.avatar_url ?? '', text: body, createdAt, maintainer: maintainers.includes(association ?? '') } : null }
}

export const commentIssue = async (token: string, number: number, body: string) => (await postComment(token, number, body)).data !== null

interface Remark {
  databaseId: number
  url: string
  bodyText: string
  createdAt: string
  isMinimized: boolean
  authorAssociation: string
  author: { login: string; avatarUrl: string } | null
}

interface Discussion {
  repository: { issue: { title: string; body: string; url: string; locked: boolean; labels: { nodes: { name: string }[] }; comments: { totalCount: number; nodes: Remark[] } } | null } | null
}

const threadQuery = `query($owner: String!, $name: String!, $number: Int!) { repository(owner: $owner, name: $name) { issue(number: $number) { title body url locked labels(first: 50) { nodes { name } } comments(last: ${shownComments}) { totalCount nodes { databaseId url bodyText createdAt isMinimized authorAssociation author { login avatarUrl } } } } } }`

export const threadOf = async (env: Env, number: number): Promise<Answer<Thread>> => {
  const { status, data } = await graphql<Discussion>(await tokenFor(env), threadQuery, { owner, name, number })
  const issue = data?.repository?.issue
  const onBoard = issue?.labels.nodes.some((label) => boardLabels.includes(label.name.toLowerCase()))

  if (!issue || !onBoard) return { status, data: null }

  const comments = issue.comments.nodes
    .filter(({ isMinimized }) => !isMinimized)
    .map(({ databaseId, url, bodyText, createdAt, authorAssociation, author }) => ({ id: databaseId, url, author: author?.login ?? 'ghost', avatarUrl: author?.avatarUrl ?? '', text: bodyText, createdAt, maintainer: maintainers.includes(authorAssociation) }))

  return { status, data: { id: number, title: issue.title, url: issue.url, text: fullText(issue.body), locked: issue.locked, total: issue.comments.totalCount, comments } }
}
