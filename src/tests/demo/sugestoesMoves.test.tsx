import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'

import { sessionEndpoint, statusEndpoint } from '@demo/pages/sugestoes/account.ts'
import { apiEndpoint } from '@demo/pages/sugestoes/loadSuggestions.ts'
import Sugestoes from '@demo/pages/sugestoes/index.tsx'

import type { Suggestion } from '@demo/pages/sugestoes/types.ts'

interface Options {
  canMove?: boolean
  signed?: boolean
  move?: (body: { status: Suggestion['status']; version?: string; reason?: string }) => Promise<Response>
}

const suggestion = (id: number, title: string, status: Suggestion['status'], extra: Partial<Suggestion> = {}): Suggestion => ({ id, url: `https://github.com/thiagopedro99/enchase/issues/${id}`, title, text: `Text of ${title}.`, kind: 'melhoria', votes: id, comments: 0, status, createdAt: '2026-11-20T12:00:00Z', ...extra })

const board = [suggestion(1, 'Code block', 'analise'), suggestion(2, 'Sticky columns', 'backlog')]

const reply = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

const moved = (body: { status: Suggestion['status']; version?: string; reason?: string }) => reply({ suggestion: { ...board[0], status: body.status, ...(body.version ? { version: body.version } : {}), ...(body.reason ? { reason: body.reason } : {}) } })

const serve = ({ canMove = true, signed = true, move = moved }: Options = {}) =>
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>((input, init) => {
    const url = String(input)

    if (url === apiEndpoint) return reply({ items: board })
    if (url === sessionEndpoint) return signed ? reply({ user: { login: 'visitor', avatarUrl: '' }, voted: [], canMove }) : reply({ user: null })
    if (url === statusEndpoint(1)) return move(JSON.parse(String(init?.body)))

    return reply({}, 404)
  })

const sent = (fetcher: ReturnType<typeof serve>) => fetcher.mock.calls.filter(([input]) => String(input) === statusEndpoint(1)).map(([, init]) => ({ method: init?.method, body: JSON.parse(String(init?.body)) }))

const renderPage = () => renderWithProviders(<Sugestoes />, { route: '/sugestoes', toasts: true })

const column = (name: RegExp) => screen.getByRole('region', { name })

const moveTo = async (user: ReturnType<typeof userEvent.setup>, target: RegExp) => {
  await user.click(await screen.findByRole('button', { name: 'Mover Code block para' }))
  await user.click(await screen.findByRole('menuitem', { name: target }))
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.history.replaceState(null, '', '/sugestoes')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Suggestions moves', () => {
  it.each([
    ['a visitor who is not signed in', { signed: false }],
    ['a visitor who is signed in and may not move', { canMove: false }]
  ])('shows the board with no handle and no menu to %s', async (_name, options) => {
    vi.stubGlobal('fetch', serve(options))
    renderPage()
    await screen.findByRole('link', { name: 'Code block' })
    await waitFor(() => expect(vi.mocked(fetch).mock.calls.map(([input]) => String(input))).toContain(sessionEndpoint))

    expect(screen.queryByRole('button', { name: /^Mover / })).not.toBeInTheDocument()
  })

  it('gives a maintainer a handle and a menu on each card, with no axe violations', async () => {
    vi.stubGlobal('fetch', serve())
    renderPage()

    expect(await screen.findByRole('button', { name: 'Mover Code block para' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mover Code block' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mover Sticky columns para' })).toBeInTheDocument()
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('moves a card to another column at once and tells the API', async () => {
    const user = userEvent.setup()
    const fetcher = serve()

    vi.stubGlobal('fetch', fetcher)
    renderPage()
    await moveTo(user, /Backlog/)

    await waitFor(() => expect(within(column(/Backlog/)).getByRole('link', { name: 'Code block' })).toBeInTheDocument())
    expect(within(column(/Em análise/)).queryByRole('link', { name: 'Code block' })).not.toBeInTheDocument()
    await waitFor(() => expect(sent(fetcher)).toEqual([{ method: 'PUT', body: { status: 'backlog' } }]))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('asks the version before it releases a card, and sends nothing until the version is right', async () => {
    const user = userEvent.setup()
    const fetcher = serve()

    vi.stubGlobal('fetch', fetcher)
    renderPage()
    await moveTo(user, /Lançado/)

    const dialog = await screen.findByRole('dialog', { name: 'Em qual versão saiu?' })

    expect(within(dialog).getByText('Code block')).toBeInTheDocument()
    expect(within(column(/Em análise/)).getByRole('link', { name: 'Code block' })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Mover para Lançado' }))

    expect(within(dialog).getByText('Preencha este campo.')).toBeInTheDocument()

    await user.type(within(dialog).getByRole('textbox', { name: /Versão/ }), 'next')
    await user.click(within(dialog).getByRole('button', { name: 'Mover para Lançado' }))

    expect(within(dialog).getByText('Use o número da versão, como 0.27.0.')).toBeInTheDocument()
    expect(sent(fetcher)).toEqual([])

    await user.clear(within(dialog).getByRole('textbox', { name: /Versão/ }))
    await user.type(within(dialog).getByRole('textbox', { name: /Versão/ }), 'v0.28.0')
    await user.click(within(dialog).getByRole('button', { name: 'Mover para Lançado' }))

    await waitFor(() => expect(within(column(/Lançado/)).getByText('Lançado na 0.28.0')).toBeInTheDocument())
    expect(sent(fetcher)).toEqual([{ method: 'PUT', body: { status: 'lancado', version: '0.28.0', reason: '' } }])
  })

  it('asks the reason before it declines a card and shows it on the card', async () => {
    const user = userEvent.setup()
    const fetcher = serve()

    vi.stubGlobal('fetch', fetcher)
    renderPage()
    await moveTo(user, /Não vamos fazer/)

    const dialog = await screen.findByRole('dialog', { name: 'Por que não vamos fazer?' })

    await user.type(within(dialog).getByRole('textbox', { name: /Motivo/ }), 'Curto')
    await user.click(within(dialog).getByRole('button', { name: 'Mover para Não vamos fazer' }))

    expect(within(dialog).getByText('Escreva pelo menos 10 caracteres.')).toBeInTheDocument()
    expect(await axe(document.body)).toHaveNoViolations()

    await user.type(within(dialog).getByRole('textbox', { name: /Motivo/ }), ' demais para servir.')
    await user.click(within(dialog).getByRole('button', { name: 'Mover para Não vamos fazer' }))

    await waitFor(() => expect(within(column(/Não vamos fazer/)).getByText('Curto demais para servir.')).toBeInTheDocument())
    expect(sent(fetcher)).toEqual([{ method: 'PUT', body: { status: 'recusado', version: '', reason: 'Curto demais para servir.' } }])
  })

  it('leaves the card where it was when the dialog is cancelled', async () => {
    const user = userEvent.setup()
    const fetcher = serve()

    vi.stubGlobal('fetch', fetcher)
    renderPage()
    await moveTo(user, /Lançado/)
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(within(column(/Em análise/)).getByRole('link', { name: 'Code block' })).toBeInTheDocument()
    expect(sent(fetcher)).toEqual([])
  })

  it.each([
    ['the API fails', () => reply({ error: 'unavailable' }, 502), 'Não foi possível mover o cartão. Ele voltou para a coluna de origem.'],
    ['the request fails', () => Promise.reject(new Error('offline')), 'Não foi possível mover o cartão. Ele voltou para a coluna de origem.'],
    ['the API says that the visitor may not move', () => reply({ error: 'forbidden' }, 403), 'Você não tem permissão para mover os cartões.'],
    ['the maintainer moves too fast', () => reply({ error: 'too many requests' }, 429), 'Muitos movimentos em pouco tempo. Espere um minuto e tente de novo.']
  ])('puts the card back and says why when %s', async (_name, move, message) => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ move }))
    renderPage()
    await moveTo(user, /Backlog/)

    expect(await screen.findByText(message)).toBeInTheDocument()
    await waitFor(() => expect(within(column(/Em análise/)).getByRole('link', { name: 'Code block' })).toBeInTheDocument())
    expect(within(column(/Backlog/)).queryByRole('link', { name: 'Code block' })).not.toBeInTheDocument()
  })

  it('puts the card back and takes the controls away when the session ended', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ move: () => reply({ error: 'signed out' }, 401) }))
    renderPage()
    await moveTo(user, /Backlog/)

    expect(await screen.findByText('Sua sessão terminou. Entre de novo para mover os cartões.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('button', { name: /^Mover / })).not.toBeInTheDocument())
    expect(within(column(/Em análise/)).getByRole('link', { name: 'Code block' })).toBeInTheDocument()
  })

  it('does nothing when the card is sent to the column where it already is', async () => {
    const user = userEvent.setup()
    const fetcher = serve()

    vi.stubGlobal('fetch', fetcher)
    renderPage()
    await moveTo(user, /Em análise/)

    expect(within(column(/Em análise/)).getByRole('link', { name: 'Code block' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(sent(fetcher)).toEqual([])
  })
})
