import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'

import { loginUrl, logoutEndpoint, sessionEndpoint, voteEndpoint } from '@demo/pages/sugestoes/account.ts'
import { apiEndpoint } from '@demo/pages/sugestoes/loadSuggestions.ts'
import Sugestoes from '@demo/pages/sugestoes/index.tsx'

import type { Suggestion } from '@demo/pages/sugestoes/types.ts'

interface Options {
  session?: () => Promise<Response>
  vote?: () => Promise<Response>
  logout?: () => Promise<Response>
}

const suggestion = (id: number, title: string, status: Suggestion['status'], votes: number, extra: Partial<Suggestion> = {}): Suggestion => ({
  id,
  url: `https://github.com/thiagopedro99/enchase/issues/${id}`,
  title,
  text: `Text of ${title}.`,
  kind: 'melhoria',
  votes,
  comments: 2,
  status,
  createdAt: '2026-11-20T12:00:00Z',
  ...extra
})

const items = [suggestion(1, 'Code block', 'analise', 31), suggestion(2, 'Sticky columns', 'analise', 1), suggestion(3, 'Class wins', 'lancado', 5, { version: '0.23.0' }), suggestion(4, 'React 18', 'recusado', 2, { reason: 'React 19 only.' })]

const reply = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

const page = () => Promise.resolve(new Response('<!doctype html>', { status: 200, headers: { 'Content-Type': 'text/html' } }))

const anonymous = () => reply({ user: null })

const signed = (voted: number[] = [2]) => () => reply({ user: { login: 'visitor', avatarUrl: 'https://avatars.githubusercontent.com/u/9001?v=4' }, voted })

const serve = ({ session = anonymous, vote = () => reply({ voted: true }), logout = () => reply({ user: null }) }: Options = {}) =>
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>((input) => {
    const url = String(input)

    if (url === apiEndpoint) return reply({ items })
    if (url === sessionEndpoint) return session()
    if (url === logoutEndpoint) return logout()
    if (/\/vote$/.test(url)) return vote()

    return reply({}, 404)
  })

const votesSent = (fetcher: ReturnType<typeof serve>) => fetcher.mock.calls.filter(([input]) => /\/vote$/.test(String(input))).map(([input, init]) => `${init?.method} ${String(input)}`)

const renderPage = () => renderWithProviders(<Sugestoes />, { route: '/sugestoes', toasts: true })

const voteButton = (name: RegExp) => screen.findByRole('button', { name })

beforeEach(() => {
  window.sessionStorage.clear()
  window.history.replaceState(null, '', '/sugestoes')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Suggestions account', () => {
  it.each([
    ['is not there and the site answers its page', page],
    ['answers an error', () => reply({ error: 'not found' }, 404)],
    ['answers something that is not a session', () => reply({ items: [] })],
    ['fails', () => Promise.reject(new Error('offline'))]
  ])('keeps the board as it was, with no login and no vote button, when the session API %s', async (_name, session) => {
    vi.stubGlobal('fetch', serve({ session }))
    renderPage()

    expect(await screen.findByRole('link', { name: 'Code block' })).toBeInTheDocument()
    await waitFor(() => expect(vi.mocked(fetch).mock.calls.map(([input]) => String(input))).toContain(sessionEndpoint))
    expect(screen.queryByRole('link', { name: 'Entrar com GitHub' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Votar em/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Code block' })).toHaveAccessibleDescription('31 votos, 2 comentários, issue 1')
  })

  it('invites a visitor to sign in with a real link to the login of the API', async () => {
    const { navigate } = (vi.stubGlobal('fetch', serve()), renderPage())
    const link = await screen.findByRole('link', { name: 'Entrar com GitHub' })

    expect(link).toHaveAttribute('href', loginUrl)
    expect(link.closest('[data-slot="navbar"]')).toBeInTheDocument()

    link.addEventListener('click', (event) => event.preventDefault())
    await userEvent.setup().click(link)

    expect(navigate).not.toHaveBeenCalled()
  })

  it('puts the account in the top bar of the site and leaves the page header with the title only', async () => {
    vi.stubGlobal('fetch', serve({ session: signed() }))
    renderPage()

    const bar = (await screen.findByText('@visitor')).closest('[data-slot="navbar"]')
    const header = screen.getByRole('heading', { level: 1 }).closest('header')

    expect(bar).toContainElement(screen.getByRole('button', { name: 'Sair' }))
    expect(within(header as HTMLElement).queryByRole('button')).not.toBeInTheDocument()
    expect(within(header as HTMLElement).queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sugerir' }).parentElement).toContainElement(screen.getByLabelText('Buscar sugestão'))
  })

  it('explains the login in a dialog when a visitor who is not signed in votes, and sends no vote', async () => {
    const user = userEvent.setup()
    const fetcher = serve()

    vi.stubGlobal('fetch', fetcher)
    renderPage()

    const button = await voteButton(/^Votar em Code block, 31 votos$/)

    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    expect(button).not.toHaveAttribute('aria-pressed')

    await user.click(button)

    const dialog = await screen.findByRole('dialog', { name: 'Entre para votar' })

    expect(within(dialog).getByRole('link', { name: 'Entrar com GitHub' })).toHaveAttribute('href', loginUrl)
    expect(within(dialog).getByRole('link', { name: /Abrir a issue #1/ })).toHaveAttribute('href', 'https://github.com/thiagopedro99/enchase/issues/1')
    expect(within(dialog).getByText(/guarda a sua sessão por até 8 horas/)).toBeInTheDocument()
    expect(await axe(document.body)).toHaveNoViolations()

    await user.click(within(dialog).getByRole('button', { name: 'Agora não' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(votesSent(fetcher)).toEqual([])
    expect(button).toHaveFocus()
  })

  it('says who is signed in and marks the suggestions that the visitor voted for', async () => {
    vi.stubGlobal('fetch', serve({ session: signed() }))
    renderPage()

    expect(await screen.findByText('@visitor')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Entrar com GitHub' })).not.toBeInTheDocument()
    expect(await voteButton(/^Votar em Code block, 31 votos$/)).toHaveAttribute('aria-pressed', 'false')
    expect(await voteButton(/^Tirar o voto de Sticky columns, 1 voto$/)).toHaveAttribute('aria-pressed', 'true')
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('offers no vote on what was released or declined', async () => {
    vi.stubGlobal('fetch', serve({ session: signed() }))
    renderPage()
    await screen.findByText('@visitor')

    expect(await screen.findByRole('link', { name: 'Class wins' })).toHaveAccessibleDescription('5 votos, 2 comentários, issue 3')
    expect(screen.queryByRole('button', { name: /Class wins/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'React 18' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /React 18/ })).not.toBeInTheDocument()
  })

  it('votes and takes the vote back, counting at once', async () => {
    const user = userEvent.setup()
    const fetcher = serve({ session: signed() })

    vi.stubGlobal('fetch', fetcher)
    renderPage()
    await user.click(await voteButton(/^Votar em Code block, 31 votos$/))

    const voted = await voteButton(/^Tirar o voto de Code block, 32 votos$/)

    expect(voted).toHaveAttribute('aria-pressed', 'true')
    expect(voted).toHaveTextContent('32')
    expect(voted).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Code block' })).toHaveAccessibleDescription('32 votos, 2 comentários, issue 1')
    await waitFor(() => expect(voted).not.toHaveAttribute('aria-busy'))

    await user.click(voted)

    expect(await voteButton(/^Votar em Code block, 31 votos$/)).toHaveAttribute('aria-pressed', 'false')
    await waitFor(() => expect(votesSent(fetcher)).toEqual([`PUT ${voteEndpoint(1)}`, `DELETE ${voteEndpoint(1)}`]))
  })

  it('sends one request when the button is pressed twice in a row', async () => {
    const user = userEvent.setup()
    const pending: ((response: Response) => void)[] = []
    const fetcher = serve({ session: signed(), vote: () => new Promise((resolve) => pending.push(resolve)) })

    vi.stubGlobal('fetch', fetcher)
    renderPage()

    const button = await voteButton(/^Votar em Code block/)

    await user.click(button)
    await user.click(await voteButton(/Code block/))

    expect(votesSent(fetcher)).toEqual([`PUT ${voteEndpoint(1)}`])
    expect(await voteButton(/^Tirar o voto de Code block, 32 votos$/)).toHaveAttribute('aria-busy', 'true')

    pending.forEach((resolve) => resolve(new Response('{"voted":true}', { status: 200 })))

    await waitFor(() => expect(screen.getByRole('button', { name: /Code block/ })).not.toHaveAttribute('aria-busy'))
  })

  it.each([
    ['the API fails', () => reply({ error: 'unavailable' }, 502), 'Não foi possível registrar o voto. Tente de novo.'],
    ['the request fails', () => Promise.reject(new Error('offline')), 'Não foi possível registrar o voto. Tente de novo.'],
    ['the visitor votes too fast', () => reply({ error: 'too many requests' }, 429), 'Muitos votos em pouco tempo. Espere um minuto e tente de novo.']
  ])('takes the vote back and says why when %s', async (_name, vote, message) => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ session: signed(), vote }))
    renderPage()
    await user.click(await voteButton(/^Votar em Code block, 31 votos$/))

    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(await voteButton(/^Votar em Code block, 31 votos$/)).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('@visitor')).toBeInTheDocument()
  })

  it('takes the vote back and offers the login again when the session ended', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ session: signed(), vote: () => reply({ error: 'signed out' }, 401) }))
    renderPage()
    await user.click(await voteButton(/^Votar em Code block, 31 votos$/))

    expect(await screen.findByText('Sua sessão terminou. Entre de novo para votar.')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Entrar com GitHub' })).toBeInTheDocument()
    expect(await voteButton(/^Votar em Code block, 31 votos$/)).toHaveAttribute('aria-haspopup', 'dialog')
    expect(screen.queryByText('@visitor')).not.toBeInTheDocument()
  })

  it('keeps the new count for the next visit of the tab', async () => {
    const user = userEvent.setup()
    const voted = [2]
    const fetcher = serve({ session: () => signed(voted)(), vote: () => reply({ voted: true }).finally(() => voted.push(1)) })

    vi.stubGlobal('fetch', fetcher)

    const first = renderPage()

    await user.click(await voteButton(/^Votar em Code block, 31 votos$/))
    await waitFor(() => expect(screen.getByRole('button', { name: /Code block/ })).not.toHaveAttribute('aria-busy'))
    first.unmount()
    renderPage()

    expect(await voteButton(/^Tirar o voto de Code block, 32 votos$/)).toHaveAttribute('aria-pressed', 'true')
    expect(fetcher.mock.calls.filter(([input]) => String(input) === apiEndpoint)).toHaveLength(1)
  })

  it('signs out', async () => {
    const user = userEvent.setup()
    const fetcher = serve({ session: signed() })

    vi.stubGlobal('fetch', fetcher)
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Sair' }))

    expect(await screen.findByRole('link', { name: 'Entrar com GitHub' })).toBeInTheDocument()
    expect(screen.queryByText('@visitor')).not.toBeInTheDocument()
    expect(fetcher.mock.calls.find(([input]) => String(input) === logoutEndpoint)?.[1]?.method).toBe('POST')
    expect(await voteButton(/^Votar em Sticky columns, 1 voto$/)).not.toHaveAttribute('aria-pressed')
  })

  it('stays signed in and says so when the logout fails', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ session: signed(), logout: () => reply({ error: 'unavailable' }, 502) }))
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Sair' }))

    expect(await screen.findByText('Não foi possível sair. Tente de novo.')).toBeInTheDocument()
    expect(screen.getByText('@visitor')).toBeInTheDocument()
  })

  it('says that the login failed and cleans the address', async () => {
    window.history.replaceState(null, '', '/sugestoes?login=failed')
    vi.stubGlobal('fetch', serve())
    renderPage()

    expect(await screen.findByText('Não foi possível entrar com o GitHub')).toBeInTheDocument()
    expect(`${window.location.pathname}${window.location.search}`).toBe('/sugestoes')
  })

  it('says nothing about the login on a normal visit', async () => {
    vi.stubGlobal('fetch', serve())
    renderPage()
    await screen.findByRole('link', { name: 'Entrar com GitHub' })

    expect(screen.queryByText('Não foi possível entrar com o GitHub')).not.toBeInTheDocument()
  })
})
