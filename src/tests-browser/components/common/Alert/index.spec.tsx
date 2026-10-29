import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Alert } from '@components/common/Alert/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'

const variants = ['info', 'success', 'warning', 'error'] as const

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.prepend(style)
  added.push(style)
}

afterEach(() => {
  added.splice(0).forEach((style) => style.remove())
})

const slotOf = (name: string) => document.body.querySelector<HTMLElement>(`[data-slot="${name}"]`) as HTMLElement

const alerts = () => [...document.body.querySelectorAll<HTMLElement>('[data-slot="alert"]')]

const noop = () => undefined

describe('Alert in a real browser', () => {
  it.each(['light', 'dark'] as const)('keeps the text of every variant readable in the %s theme', (mode) => {
    renderInBrowser(
      <>
        {variants.map((variant) => (
          <Alert key={variant} variant={variant} title={variant} onClose={noop}>
            Mensagem
          </Alert>
        ))}
      </>,
      'never',
      mode
    )
    const backgrounds = new Set<string>()

    for (const alert of alerts()) {
      const style = getComputedStyle(alert)

      backgrounds.add(style.backgroundColor)
      expect(contrastRatio(style.color, style.backgroundColor), `${alert.dataset.variant} in ${mode}`).toBeGreaterThanOrEqual(4.5)
    }

    expect(backgrounds.size).toBe(variants.length)
  })

  it('puts the icon at the start and the close button at the end in LTR and the other way round in RTL', () => {
    renderInBrowser(
      <>
        <div dir="ltr" style={{ inlineSize: 400 }}>
          <Alert title="Título" onClose={noop}>
            Mensagem
          </Alert>
        </div>
        <div dir="rtl" style={{ inlineSize: 400 }}>
          <Alert title="Título" onClose={noop}>
            Mensagem
          </Alert>
        </div>
      </>
    )
    const [ltr, rtl] = alerts()
    const edges = (alert: HTMLElement) => ({
      box: alert.getBoundingClientRect(),
      icon: (alert.querySelector('[data-slot="alert-icon"]') as HTMLElement).getBoundingClientRect(),
      close: (alert.querySelector('[data-slot="alert-close"]') as HTMLElement).getBoundingClientRect()
    })
    const left = edges(ltr)
    const right = edges(rtl)

    expect(left.icon.left - left.box.left).toBeLessThan(left.box.right - left.icon.right)
    expect(left.box.right - left.close.right).toBeLessThan(left.close.left - left.box.left)
    expect(right.box.right - right.icon.right).toBeLessThan(right.icon.left - right.box.left)
    expect(right.close.left - right.box.left).toBeLessThan(right.box.right - right.close.right)
  })

  it('keeps the icon and the close button on the first line of a tall message', () => {
    renderInBrowser(
      <div style={{ inlineSize: 260 }}>
        <Alert title="Título" onClose={noop}>
          Uma mensagem longa que ocupa várias linhas dentro de um alerta estreito para conferir o alinhamento.
        </Alert>
      </div>
    )
    const title = slotOf('alert-title').getBoundingClientRect()
    const icon = slotOf('alert-icon').getBoundingClientRect()
    const close = slotOf('alert-close').getBoundingClientRect()
    const iconCenter = icon.top + icon.height / 2
    const closeCenter = close.top + close.height / 2

    expect(iconCenter).toBeGreaterThanOrEqual(title.top)
    expect(iconCenter).toBeLessThanOrEqual(title.bottom)
    expect(closeCenter).toBeLessThan(title.bottom + 12)
    expect(slotOf('alert').getBoundingClientRect().height).toBeGreaterThan(close.height * 2)
  })

  it('does not get taller because of the close button on a single line', () => {
    renderInBrowser(
      <>
        <Alert>Uma linha</Alert>
        <Alert onClose={noop}>Uma linha</Alert>
      </>
    )
    const [plain, closable] = alerts()

    expect(Math.abs(closable.getBoundingClientRect().height - plain.getBoundingClientRect().height)).toBeLessThan(1)
  })

  it('wraps a long unbroken word instead of overflowing', () => {
    renderInBrowser(
      <div style={{ inlineSize: 240 }}>
        <Alert title="Título" onClose={noop}>
          {'a'.repeat(120)}
        </Alert>
      </div>
    )
    const alert = slotOf('alert')

    expect(alert.scrollWidth).toBeLessThanOrEqual(alert.clientWidth + 1)
  })

  it('keeps the close button at least 24 by 24 px and shows a focus ring when reached by keyboard', async () => {
    renderInBrowser(<Alert onClose={noop}>Mensagem</Alert>)
    const close = slotOf('alert-close')
    const rect = close.getBoundingClientRect()

    expect(rect.width).toBeGreaterThanOrEqual(24)
    expect(rect.height).toBeGreaterThanOrEqual(24)

    await userEvent.tab()

    expect(document.activeElement).toBe(close)
    expect(getComputedStyle(close).outlineStyle).toBe('solid')
    expect(getComputedStyle(close).outlineWidth).toBe('2px')
  })

  it('tints the close button when the pointer is over it', async () => {
    renderInBrowser(<Alert onClose={noop}>Mensagem</Alert>)
    const close = slotOf('alert-close')

    expect(getComputedStyle(close).backgroundColor).toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(close)

    await expect.poll(() => getComputedStyle(close).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('names the close button after the labels of the provider', () => {
    renderInBrowser(<Alert onClose={noop}>Mensagem</Alert>)

    expect(page.getByRole('button', { name: 'Fechar notificação' }).element()).toBe(slotOf('alert-close'))
  })

  it('lets the caller class win on layout and colors even when its css loads before the library', () => {
    addStyle('.mine { padding-inline: 33px; border-radius: 3px; background-color: rgb(1, 2, 3); color: rgb(250, 251, 252); }')
    renderInBrowser(
      <Alert className="mine" variant="error">
        Meu
      </Alert>
    )
    const style = getComputedStyle(slotOf('alert'))

    expect(style.paddingInlineStart).toBe('33px')
    expect(style.borderTopLeftRadius).toBe('3px')
    expect(style.backgroundColor).toBe('rgb(1, 2, 3)')
    expect(style.color).toBe('rgb(250, 251, 252)')
  })
})
