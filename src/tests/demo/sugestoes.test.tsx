import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'

import { commentsEndpoint, issuesEndpoint, plainText, reasonsOf, toSuggestion } from '@demo/pages/sugestoes/github.ts'
import { apiEndpoint } from '@demo/pages/sugestoes/loadSuggestions.ts'
import { sessionEndpoint } from '@demo/pages/sugestoes/account.ts'
import { ageOf, columnsOf, totalOf } from '@demo/pages/sugestoes/columns.ts'
import { defaultFilters } from '@demo/pages/sugestoes/defaultData.ts'
import Sugestoes from '@demo/pages/sugestoes/index.tsx'
import { suggestUrl } from '@demo/defaultData.ts'

import type { GithubComment, GithubIssue } from '@demo/pages/sugestoes/github.ts'
import type { Suggestion } from '@demo/pages/sugestoes/types.ts'

const day = 24 * 60 * 60 * 1000

const now = new Date('2026-11-23T12:00:00Z').getTime()

const ago = (days: number) => new Date(now - days * day).toISOString()

const issue = (number: number, title: string, labels: string[], votes: number, overrides: Partial<GithubIssue> = {}): GithubIssue => ({
  number,
  html_url: `https://github.com/thiagopedro99/enchase/issues/${number}`,
  title,
  body: `**What you need, and what you do today instead**\n\nText of ${title}.`,
  state: 'open',
  comments: 2,
  created_at: ago(number),
  labels: labels.map((name) => ({ name })),
  milestone: null,
  reactions: { '+1': votes },
  ...overrides
})

const issues: GithubIssue[] = [
  issue(1, 'Code block', ['enhancement', 'component', 'area: CodeBlock'], 31),
  issue(2, 'Sticky columns', ['enhancement', 'area: Table'], 17),
  issue(3, 'Date range', ['enhancement', 'component', 'backlog'], 42),
  issue(4, 'Navbar actions', ['enhancement', 'in progress'], 27),
  issue(5, 'Broken word', ['bug', 'in progress'], 8),
  issue(6, 'Class wins', ['enhancement'], 56, { state: 'closed', milestone: { title: 'v0.23.0' } }),
  issue(7, 'Tailwind classes', ['enhancement', 'wontfix'], 19, { state: 'closed' }),
  issue(8, 'React 18', ['enhancement', 'wontfix'], 14),
  issue(9, 'Closed by the author', ['enhancement'], 3, { state: 'closed' })
]

const listed = (items: GithubIssue[] = issues, reasons?: Map<number, string>): Suggestion[] => items.flatMap((item) => toSuggestion(item, reasons) ?? [])

const comments: GithubComment[] = [
  { issue_url: 'https://api.github.com/repos/thiagopedro99/enchase/issues/7', body: 'Me too', author_association: 'NONE' },
  { issue_url: 'https://api.github.com/repos/thiagopedro99/enchase/issues/7', body: 'Enchase is CSS Modules with tokens. Use `enchase eject`.', author_association: 'OWNER' },
  { issue_url: 'https://api.github.com/repos/thiagopedro99/enchase/issues/7', body: 'An older answer.', author_association: 'OWNER' }
]

const reply = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

const serve = (items: GithubIssue[] = issues) =>
  vi.fn((input: RequestInfo | URL) => {
    const url = String(input)

    if (url === issuesEndpoint) return reply({ total_count: items.length, items })
    if (url === commentsEndpoint) return reply(comments)

    return reply({}, 404)
  })

const asked = (fetcher: { mock: { calls: unknown[][] } }) => fetcher.mock.calls.map(([input]) => String(input)).filter((url) => url !== sessionEndpoint)

const renderPage = () => renderWithProviders(<Sugestoes />, { route: '/sugestoes', toasts: true })

const openTab = async (user: ReturnType<typeof userEvent.setup>, name: RegExp) => user.click(await screen.findByRole('tab', { name }))

beforeEach(() => {
  window.sessionStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Suggestions data', () => {
  it('places each issue in the column that its state and labels say', () => {
    const reasons = reasonsOf(comments)

    expect(listed(issues, reasons).map(({ status }) => status)).toEqual(['analise', 'analise', 'backlog', 'desenvolvimento', 'desenvolvimento', 'lancado', 'recusado', 'recusado'])
  })

  it('leaves out a closed issue that has neither a milestone nor the wontfix label, so closing an issue is not enough to move its card', () => {
    expect(toSuggestion(issue(9, 'Closed by the author', ['enhancement'], 3, { state: 'closed' }))).toBeNull()
    expect(listed().map(({ id }) => id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('reads the kind, the area, the votes and the version of an issue', () => {
    expect(toSuggestion(issues[0] as GithubIssue)).toMatchObject({ id: 1, kind: 'componente', area: 'CodeBlock', votes: 31, comments: 2, text: 'Text of Code block.' })
    expect(toSuggestion(issues[4] as GithubIssue)).toMatchObject({ kind: 'correcao' })
    expect(toSuggestion(issues[5] as GithubIssue)).toMatchObject({ kind: 'melhoria', version: '0.23.0' })
    expect(toSuggestion(issues[1] as GithubIssue)).not.toHaveProperty('version')
  })

  it('takes the reason of a declined issue from the latest comment of a maintainer', () => {
    const reasons = reasonsOf(comments)

    expect(toSuggestion(issues[6] as GithubIssue, reasons)?.reason).toBe('Enchase is CSS Modules with tokens. Use enchase eject.')
    expect(toSuggestion(issues[7] as GithubIssue, reasons)).not.toHaveProperty('reason')
  })

  it('drops the headings of the template and the markdown marks from the summary', () => {
    expect(plainText('**What it would look like**\n\nThe props, the CSS hooks or the markup that you have in mind.\n\nA [link](https://example.com) and `code`.', 150)).toBe('A link and code.')
    expect(plainText('a'.repeat(200), 150)).toHaveLength(151)
    expect(plainText(null, 150)).toBe('')
  })

  it('filters by kind and by text, and sorts by votes or by date', () => {
    const items = listed()
    const byVotes = columnsOf(items, defaultFilters)

    expect(totalOf(byVotes)).toBe(items.length)
    expect(byVotes[0]?.items.map(({ id }) => id)).toEqual([1, 2])
    expect(columnsOf(items, { ...defaultFilters, sort: 'recentes' })[2]?.items.map(({ id }) => id)).toEqual([4, 5])
    expect(totalOf(columnsOf(items, { ...defaultFilters, kind: 'componente' }))).toBe(2)
    expect(totalOf(columnsOf(items, { ...defaultFilters, query: '  table ' }))).toBe(1)
  })

  it('says how long ago an issue was opened', () => {
    expect(ageOf(ago(0), now)).toBe('hoje')
    expect(ageOf(ago(1), now)).toBe('há 1 dia')
    expect(ageOf(ago(12), now)).toBe('há 12 dias')
    expect(ageOf(ago(70), now)).toBe('há 2 meses')
    expect(ageOf(ago(800), now)).toBe('há 2 anos')
  })
})

describe('Suggestions page', () => {
  it('reads the suggestions from the API of the site and leaves GitHub alone when it answers', async () => {
    const fetcher = vi.fn((input: RequestInfo | URL) => (String(input) === apiEndpoint ? reply({ items: listed().slice(0, 2) }) : reply({}, 404)))

    vi.stubGlobal('fetch', fetcher)
    renderPage()

    expect(await screen.findByRole('link', { name: 'Code block' })).toBeInTheDocument()
    expect(screen.getByText('2 sugestões')).toBeInTheDocument()
    expect(asked(fetcher)).toEqual([apiEndpoint])
  })

  it.each([
    ['the page of the site instead of JSON', () => Promise.resolve(new Response('<!doctype html>', { status: 200, headers: { 'Content-Type': 'text/html' } }))],
    ['an error', () => reply({ error: 'unavailable' }, 502)],
    ['JSON without the list', () => reply({ items: null })],
    ['nothing, because the request failed', () => Promise.reject(new Error('offline'))]
  ])('asks GitHub when the API answers %s', async (_name, answer) => {
    const github = serve()
    const fetcher = vi.fn((input: RequestInfo | URL) => (String(input) === apiEndpoint ? answer() : github(input)))

    vi.stubGlobal('fetch', fetcher)
    renderPage()

    expect(await screen.findByRole('link', { name: 'Code block' })).toBeInTheDocument()
    expect(screen.getByText('8 sugestões')).toBeInTheDocument()
    expect(asked(fetcher)).toEqual([apiEndpoint, issuesEndpoint, commentsEndpoint])
  })

  it('announces the loading and then draws the board', async () => {
    vi.stubGlobal('fetch', serve())
    renderPage()

    expect(screen.getByText('Carregando as sugestões').closest('[role="status"]')).toBeInTheDocument()
    expect(await screen.findByRole('tab', { name: /Em análise/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('link', { name: 'Code block' })).toHaveAttribute('href', 'https://github.com/thiagopedro99/enchase/issues/1')
    expect(screen.getByText('8 sugestões')).toBeInTheDocument()
  })

  it('has no axe violations with the board on screen', async () => {
    vi.stubGlobal('fetch', serve())

    const { container } = renderPage()

    await screen.findByRole('tab', { name: /Em análise/ })

    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows the version of a released suggestion and the reason of a declined one', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve())
    renderPage()

    await openTab(user, /Lançado/)

    expect(screen.getByRole('link', { name: 'Class wins' })).toHaveTextContent('Lançado na 0.23.0')

    await openTab(user, /Não vamos fazer/)

    expect(screen.getByRole('link', { name: 'Tailwind classes' })).toHaveTextContent('Enchase is CSS Modules with tokens.')
  })

  it('describes each card by its votes and comments', async () => {
    vi.stubGlobal('fetch', serve())
    renderPage()

    expect(await screen.findByRole('link', { name: 'Code block' })).toHaveAccessibleDescription('31 votos, 2 comentários, issue 1')
  })

  it('narrows the board with the search field and counts what is left', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve())
    renderPage()

    await user.type(await screen.findByRole('searchbox', { name: 'Buscar sugestão' }), 'sticky')

    expect(screen.getByText('1 sugestão')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Code block' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sticky columns' })).toBeInTheDocument()
  })

  it('draws the five columns side by side on a wide screen', async () => {
    const width = window.innerWidth

    window.innerWidth = 1600
    vi.stubGlobal('fetch', serve())
    renderPage()

    const lane = await screen.findByRole('region', { name: /Em desenvolvimento/ })

    expect(within(lane).getAllByRole('link')).toHaveLength(2)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5)

    window.innerWidth = width
  })

  it('invites the first suggestion when there is none', async () => {
    vi.stubGlobal('fetch', serve([]))
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Ainda não há sugestões' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Fazer a primeira sugestão/ })).toHaveAttribute('href', suggestUrl)
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Em análise0', 'Backlog0', 'Em desenvolvimento0', 'Lançado0', 'Não vamos fazer0'])
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Buscar sugestão')).not.toBeInTheDocument()
  })

  it('keeps an empty board in tabs on a wide screen, with the invitation where the first card will be', async () => {
    const width = window.innerWidth

    window.innerWidth = 1600
    vi.stubGlobal('fetch', serve([]))
    renderPage()

    const panel = await screen.findByRole('tabpanel', { name: /Em análise/ })

    expect(within(panel).getByRole('heading', { name: 'Ainda não há sugestões' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /Backlog/ })).not.toBeInTheDocument()

    window.innerWidth = width
  })

  it('explains a rate limit and loads again when asked', async () => {
    const user = userEvent.setup()
    const fetcher = vi.fn<(input: RequestInfo | URL) => Promise<Response>>(() => reply({ message: 'rate limit' }, 403))

    vi.stubGlobal('fetch', fetcher)
    renderPage()

    expect((await screen.findByText(/O GitHub limitou as consultas/)).closest('[role="alert"]')).toBeInTheDocument()

    fetcher.mockImplementation(serve())
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('link', { name: 'Code block' })).toBeInTheDocument()
  })

  it('reports a failed request without blaming the rate limit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('offline')))
    )
    renderPage()

    expect((await screen.findByText(/A consulta ao GitHub falhou/)).closest('[role="alert"]')).toBeInTheDocument()
  })

  it('asks GitHub once and reuses the answer for the next visit', async () => {
    const fetcher = serve()

    vi.stubGlobal('fetch', fetcher)

    const first = renderPage()

    await screen.findByRole('link', { name: 'Code block' })
    first.unmount()
    renderPage()
    await screen.findByRole('link', { name: 'Code block' })

    expect(fetcher.mock.calls.filter(([input]) => String(input) === issuesEndpoint)).toHaveLength(1)
  })
})
