import { boardLabels, query as boardQuery, repository } from '../../demo/pages/sugestoes/github.ts'
import { api, githubHeaders, tokenFor } from './token.ts'

import type { GithubIssue } from '../../demo/pages/sugestoes/github.ts'
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
