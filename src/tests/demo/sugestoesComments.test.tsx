import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'

import { sessionEndpoint, threadEndpoint } from '@demo/pages/sugestoes/account.ts'
import { apiEndpoint } from '@demo/pages/sugestoes/loadSuggestions.ts'
import Sugestoes from '@demo/pages/sugestoes/index.tsx'

import type { Suggestion } from '@demo/pages/sugestoes/types.ts'
import type { Thread } from '@demo/pages/sugestoes/comment.ts'

interface Options {
  signed?: boolean
  session?: () => Promise<Response>
  thread?: () => Promise<Response>
  send?: () => Promise<Response>
}

const card: Suggestion = { id: 1, url: 'https://github.com/thiagopedro99/enchase/issues/1', title: 'Sticky columns', text: 'Keep the first column.', kind: 'melhoria', votes: 4, comments: 2, status: 'analise', createdAt: '2026-11-20T12:00:00Z' }

const thread: Thread = {
  id: 1,
  title: 'Sticky columns',
  url: card.url,
  text: 'Keep the first column in place.\n\nOn small screens too.',
  locked: false,
  total: 2,
  comments: [
    { id: 11, url: `${card.url}#issuecomment-11`, author: 'ana', avatarUrl: '', text: 'I need this too.', createdAt: '2026-11-21T10:00:00Z', maintainer: false },
    { id: 13, url: `${card.url}#issuecomment-13`, author: 'thiagopedro99', avatarUrl: '', text: 'It is on the list.', createdAt: '2026-11-22T10:00:00Z', maintainer: true }
  ]
}

const posted = { id: 501, url: `${card.url}#issuecomment-501`, author: 'visitor', avatarUrl: '', text: 'On tablets too.', createdAt: '2026-11-26T10:00:00Z', maintainer: false }

const reply = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

const serve = ({ signed = true, session, thread: read = () => reply(thread), send = () => reply({ comment: posted }, 201) }: Options = {}) =>
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>((input, init) => {
    const url = String(input)

    if (url === apiEndpoint) return reply({ items: [card] })
    if (url === sessionEndpoint) return session ? session() : signed ? reply({ user: { login: 'visitor', avatarUrl: '' }, voted: [], canMove: false }) : reply({ user: null })
    if (url === threadEndpoint(1)) return init?.method === 'POST' ? send() : read()

    return reply({}, 404)
  })

const sent = (fetcher: ReturnType<typeof serve>) => fetcher.mock.calls.filter(([, init]) => init?.method === 'POST').map(([, init]) => JSON.parse(String(init?.body)))

const renderPage = () => renderWithProviders(<Sugestoes />, { route: '/sugestoes', toasts: true })

const openPanel = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('link', { name: 'Sticky columns' }))

  return screen.findByRole('dialog', { name: 'Sticky columns' })
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.history.replaceState(null, '', '/sugestoes')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Suggestions panel', () => {
  it('keeps the title as a link to GitHub when the site has no API', async () => {
    vi.stubGlobal('fetch', serve({ session: () => reply({}, 404) }))
    renderPage()

    expect(await screen.findByRole('link', { name: 'Sticky columns' })).toHaveAttribute('href', card.url)
  })

  it('opens the suggestion in a panel, with its whole text and its comments, and puts it in the address', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ signed: false }))
    renderPage()
    await screen.findByRole('link', { name: 'Entrar com GitHub' })

    expect(screen.getByRole('link', { name: 'Sticky columns' })).toHaveAttribute('href', '?issue=1')

    const panel = await openPanel(user)

    expect(window.location.search).toBe('?issue=1')
    expect(await within(panel).findByText(/Keep the first column in place\./)).toHaveTextContent('On small screens too.')
    expect(within(panel).getByRole('heading', { name: /Comentários/ })).toHaveTextContent('2')
    expect(within(panel).getAllByRole('listitem').map((item) => item.textContent)).toEqual([expect.stringContaining('@ana'), expect.stringContaining('@thiagopedro99')])
    expect(within(within(panel).getAllByRole('listitem')[1] as HTMLElement).getByText('Mantenedor')).toBeInTheDocument()
    expect(within(within(panel).getAllByRole('listitem')[0] as HTMLElement).queryByText('Mantenedor')).not.toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: /^Ver no GitHub/ })).toHaveAttribute('href', card.url)
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('opens the same panel from the comment count of the card, which is a button and not a part of the card that drags', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ signed: false }))
    renderPage()

    const button = await screen.findByRole('button', { name: 'Ver 2 comentários de Sticky columns' })

    expect(button).toHaveTextContent('2')
    expect(screen.getByRole('link', { name: 'Sticky columns' })).toHaveAttribute('draggable', 'false')

    await user.click(button)

    expect(await screen.findByRole('dialog', { name: 'Sticky columns' })).toBeInTheDocument()
    expect(window.location.search).toBe('?issue=1')
  })

  it('shows the comment count as plain text when the site has no API', async () => {
    vi.stubGlobal('fetch', serve({ session: () => reply({}, 404) }))
    renderPage()
    await screen.findByRole('link', { name: 'Sticky columns' })

    expect(screen.queryByRole('button', { name: /Ver 2 comentários/ })).not.toBeInTheDocument()
  })

  it('asks a visitor to sign in before commenting', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ signed: false }))
    renderPage()
    await screen.findByRole('link', { name: 'Entrar com GitHub' })

    const panel = await openPanel(user)

    expect(await within(panel).findByText('Entre com o GitHub para comentar sem sair do site.')).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: 'Entrar com GitHub' })).toHaveAttribute('href', '/api/auth/login')
    expect(within(panel).queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('posts a comment, shows it at the end of the list and counts it on the card', async () => {
    const user = userEvent.setup()
    const fetcher = serve()

    vi.stubGlobal('fetch', fetcher)
    renderPage()
    await screen.findByText('@visitor')

    const panel = await openPanel(user)
    const field = await within(panel).findByRole('textbox', { name: 'Seu comentário' })

    await user.type(field, '  On tablets too.  ')
    await user.click(within(panel).getByRole('button', { name: 'Comentar' }))

    await waitFor(() => expect(within(panel).getAllByRole('listitem')).toHaveLength(3))
    expect(within(panel).getAllByRole('listitem')[2]).toHaveTextContent('On tablets too.')
    expect(within(panel).getByRole('heading', { name: /Comentários/ })).toHaveTextContent('3')
    expect(field).toHaveValue('')
    expect(sent(fetcher)).toEqual([{ text: 'On tablets too.' }])
    expect(screen.getByRole('link', { name: 'Sticky columns', hidden: true })).toHaveAccessibleDescription('4 votos, 3 comentários, issue 1')
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('sends nothing when the comment is empty', async () => {
    const user = userEvent.setup()
    const fetcher = serve()

    vi.stubGlobal('fetch', fetcher)
    renderPage()
    await screen.findByText('@visitor')

    const panel = await openPanel(user)

    await user.click(await within(panel).findByRole('button', { name: 'Comentar' }))

    expect(within(panel).getByText('Escreva de 2 a 2000 caracteres.')).toBeInTheDocument()
    expect(sent(fetcher)).toEqual([])
  })

  it.each([
    ['the visitor comments too fast', () => reply({ error: 'too many requests' }, 429), 'Muitos comentários em pouco tempo. Espere um minuto e tente de novo.'],
    ['the visitor reached the limit of the day', () => reply({ error: 'daily limit', limit: 30 }, 429), 'Você já enviou 30 comentários nas últimas 24 horas. Tente de novo mais tarde.'],
    ['the issue was locked meanwhile', () => reply({ error: 'locked' }, 409), 'Os comentários desta sugestão foram fechados no GitHub.'],
    ['the API fails', () => reply({ error: 'unavailable' }, 502), 'Não foi possível enviar o comentário. Tente de novo.'],
    ['the request fails', () => Promise.reject(new Error('offline')), 'Não foi possível enviar o comentário. Tente de novo.']
  ])('keeps what was written and says why when %s', async (_name, send, message) => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ send }))
    renderPage()
    await screen.findByText('@visitor')

    const panel = await openPanel(user)
    const field = await within(panel).findByRole('textbox', { name: 'Seu comentário' })

    await user.type(field, 'On tablets too.')
    await user.click(within(panel).getByRole('button', { name: 'Comentar' }))

    expect(await within(panel).findByText(message)).toBeInTheDocument()
    expect(field).toHaveValue('On tablets too.')
    expect(within(panel).getAllByRole('listitem')).toHaveLength(2)
  })

  it('offers the login again when the session ended', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ send: () => reply({ error: 'signed out' }, 401) }))
    renderPage()
    await screen.findByText('@visitor')

    const panel = await openPanel(user)

    await user.type(await within(panel).findByRole('textbox', { name: 'Seu comentário' }), 'On tablets too.')
    await user.click(within(panel).getByRole('button', { name: 'Comentar' }))

    expect(await within(panel).findByText(/Sua sessão terminou/)).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: 'Entrar com GitHub' })).toBeInTheDocument()
  })

  it('shows no form on a suggestion whose comments were closed', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ thread: () => reply({ ...thread, locked: true }) }))
    renderPage()
    await screen.findByText('@visitor')

    const panel = await openPanel(user)

    expect(await within(panel).findByText('Os comentários desta sugestão foram fechados no GitHub.')).toBeInTheDocument()
    expect(within(panel).queryByRole('textbox')).not.toBeInTheDocument()
  })

  it.each([
    ['is not on the board', () => reply({ error: 'not found' }, 404), 'Esta sugestão não está no quadro'],
    ['cannot be loaded', () => reply({ error: 'unavailable' }, 502), 'Não foi possível carregar os comentários']
  ])('says so when the suggestion %s', async (_name, read, message) => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ thread: read }))
    renderPage()
    await screen.findByText('@visitor')

    expect(await within(await openPanel(user)).findByText(message)).toBeInTheDocument()
  })

  it('opens the suggestion of the address by itself, and closes it with the panel and with the back button', async () => {
    const user = userEvent.setup()

    window.history.replaceState(null, '', '/sugestoes?issue=1')
    vi.stubGlobal('fetch', serve())
    renderPage()

    const panel = await screen.findByRole('dialog', { name: 'Sticky columns' })

    await user.click(within(panel).getByRole('button', { name: /Fechar/ }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    expect(window.location.search).toBe('')

    await openPanel(user)
    act(() => {
      window.history.replaceState(null, '', '/sugestoes')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
