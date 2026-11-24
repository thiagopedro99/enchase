import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { describe, expect, it, onTestFinished, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'

import StylePicker from '@demo/pages/landing/subcomponentes/StylePicker/index.tsx'
import { steps } from '@demo/pages/landing/subcomponentes/Steps/defaultData.ts'
import { highlight } from '@demo/components/CodeBlock/highlight.ts'
import { defaultLook } from '@demo/pages/landing/defaultData.ts'
import { docsUrl, repositoryUrl } from '@demo/defaultData.ts'
import Landing from '@demo/pages/landing/index.tsx'
import App from '@demo/App.tsx'

const renderLanding = (onLookChange = vi.fn()) => ({ ...renderWithProviders(<Landing look={defaultLook} onLookChange={onLookChange} />, { toasts: true }), onLookChange })

const group = (name: string) => screen.getByRole('radiogroup', { name })

const observerOf = (width: number) =>
  class {
    private readonly notify: ResizeObserverCallback

    constructor(notify: ResizeObserverCallback) {
      this.notify = notify
    }

    observe() {
      this.notify([{ contentRect: { width } } as ResizeObserverEntry], this as unknown as ResizeObserver)
    }

    unobserve() {}

    disconnect() {}
  }

const headingLevels = () => screen.getAllByRole('heading').map((heading) => Number(heading.tagName.slice(1)))

describe('Landing page', () => {
  it('has no axe violations', async () => {
    const { container } = renderLanding()

    expect(await axe(container)).toHaveNoViolations()
  }, 30000)

  it('exposes exactly one h1 inside the main landmark', () => {
    renderLanding()

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1 }))
  })

  it('never skips a heading level', () => {
    renderLanding()

    const levels = headingLevels()
    const skips = levels.filter((level, index) => index > 0 && level - levels[index - 1] > 1)

    expect(skips).toEqual([])
  })

  it('has banner, navigation, main and contentinfo landmarks and a skip link', () => {
    renderLanding()

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toBeInTheDocument()
  })

  it('names every section of the page by its heading', () => {
    renderLanding()

    const names = [
      'Componentes React lapidados para o seu produto',
      '48 componentes, um import',
      'O trabalho chato já vem feito',
      'Um kit, cinco visuais. Troque agora.',
      'Da instalação ao primeiro botão em três passos',
      'Antes de instalar',
      'Instale e monte a primeira tela hoje'
    ]

    for (const name of names) expect(screen.getByRole('region', { name })).toBeInTheDocument()
  })
})

describe('Landing links', () => {
  it('sends Começar agora to the documentation as a real link', () => {
    renderLanding()

    const link = screen.getByRole('link', { name: 'Começar agora' })

    expect(link).toHaveAttribute('href', docsUrl)
    expect(screen.getByRole('main')).toContainElement(link)
  })

  it('opens the repository in a new tab and says so', () => {
    renderLanding()

    const link = screen.getByRole('link', { name: 'Ver no GitHub (abre em nova aba)' })

    expect(link).toHaveAttribute('href', repositoryUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('links each item of the menu to a section that exists', () => {
    const { container } = renderLanding()
    const menu = screen.getByRole('navigation', { name: 'Navegação principal' })
    const anchors = within(menu)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('#'))

    expect(anchors.length).toBeGreaterThan(0)

    for (const href of anchors) expect(container.querySelector(href)).not.toBeNull()
  })
})

describe('Landing playground', () => {
  it('asks for the look that the controls pick', async () => {
    const user = userEvent.setup()
    const { onLookChange } = renderLanding()

    await user.click(within(group('Estilo')).getByRole('radio', { name: 'Enchase' }))
    await user.click(within(group('Cor da marca')).getByRole('radio', { name: 'Verde' }))
    await user.click(within(group('Cantos')).getByRole('radio', { name: 'Suave' }))
    await user.click(screen.getByRole('switch', { name: 'Densidade compacta' }))

    expect(onLookChange.mock.calls.map(([look]) => look)).toEqual([
      { ...defaultLook, style: 'enchase' },
      { ...defaultLook, brand: '#0F766E' },
      { ...defaultLook, shape: 'soft' },
      { ...defaultLook, compact: true }
    ])
  })
})

describe('Landing style picker', () => {
  it('lists the five styles in both pickers of the page', () => {
    renderLanding()

    for (const name of ['Estilo', 'Estilo visual da página']) expect(within(group(name)).getAllByRole('radio').map((radio) => radio.textContent)).toEqual(['Enchase', 'Material 2', 'Material 3', 'shadcn', 'Workbench'])
  })

  it('becomes a select on a narrow screen, where five options do not fit in a row', async () => {
    const user = userEvent.setup()
    const width = window.innerWidth

    window.innerWidth = 390

    const { onLookChange } = renderLanding()

    expect(screen.queryByRole('radiogroup', { name: 'Estilo' })).not.toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox', { name: 'Estilo' }), 'Material 3')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Estilo visual da página' }), 'Workbench')

    expect(onLookChange.mock.calls.map(([look]) => look.style)).toEqual(['material3', 'workbench'])

    window.innerWidth = width
  })

  it.each([
    { width: 320, role: 'combobox' },
    { width: 520, role: 'radiogroup' }
  ])('follows its own width, not the width of the screen: $width px gives a $role', ({ width, role }) => {
    vi.stubGlobal('ResizeObserver', observerOf(width))
    onTestFinished(() => void vi.unstubAllGlobals())

    renderWithProviders(<StylePicker name="Estilo" value="shadcn" onChange={vi.fn()} />)

    expect(screen.getByRole(role, { name: 'Estilo' })).toBeInTheDocument()
    expect(screen.queryByRole(role === 'combobox' ? 'radiogroup' : 'combobox', { name: 'Estilo' })).not.toBeInTheDocument()
  })
})

describe('Landing hero', () => {
  it('paints the page with the brand picked in the hero', async () => {
    const user = userEvent.setup()
    const { onLookChange } = renderLanding()

    await user.click(within(group('Pinte esta página')).getByRole('radio', { name: 'Violeta' }))

    expect(onLookChange).toHaveBeenCalledWith({ ...defaultLook, brand: '#7C3AED' })
  })

  it('moves between the brands with the arrow keys', async () => {
    const user = userEvent.setup()
    const { onLookChange } = renderLanding()

    within(group('Pinte esta página')).getByRole('radio', { name: 'A do estilo' }).focus()
    await user.keyboard('{ArrowRight}')

    expect(onLookChange).toHaveBeenCalledWith({ ...defaultLook, brand: '#0F766E' })
  })

  it('describes the preview as one image and keeps its copies out of the tab order', () => {
    const { container } = renderLanding()
    const preview = screen.getByRole('img', { name: /Prévia de um painel montado só com componentes Enchase/ })
    const panes = [...preview.children]

    expect(panes.map((pane) => pane.getAttribute('data-theme'))).toEqual(['light', 'dark'])

    for (const pane of panes) {
      expect(pane).toHaveAttribute('inert')
      expect(pane).toHaveAttribute('aria-hidden', 'true')
    }

    expect(container.querySelectorAll('[inert]')).toHaveLength(2)
  })

  it('opens the divider and lets the keyboard move it', async () => {
    renderLanding()

    const divider = screen.getByRole('slider', { name: 'Divisão entre o tema claro e o escuro' })

    await waitFor(() => expect(divider).toHaveAttribute('aria-valuetext', '52% no tema claro, 48% no escuro'))

    fireEvent.change(divider, { target: { value: '30' } })

    expect(divider).toHaveAttribute('aria-valuetext', '30% no tema claro, 70% no escuro')
  })
})

describe('Landing features', () => {
  it('asks for the style picked in the features grid', async () => {
    const user = userEvent.setup()
    const { onLookChange } = renderLanding()

    await user.click(within(group('Estilo visual da página')).getByRole('radio', { name: 'Workbench' }))

    expect(onLookChange).toHaveBeenCalledWith({ ...defaultLook, style: 'workbench' })
  })

  it('pauses and resumes the strip of component names', async () => {
    const user = userEvent.setup()

    renderLanding()

    const strip = screen.getByRole('region', { name: '48 componentes, um import' })

    await user.click(within(strip).getByRole('button', { name: 'Pausar a animação' }))

    expect(strip).toHaveAttribute('data-paused')

    await user.click(within(strip).getByRole('button', { name: 'Retomar a animação' }))

    expect(strip).not.toHaveAttribute('data-paused')
  })

  it('lists each component name once for assistive technology', () => {
    renderLanding()

    const strip = screen.getByRole('region', { name: '48 componentes, um import' })
    const names = within(strip)
      .getAllByRole('listitem')
      .map((item) => item.textContent)

    expect(names).toHaveLength(48)
    expect(new Set(names).size).toBe(48)
  })

  it('releases and returns the springs', async () => {
    const user = userEvent.setup()

    renderLanding()

    await user.click(screen.getByRole('button', { name: 'Soltar as molas' }))

    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
  })
})

describe('Landing code', () => {
  it('keeps every character of the code when it colors the tokens', () => {
    for (const { blocks } of steps) {
      for (const { code, language } of blocks) {
        expect(
          highlight(code, language)
            .map(({ text }) => text)
            .join('')
        ).toBe(code)
      }
    }
  })

  it('marks strings, keywords and tags of a tsx snippet', () => {
    const kinds = (text: string) => highlight("import { Button } from 'enchase'\n<Button className={a}>Salvar</Button>", 'tsx').find((token) => token.text === text)?.kind

    expect(kinds('import')).toBe('keyword')
    expect(kinds("'enchase'")).toBe('string')
    expect(kinds('Button')).toBe('tag')
    expect(kinds('className')).toBe('attribute')
  })

  it('numbers the three steps in an ordered list', () => {
    renderLanding()

    const region = screen.getByRole('region', { name: 'Da instalação ao primeiro botão em três passos' })
    const titles = within(region)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)

    expect(titles).toEqual(['Instale', 'Envolva o app', 'Use. E mude com CSS normal'])
    expect(region.querySelector('ol')?.children).toHaveLength(3)
  })
})

describe('App', () => {
  it('renders the landing page and writes the theme that the controls pick', async () => {
    const user = userEvent.setup()

    render(<App />)

    const snippet = screen.getByLabelText('O tema que você está vendo')

    expect(snippet).toHaveTextContent('style: shadcn')

    await user.click(within(group('Estilo')).getByRole('radio', { name: 'Workbench' }))
    await user.click(screen.getByRole('switch', { name: 'Densidade compacta' }))

    expect(snippet).toHaveTextContent('style: workbench')

    await user.click(within(group('Estilo')).getByRole('radio', { name: 'Material 3' }))

    expect(snippet).toHaveTextContent("import { material3 } from 'enchase/styles/material3'")
    expect(snippet).toHaveTextContent('style: material3')

    await user.click(within(group('Estilo')).getByRole('radio', { name: 'Enchase' }))

    expect(snippet).not.toHaveTextContent('style:')
    expect(document.documentElement).toHaveAttribute('data-density', 'compact')

    await user.click(screen.getByRole('switch', { name: 'Densidade compacta' }))

    expect(document.documentElement).not.toHaveAttribute('data-density')
  })

  it('paints the brand from the hero and switches the color mode from the features grid', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(within(group('Pinte esta página')).getByRole('radio', { name: 'Carmim' }))

    expect(screen.getByLabelText('O tema que você está vendo')).toHaveTextContent("brand: '#BE123C'")

    await user.click(within(group('Modo de cor da página')).getByRole('radio', { name: 'Escuro' }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')

    await user.click(within(group('Modo de cor da página')).getByRole('radio', { name: 'Claro' }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })

  it('does not draw a breadcrumb trail', () => {
    render(<App />)

    expect(screen.queryByRole('navigation', { name: 'Trilha de navegação' })).not.toBeInTheDocument()
  })
})
