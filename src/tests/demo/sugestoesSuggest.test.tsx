import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'

import { draftKey, intentKey } from '@demo/pages/sugestoes/defaultData.ts'
import { apiEndpoint } from '@demo/pages/sugestoes/loadSuggestions.ts'
import { sessionEndpoint } from '@demo/pages/sugestoes/account.ts'
import Sugestoes from '@demo/pages/sugestoes/index.tsx'
import { suggestUrl } from '@demo/defaultData.ts'

import type { Suggestion } from '@demo/pages/sugestoes/types.ts'

interface Options {
  items?: Suggestion[]
  session?: () => Promise<Response>
  send?: () => Promise<Response>
}

const suggestion = (id: number, title: string, votes: number, extra: Partial<Suggestion> = {}): Suggestion => ({ id, url: `https://github.com/thiagopedro99/enchase/issues/${id}`, title, text: `Text of ${title}.`, kind: 'melhoria', votes, comments: 0, status: 'analise', createdAt: '2026-11-20T12:00:00Z', ...extra })

const board = [suggestion(1, 'Colunas fixas na tabela', 12, { area: 'Table' }), suggestion(2, 'Bloco de código', 31), suggestion(3, 'Tabela antiga', 50, { status: 'lancado' })]

const created = suggestion(41, 'Ordenar a tabela pelo teclado', 0, { text: 'Preciso ordenar as colunas sem usar o mouse.' })

const reply = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

const anonymous = () => reply({ user: null })

const signed = () => reply({ user: { login: 'visitor', avatarUrl: '' }, voted: [] })

const serve = ({ items = board, session = signed, send = () => reply({ suggestion: created, listed: true }, 201) }: Options = {}) =>
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>((input, init) => {
    const url = String(input)

    if (url === apiEndpoint) return init?.method === 'POST' ? send() : reply({ items })
    if (url === sessionEndpoint) return session()

    return reply({}, 404)
  })

const sent = (fetcher: ReturnType<typeof serve>) => fetcher.mock.calls.filter(([, init]) => init?.method === 'POST').map(([, init]) => JSON.parse(String(init?.body)))

const renderPage = () => renderWithProviders(<Sugestoes />, { route: '/sugestoes', toasts: true })

const open = async (user: ReturnType<typeof userEvent.setup>) => {
  await screen.findByText('@visitor')
  await user.click(screen.getByRole('button', { name: 'Sugerir' }))

  return screen.findByRole('dialog', { name: 'Sugerir' })
}

const fill = async (user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement, title = 'Ordenar a tabela pelo teclado', need = 'Preciso ordenar as colunas sem usar o mouse.') => {
  await user.click(within(dialog).getByRole('textbox', { name: /Título/ }))
  await user.paste(title)
  await user.click(within(dialog).getByRole('textbox', { name: /O que você precisa/ }))
  await user.paste(need)
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.history.replaceState(null, '', '/sugestoes')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Suggestions form', () => {
  it('keeps the link to GitHub when the site has no API', async () => {
    vi.stubGlobal('fetch', serve({ session: () => reply({}, 404) }))
    renderPage()
    await screen.findByRole('link', { name: 'Bloco de código' })

    expect(screen.getByRole('link', { name: /^Sugerir no GitHub/ })).toHaveAttribute('href', suggestUrl)
    expect(screen.queryByRole('button', { name: 'Sugerir' })).not.toBeInTheDocument()
  })

  it('asks a visitor to sign in before suggesting, and remembers what the visitor wanted', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ session: anonymous }))
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Sugerir' }))

    const dialog = await screen.findByRole('dialog', { name: 'Entre para sugerir' })
    const link = within(dialog).getByRole('link', { name: 'Entrar com GitHub' })

    expect(within(dialog).getByText(/vira uma issue pública no GitHub/)).toBeInTheDocument()
    expect(within(dialog).queryByRole('link', { name: /Abrir a issue/ })).not.toBeInTheDocument()

    link.addEventListener('click', (event) => event.preventDefault())
    await user.click(link)

    expect(window.sessionStorage.getItem(intentKey)).toBe('1')
  })

  it('opens the form by itself when the visitor comes back from the login, once', async () => {
    window.sessionStorage.setItem(intentKey, '1')
    vi.stubGlobal('fetch', serve())

    const first = renderPage()

    expect(await screen.findByRole('dialog', { name: 'Sugerir' })).toBeInTheDocument()
    expect(window.sessionStorage.getItem(intentKey)).toBeNull()

    first.unmount()
    renderPage()
    await screen.findByText('@visitor')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not open the form for a visitor who came back without signing in', async () => {
    window.sessionStorage.setItem(intentKey, '1')
    vi.stubGlobal('fetch', serve({ session: anonymous }))
    renderPage()
    await screen.findByRole('link', { name: 'Entrar com GitHub' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows a short form with no axe violations', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve())
    renderPage()

    const dialog = await open(user)

    expect(within(dialog).getByRole('radio', { name: 'Melhoria' })).toBeChecked()
    expect(within(dialog).getByRole('textbox', { name: /Título/ })).toBeRequired()
    expect(within(dialog).getByRole('textbox', { name: /O que você precisa, e o que faz hoje no lugar/ })).toBeRequired()
    expect(within(dialog).getByRole('textbox', { name: /Como você imagina \(opcional\)/ })).not.toBeRequired()
    expect(within(dialog).getByText(/até 3 por dia/)).toBeInTheDocument()
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('asks about a bug in other words', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve())
    renderPage()

    const dialog = await open(user)

    await user.click(within(dialog).getByRole('radio', { name: 'Correção' }))

    expect(within(dialog).getByRole('textbox', { name: /O que aconteceu, e o que você esperava/ })).toBeInTheDocument()
    expect(within(dialog).getByRole('textbox', { name: /Como reproduzir \(opcional\)/ })).toBeInTheDocument()
  })

  it('says what is missing, focuses the first field with a problem and sends nothing', async () => {
    const user = userEvent.setup()
    const fetcher = serve()

    vi.stubGlobal('fetch', fetcher)
    renderPage()

    const dialog = await open(user)

    await user.click(within(dialog).getByRole('textbox', { name: /O que você precisa/ }))
    await user.paste('Curto.')
    await user.click(within(dialog).getByRole('button', { name: 'Enviar sugestão' }))

    const title = within(dialog).getByRole('textbox', { name: /Título/ })

    expect(title).toHaveFocus()
    expect(title).toBeInvalid()
    expect(title).toHaveAccessibleDescription(expect.stringContaining('Preencha este campo.'))
    expect(within(dialog).getByText('Escreva pelo menos 20 caracteres.')).toBeInTheDocument()
    expect(sent(fetcher)).toEqual([])

    await user.paste('Ordenar a tabela')

    expect(title).toBeValid()
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('points at what already exists while the title is typed, leaving out what is done', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve())
    renderPage()

    const dialog = await open(user)

    await user.click(within(dialog).getByRole('textbox', { name: /Título/ }))
    await user.paste('Fixar colunas da tabéla')

    expect(within(dialog).getByText(/Já existe algo parecido/)).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: /Colunas fixas na tabela/ })).toHaveAttribute('href', 'https://github.com/thiagopedro99/enchase/issues/1')
    expect(within(dialog).queryByRole('link', { name: /Tabela antiga/ })).not.toBeInTheDocument()
    expect(within(dialog).queryByRole('link', { name: /Bloco de código/ })).not.toBeInTheDocument()
  })

  it('sends the suggestion, closes the form and shows the new card on the board', async () => {
    const user = userEvent.setup()
    const fetcher = serve()

    vi.stubGlobal('fetch', fetcher)
    renderPage()

    const dialog = await open(user)

    await fill(user, dialog)
    await user.click(within(dialog).getByRole('button', { name: 'Enviar sugestão' }))

    expect(await screen.findByText('Sugestão enviada. Ela já está em Em análise.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('link', { name: 'Ordenar a tabela pelo teclado' })).toHaveAttribute('href', '?issue=41')
    expect(screen.getByText('4 sugestões')).toBeInTheDocument()
    expect(sent(fetcher)).toEqual([{ kind: 'melhoria', title: 'Ordenar a tabela pelo teclado', need: 'Preciso ordenar as colunas sem usar o mouse.', proposal: '' }])
    expect(fetcher.mock.calls.find(([, init]) => init?.method === 'POST')?.[1]?.headers).toMatchObject({ 'Content-Type': 'application/json' })
    expect(window.sessionStorage.getItem(draftKey)).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Sugerir' }))

    expect(within(await screen.findByRole('dialog', { name: 'Sugerir' })).getByRole('textbox', { name: /Título/ })).toHaveValue('')
  })

  it('keeps the new card for the next visit of the tab', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve())

    const first = renderPage()
    const dialog = await open(user)

    await fill(user, dialog)
    await user.click(within(dialog).getByRole('button', { name: 'Enviar sugestão' }))
    await screen.findByRole('link', { name: 'Ordenar a tabela pelo teclado' })
    first.unmount()
    renderPage()

    expect(await screen.findByRole('link', { name: 'Ordenar a tabela pelo teclado' })).toBeInTheDocument()
  })

  it('says that the card waits for a review when the app could not put it on the board', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ send: () => reply({ suggestion: created, listed: false }, 201) }))
    renderPage()

    const dialog = await open(user)

    await fill(user, dialog)
    await user.click(within(dialog).getByRole('button', { name: 'Enviar sugestão' }))

    expect(await screen.findByText('Sugestão enviada. Ela aparece para todos no quadro assim que for revisada.')).toBeInTheDocument()
  })

  it.each([
    ['the visitor reached the limit of the day', () => reply({ error: 'daily limit', limit: 3 }, 429), 'Você já enviou 3 sugestões nas últimas 24 horas. Tente de novo mais tarde.'],
    ['the visitor sends too fast', () => reply({ error: 'too many requests' }, 429), 'Muitos envios em pouco tempo. Espere um minuto e tente de novo.'],
    ['the API fails', () => reply({ error: 'unavailable' }, 502), 'Não foi possível enviar a sugestão. Tente de novo.'],
    ['the request fails', () => Promise.reject(new Error('offline')), 'Não foi possível enviar a sugestão. Tente de novo.']
  ])('keeps the form open with what was written and says why when %s', async (_name, send, message) => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ send }))
    renderPage()

    const dialog = await open(user)

    await fill(user, dialog)
    await user.click(within(dialog).getByRole('button', { name: 'Enviar sugestão' }))

    expect(await within(dialog).findByText(message)).toBeInTheDocument()
    expect(within(dialog).getByText('A sugestão não foi enviada').closest('[role="alert"]')).toBeInTheDocument()
    expect(within(dialog).getByRole('textbox', { name: /Título/ })).toHaveValue('Ordenar a tabela pelo teclado')
    expect(screen.queryByRole('link', { name: 'Ordenar a tabela pelo teclado' })).not.toBeInTheDocument()
  })

  it('offers the login again, with the text kept, when the session ended', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ send: () => reply({ error: 'signed out' }, 401) }))
    renderPage()

    const dialog = await open(user)

    await fill(user, dialog)
    await user.click(within(dialog).getByRole('button', { name: 'Enviar sugestão' }))

    expect(await within(dialog).findByText(/Sua sessão terminou/)).toBeInTheDocument()

    const link = within(dialog).getByRole('link', { name: 'Entrar com GitHub' })

    link.addEventListener('click', (event) => event.preventDefault())
    await user.click(link)

    expect(window.sessionStorage.getItem(intentKey)).toBe('1')
    expect(JSON.parse(window.sessionStorage.getItem(draftKey) ?? '{}')).toMatchObject({ title: 'Ordenar a tabela pelo teclado' })
    expect(screen.queryByText('@visitor')).not.toBeInTheDocument()
  })

  it('shows on the field what the API refused', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ send: () => reply({ error: 'invalid', problems: { need: 'long' } }, 422) }))
    renderPage()

    const dialog = await open(user)

    await fill(user, dialog)
    await user.click(within(dialog).getByRole('button', { name: 'Enviar sugestão' }))

    expect(await within(dialog).findByText('Use no máximo 3000 caracteres.')).toBeInTheDocument()
    expect(within(dialog).getByRole('textbox', { name: /O que você precisa/ })).toHaveFocus()
  })

  it('keeps what was written when the form is closed, and after the page is loaded again', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve())

    const first = renderPage()
    const dialog = await open(user)

    await fill(user, dialog)
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Sugerir' }))

    expect(within(await screen.findByRole('dialog', { name: 'Sugerir' })).getByRole('textbox', { name: /Título/ })).toHaveValue('Ordenar a tabela pelo teclado')

    first.unmount()
    renderPage()

    expect(within(await open(user)).getByRole('textbox', { name: /O que você precisa/ })).toHaveValue('Preciso ordenar as colunas sem usar o mouse.')
  })

  it('sends once when the button is pressed twice', async () => {
    const user = userEvent.setup()
    const pending: ((response: Response) => void)[] = []
    const fetcher = serve({ send: () => new Promise((resolve) => pending.push(resolve)) })

    vi.stubGlobal('fetch', fetcher)
    renderPage()

    const dialog = await open(user)

    await fill(user, dialog)
    await user.click(within(dialog).getByRole('button', { name: 'Enviar sugestão' }))
    await user.click(await within(dialog).findByRole('button', { name: 'Enviando…' }))

    expect(sent(fetcher)).toHaveLength(1)

    pending.forEach((resolve) => resolve(new Response(JSON.stringify({ suggestion: created, listed: true }), { status: 201, headers: { 'Content-Type': 'application/json' } })))

    expect(await screen.findByRole('link', { name: 'Ordenar a tabela pelo teclado' })).toBeInTheDocument()
  })

  it('opens the same flow from the empty board', async () => {
    const user = userEvent.setup()

    vi.stubGlobal('fetch', serve({ items: [] }))
    renderPage()
    await screen.findByText('@visitor')
    await user.click(await screen.findByRole('button', { name: 'Fazer a primeira sugestão' }))

    expect(await screen.findByRole('dialog', { name: 'Sugerir' })).toBeInTheDocument()
  })
})
