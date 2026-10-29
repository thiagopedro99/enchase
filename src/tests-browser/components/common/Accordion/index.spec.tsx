import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Accordion } from '@components/common/Accordion/index.tsx'
import { Badge } from '@components/common/Badge/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { setForcedColors, setReducedMotion } from '../../../support/media.ts'
import { unlessWebkit } from '../../../support/browserSkips.ts'
import { waitForSettled } from '../../../support/settle.ts'

const items = [
  { value: 'shipping', title: 'Envio', content: <p>Enviamos em até dois dias.</p> },
  { value: 'returns', title: 'Devoluções', content: <p>Aceitamos em até trinta dias.</p> },
  { value: 'payment', title: 'Pagamento', content: <p>Cartão, Pix e boleto.</p> }
]

const surfaces = ['surface', 'background', 'surface-container-high'] as const

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.prepend(style)
  added.push(style)
}

afterEach(async () => {
  added.splice(0).forEach((style) => style.remove())
  await setForcedColors('none')
})

const part = (name: string, index = 0) => document.body.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`)[index]

const trigger = (index: number) => part('accordion-trigger', index)

const panel = (index: number) => part('accordion-panel', index)

const icon = (index: number) => part('accordion-icon', index)

const openTitles = () => [...document.body.querySelectorAll<HTMLElement>('[data-slot="accordion-trigger"][aria-expanded="true"]')].map((button) => button.textContent)

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const turns = (element: HTMLElement) => {
  const matrix = new DOMMatrix(getComputedStyle(element).transform)

  return Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI)
}

const watchTransitions = (element: HTMLElement) => {
  const started: string[] = []

  element.addEventListener('transitionrun', (event) => started.push((event as TransitionEvent).propertyName))

  return started
}

describe('Accordion in a real browser', () => {
  it('is exposed as headings with buttons and regions linked to them', async () => {
    renderInBrowser(<Accordion items={items} />)

    expect(page.getByRole('heading', { level: 3 }).elements()).toHaveLength(3)
    expect(page.getByRole('button', { name: 'Envio', expanded: false }).element()).toBe(trigger(0))
    expect(page.getByRole('region', { name: 'Envio' }).elements()).toHaveLength(0)

    await userEvent.click(trigger(0))

    expect(page.getByRole('button', { name: 'Envio', expanded: true }).element()).toBe(trigger(0))
    expect(page.getByRole('region', { name: 'Envio' }).element()).toBe(panel(0))
  })

  it('displays only the open panels and turns the arrow over', async () => {
    renderInBrowser(<Accordion items={items} multiple />)
    const display = () => [0, 1, 2].map((index) => getComputedStyle(panel(index)).display)

    expect(display()).toEqual(['none', 'none', 'none'])
    expect([0, 1, 2].map((index) => turns(icon(index)))).toEqual([0, 0, 0])

    await userEvent.click(trigger(0))
    await userEvent.click(trigger(2))

    expect(display()).toEqual(['block', 'none', 'block'])
    expect([0, 1, 2].map((index) => turns(icon(index)))).toEqual([180, 0, 180])
  })

  it('opens one item at a time by default and lets the open one close', async () => {
    renderInBrowser(<Accordion items={items} />)

    await userEvent.click(trigger(0))
    await userEvent.click(trigger(2))
    expect(openTitles()).toEqual(['Pagamento'])

    await userEvent.click(trigger(2))
    expect(openTitles()).toEqual([])
  })

  it('stacks the items and pushes the next one down by the height of the opened panel', async () => {
    renderInBrowser(<Accordion items={items} />)
    const top = (index: number) => trigger(index).getBoundingClientRect().top
    const before = top(1)

    expect(top(1)).toBeGreaterThan(trigger(0).getBoundingClientRect().bottom - 1)

    await userEvent.click(trigger(0))

    expect(panel(0).getBoundingClientRect().top).toBeGreaterThanOrEqual(trigger(0).getBoundingClientRect().bottom - 0.5)
    expect(top(1)).toBeCloseTo(before + panel(0).getBoundingClientRect().height, 0)
  })

  it('makes each button fill the width of the accordion and at least 24 px tall', () => {
    renderInBrowser(<Accordion items={items} />)

    for (let index = 0; index < items.length; index += 1) {
      const box = trigger(index).getBoundingClientRect()

      expect(box.width).toBeCloseTo(part('accordion').clientWidth, 0)
      expect(box.height).toBeGreaterThanOrEqual(24)
    }
  })

  it('moves through the buttons with Tab, toggles with Enter and Space and moves with the arrow keys', async () => {
    renderInBrowser(<Accordion items={items} multiple />)

    await userEvent.tab()
    expect(document.activeElement).toBe(trigger(0))

    await userEvent.keyboard('{Enter}')
    expect(openTitles()).toEqual(['Envio'])

    await userEvent.keyboard(' ')
    expect(openTitles()).toEqual([])

    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(trigger(1))

    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(trigger(2))

    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(trigger(0))

    await userEvent.keyboard('{ArrowUp}')
    expect(document.activeElement).toBe(trigger(2))

    await userEvent.keyboard('{Home}')
    expect(document.activeElement).toBe(trigger(0))
    expect(openTitles()).toEqual([])
  })

  it('never opens a disabled item and signals it with the cursor', async () => {
    renderInBrowser(<Accordion items={[items[0], { ...items[1], disabled: true }, items[2]]} />)

    await userEvent.click(trigger(1), { force: true })

    expect(openTitles()).toEqual([])
    expect(getComputedStyle(trigger(1)).cursor).toBe('not-allowed')
  })

  it('skips a disabled item with the arrow keys', async () => {
    renderInBrowser(<Accordion items={[items[0], { ...items[1], disabled: true }, items[2]]} />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')

    expect(document.activeElement).toBe(trigger(2))
  })

  it.each(['light', 'dark'] as const)('keeps the titles and the arrows readable in the %s theme', (mode) => {
    renderInBrowser(<Accordion items={items} />, 'never', mode)

    for (const name of surfaces) {
      expect(contrastRatio(getComputedStyle(trigger(0)).color, surface(name)), `title on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(icon(0)).color, surface(name)), `arrow on ${name}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('shows a visible focus ring on the focused button when reached by keyboard', async () => {
    renderInBrowser(<Accordion items={items} />)

    await userEvent.tab()
    const style = getComputedStyle(trigger(0))

    expect(style.outlineStyle).toBe('solid')
    expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(getComputedStyle(trigger(1)).outlineStyle).toBe('none')

    for (const name of surfaces) expect(contrastRatio(style.outlineColor, surface(name)), name).toBeGreaterThanOrEqual(3)
  })

  it('puts the title at the start and the arrow at the end in both directions', () => {
    renderInBrowser(<Accordion items={items} />)

    expect(part('accordion-title').getBoundingClientRect().left).toBeLessThan(icon(0).getBoundingClientRect().left)
  })

  it('mirrors the layout in right-to-left text', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<Accordion items={items} />)

    expect(part('accordion-title').getBoundingClientRect().left).toBeGreaterThan(icon(0).getBoundingClientRect().left)
    expect(getComputedStyle(trigger(0)).textAlign).toBe('start')
  })

  it('lays out a title made of nodes at the start, grows the button for it and keeps the arrow at the end', () => {
    const company = (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-block', inlineSize: 40, blockSize: 40 }} />
        <span>Acme Ltda</span>
        <Badge variant="success">Atual</Badge>
      </span>
    )

    renderInBrowser(
      <div style={{ inlineSize: 320 }}>
        <Accordion items={[{ value: 'a', title: company, content: <p>Desde 2023.</p> }]} />
      </div>
    )
    const box = trigger(0).getBoundingClientRect()
    const style = getComputedStyle(trigger(0))
    const title = part('accordion-title').getBoundingClientRect()
    const arrow = icon(0).getBoundingClientRect()
    const container = part('accordion').parentElement as HTMLElement

    expect(title.left - box.left).toBeCloseTo(parseFloat(style.paddingInlineStart), 0)
    expect(box.right - arrow.right).toBeCloseTo(parseFloat(style.paddingInlineEnd), 0)
    expect(box.height).toBeGreaterThanOrEqual(40 + parseFloat(style.paddingBlockStart) + parseFloat(style.paddingBlockEnd))
    expect(title.right).toBeLessThanOrEqual(arrow.left)
    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
    expect(part('accordion-title').querySelector('[data-slot="badge"]')).not.toBeNull()
  })

  it('wraps the nodes of a title inside a narrow container instead of overflowing it', () => {
    const wide = (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span>Empresa com um nome bem comprido</span>
        <Badge variant="success">Atual</Badge>
      </span>
    )

    renderInBrowser(
      <div style={{ inlineSize: 200 }}>
        <Accordion items={[{ value: 'a', title: wide, content: <p>Texto.</p> }]} />
      </div>
    )
    const container = part('accordion').parentElement as HTMLElement

    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
    expect(part('accordion-title').getBoundingClientRect().right).toBeLessThanOrEqual(icon(0).getBoundingClientRect().left)
  })

  it('breaks an unbreakable title inside a narrow container', () => {
    const word = 'Benachrichtigungseinstellungsverwaltungsseite'

    renderInBrowser(
      <div style={{ inlineSize: 160 }}>
        <Accordion items={[{ value: 'a', title: word, content: <p>{word}</p> }]} defaultValue={['a']} />
      </div>
    )
    const container = part('accordion').parentElement as HTMLElement
    const title = part('accordion-title')

    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
    expect(part('accordion').getBoundingClientRect().width).toBeLessThanOrEqual(160)
    expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth)
  })

  it('keeps the state of a closed panel', async () => {
    renderInBrowser(
      <Accordion
        multiple
        defaultValue={['a']}
        items={[
          { value: 'a', title: 'Formulário', content: <input aria-label="Nome" /> },
          { value: 'b', title: 'Outra', content: <p>Outra</p> }
        ]}
      />
    )

    await userEvent.type(page.getByRole('textbox', { name: 'Nome' }), 'Ana')
    await userEvent.click(trigger(0))
    await userEvent.click(trigger(0))

    expect((page.getByRole('textbox', { name: 'Nome' }).element() as HTMLInputElement).value).toBe('Ana')
  })

  it('lets the caller class and slot selectors win on layout even when its css loads before the library', () => {
    addStyle('.mine { max-inline-size: 300px; } [data-slot="accordion-trigger"] { min-block-size: 70px; } [data-slot="accordion-panel"] { padding-inline: 33px; }')
    renderInBrowser(<Accordion items={items} className="mine" defaultValue={['shipping']} />)

    expect(part('accordion').getBoundingClientRect().width).toBeLessThanOrEqual(300)
    expect(getComputedStyle(trigger(0)).minHeight).toBe('70px')
    expect(getComputedStyle(panel(0)).paddingInlineStart).toBe('33px')
  })
})

describe('Accordion motion in a real browser', () => {
  it('fades and slides the opened panel in and turns the arrow with the duration of the recipe', async () => {
    renderInBrowser(<Accordion items={items} />, 'auto')
    const entering = watchTransitions(panel(0))
    const turning = watchTransitions(icon(0))

    expect(parseFloat(getComputedStyle(panel(0)).transitionDuration)).toBeCloseTo(0.2, 2)

    await userEvent.click(trigger(0))

    await expect.poll(() => entering).toContain('opacity')
    await expect.poll(() => entering).toContain('transform')
    await expect.poll(() => turning).toContain('transform')
    await waitForSettled(() => part('accordion'))
    expect(getComputedStyle(panel(0)).opacity).toBe('1')
    expect(getComputedStyle(panel(0)).transform).toBe('none')
    expect(turns(icon(0))).toBe(180)
  })

  it('takes the duration from the animation tuning', () => {
    renderInBrowser(<Accordion items={items} animation={{ tuning: { duration: 0.5 } }} />, 'auto')

    expect(parseFloat(getComputedStyle(panel(0)).transitionDuration)).toBeCloseTo(0.5, 2)
    expect(parseFloat(getComputedStyle(icon(0)).transitionDuration)).toBeCloseTo(0.5, 2)
  })

  it.each([
    ['never mode', undefined, 'never'],
    ['animation={false}', false, 'auto']
  ] as const)('switches at once with %s', async (_name, animation, motion) => {
    renderInBrowser(<Accordion items={items} animation={animation} />, motion)

    await userEvent.click(trigger(0))

    expect(part('accordion').getAnimations({ subtree: true })).toEqual([])
    expect(getComputedStyle(panel(0)).opacity).toBe('1')
    expect(turns(icon(0))).toBe(180)
  })

  it('stops turning the arrow and sliding the panel under reduced motion but still fades it', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<Accordion items={items} />, 'auto')
    const entering = watchTransitions(panel(0))
    const turning = watchTransitions(icon(0))

    await userEvent.click(trigger(0))

    expect(getComputedStyle(icon(0)).transitionProperty).toBe('none')
    expect(getComputedStyle(panel(0)).transitionProperty).toBe('opacity')
    await expect.poll(() => entering).toContain('opacity')
    expect(entering).not.toContain('transform')
    expect(turning).toEqual([])
    expect(turns(icon(0))).toBe(180)
  })
})

describe('Accordion in forced colors', () => {
  const run = unlessWebkit('forcedColors') ? it : it.skip

  run('keeps the arrow and the title visible against the page', async () => {
    renderInBrowser(<Accordion items={items} />)

    await setForcedColors('active')
    const probe = document.createElement('div')

    probe.style.backgroundColor = 'Canvas'
    document.body.append(probe)
    const canvas = getComputedStyle(probe).backgroundColor
    probe.remove()
    const arrow = icon(0).querySelector('svg') as SVGElement

    expect(contrastRatio(getComputedStyle(arrow).stroke, canvas)).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(getComputedStyle(trigger(0)).color, canvas)).toBeGreaterThanOrEqual(3)
  })
})
