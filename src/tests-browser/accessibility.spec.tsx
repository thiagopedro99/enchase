import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Pagination } from '@components/common/Pagination/index.tsx'
import { Accordion } from '@components/common/Accordion/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { useToast } from '@components/toast/index.ts'
import Layout from '@components/layout/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { renderInBrowser } from './harness.tsx'
import { setReducedMotion } from './media.ts'

const minimum = 24


afterEach(() => setReducedMotion('no-preference'))

describe('prefers-reduced-motion in a real browser', () => {
  const transitionOf = (name: string) => getComputedStyle(page.getByRole('button', { name }).element()).transitionDuration

  it('keeps the short color transitions when the user asks for reduced motion', async () => {
    renderInBrowser(<Button>Salvar</Button>, 'auto')
    const normal = parseFloat(transitionOf('Salvar'))

    await setReducedMotion('reduce')
    const reduced = parseFloat(transitionOf('Salvar'))

    expect(normal).toBeGreaterThan(0.01)
    expect(reduced).toBeGreaterThan(0.01)
  })

  it('does not force the transitions of arbitrary elements to zero', async () => {
    renderInBrowser(<div data-testid="plain" style={{ transition: 'opacity 300ms' }} />, 'auto')

    await setReducedMotion('reduce')

    expect(parseFloat(getComputedStyle(page.getByTestId('plain').element()).transitionDuration)).toBeCloseTo(0.3, 2)
  })

  it('drops the movement of the icon swap but keeps its fade', async () => {
    renderInBrowser(<ThemeToggle />, 'auto')
    await setReducedMotion('reduce')
    const item = document.querySelector('[data-slot="icon-swap-item"]') as HTMLElement
    const style = getComputedStyle(item)

    expect(style.transitionProperty).toBe('opacity')
    expect(style.transform).toBe('none')
  })
})

describe('minimum target size in a real browser', () => {
  it('gives the main controls at least 24x24 CSS pixels', async () => {
    renderInBrowser(
      <div>
        <Button size="sm">Pequeno</Button>
        <Checkbox label="Aceito" />
        <Switch label="Ligado" />
        <RadioGroup label="Plano" options={[{ value: 'free', label: 'Grátis' }]} />
        <Tabs items={[{ value: 'a', label: 'Aba', content: 'Conteúdo' }]} />
        <Accordion items={[{ value: 'a', title: 'Pergunta', content: 'Resposta' }]} />
        <Pagination pageCount={3} size="sm" />
        <Input label="Nome" />
        <Textarea label="Mensagem" />
        <Select label="País" options={[{ value: 'br', label: 'Brasil' }]} />
        <ThemeToggle />
      </div>
    )
    const targets = [
      page.getByRole('button', { name: 'Pequeno' }),
      page.getByRole('checkbox', { name: 'Aceito' }),
      page.getByRole('switch', { name: 'Ligado' }),
      page.getByRole('radio', { name: 'Grátis' }),
      page.getByRole('tab', { name: 'Aba' }),
      page.getByRole('button', { name: 'Pergunta' }),
      page.getByRole('button', { name: '2', exact: true }),
      page.getByRole('button', { name: 'Próxima página' }),
      page.getByRole('textbox', { name: 'Nome' }),
      page.getByRole('textbox', { name: 'Mensagem' }),
      page.getByRole('combobox', { name: 'País' }),
      page.getByRole('button', { name: /tema/i })
    ]

    for (const target of targets) {
      const box = (target.element() as HTMLElement).getBoundingClientRect()
      const label = (target.element() as HTMLElement).closest('label')?.getBoundingClientRect() ?? box

      expect(Math.max(box.width, label.width), String(target)).toBeGreaterThanOrEqual(minimum)
      expect(Math.max(box.height, label.height), String(target)).toBeGreaterThanOrEqual(minimum)
    }
  })

  it('gives the modal close button and the sidebar items at least 24x24', async () => {
    renderInBrowser(
      <>
        <Modal isOpen onClose={() => undefined} title="Título">
          <p>Texto</p>
        </Modal>
        <Layout pageTitle="Teste" navigationSections={demoSections}>
          <p>Conteúdo</p>
        </Layout>
      </>
    )
    const close = page.getByRole('button', { name: 'Fechar modal' }).element().getBoundingClientRect()

    expect(close.width).toBeGreaterThanOrEqual(minimum)
    expect(close.height).toBeGreaterThanOrEqual(minimum)

    const links = page.getByRole('link', { includeHidden: true }).elements() as HTMLElement[]
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      const box = link.getBoundingClientRect()

      if (box.width === 0) continue
      expect(box.height).toBeGreaterThanOrEqual(minimum)
    }
  })
})

const ToastButton = () => {
  const { success } = useToast()

  return <button onClick={() => success('Salvo com sucesso', 60000)}>Notificar</button>
}

describe('dir="rtl" in a real browser', () => {
  const sidebarSide = () => {
    const nav = page.getByRole('navigation', { name: 'Navegação principal' }).element().getBoundingClientRect()
    const main = page.getByRole('main').element().getBoundingClientRect()

    return { nav, main }
  }

  const layout = () => (
    <Layout pageTitle="Teste" navigationSections={demoSections}>
      <p>Conteúdo</p>
    </Layout>
  )

  it('keeps the sidebar before the content in left-to-right', async () => {
    renderInBrowser(layout())
    const { nav, main } = sidebarSide()

    expect(nav.left).toBeLessThan(main.left)
  })

  it('moves the sidebar to the inline start (the right side) in right-to-left', async () => {
    document.documentElement.dir = 'rtl'
    renderInBrowser(layout())
    const { nav, main } = sidebarSide()

    expect(nav.left).toBeGreaterThan(main.left)
    expect(Math.round(nav.right)).toBeGreaterThanOrEqual(document.documentElement.clientWidth - 1)
  })

  it('mirrors the item icon and text inside the sidebar links', async () => {
    document.documentElement.dir = 'rtl'
    renderInBrowser(layout())
    const link = page.getByRole('link', { name: 'Início' }).element() as HTMLElement
    const icon = link.querySelector('svg') as SVGElement
    const text = [...link.querySelectorAll('span')].find((node) => node.textContent === 'Início') as HTMLElement

    expect(icon.getBoundingClientRect().left).toBeGreaterThan(text.getBoundingClientRect().left)
  })

  it('places the toasts at the inline end: right in LTR and left in RTL', async () => {
    renderInBrowser(<ToastButton />)
    await userEvent.click(page.getByRole('button', { name: 'Notificar' }))
    const toast = () => page.getByText('Salvo com sucesso').element().closest('[role]') as HTMLElement
    await expect.poll(() => toast()?.getBoundingClientRect().width).toBeGreaterThan(0)
    const width = document.documentElement.clientWidth

    expect(toast().getBoundingClientRect().left).toBeGreaterThan(width / 2)
  })

  it('places the toasts on the left side in right-to-left', async () => {
    document.documentElement.dir = 'rtl'
    renderInBrowser(<ToastButton />)
    await userEvent.click(page.getByRole('button', { name: 'Notificar' }))
    const toast = () => page.getByText('Salvo com sucesso').element().closest('[role]') as HTMLElement
    await expect.poll(() => toast()?.getBoundingClientRect().width).toBeGreaterThan(0)
    const width = document.documentElement.clientWidth

    expect(toast().getBoundingClientRect().right).toBeLessThan(width / 2)
  })
})
