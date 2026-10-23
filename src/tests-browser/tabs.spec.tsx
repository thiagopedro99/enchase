import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Badge } from '@components/common/Badge/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { setForcedColors, setReducedMotion } from './media.ts'
import { unlessWebkit } from './browserSkips.ts'
import { waitForSettled } from './settle.ts'

const items = [
  { value: 'profile', label: 'Perfil', content: <p>Dados do perfil</p> },
  { value: 'billing', label: 'Cobrança', content: <p>Dados de cobrança</p> },
  { value: 'team', label: 'Equipe', content: <p>Dados da equipe</p> }
]

const many = Array.from({ length: 12 }, (_, index) => ({ value: `t${index}`, label: `Aba número ${index + 1}`, content: <p>Conteúdo {index + 1}</p> }))

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

const tab = (index: number) => part('tabs-tab', index)

const checkedTab = () => document.body.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.textContent

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const isUnder = (element: HTMLElement, owner: HTMLElement) => {
  const box = element.getBoundingClientRect()
  const target = owner.getBoundingClientRect()

  return Math.abs(box.left - target.left) < 0.6 && Math.abs(box.width - target.width) < 0.6
}

const watchTransitions = (element: HTMLElement) => {
  const started: string[] = []

  element.addEventListener('transitionrun', (event) => started.push((event as TransitionEvent).propertyName))

  return started
}

describe('Tabs in a real browser', () => {
  it('is exposed as a named tab list with the selected tab and its panel', () => {
    renderInBrowser(<Tabs ariaLabel="Conta" items={items} defaultValue="billing" />)

    expect(page.getByRole('tablist', { name: 'Conta' }).element()).toBe(part('tabs-list'))
    expect(page.getByRole('tab').elements()).toHaveLength(3)
    expect(page.getByRole('tab', { name: 'Cobrança', selected: true }).element()).toBe(tab(1))
    expect(page.getByRole('tabpanel', { name: 'Cobrança' }).element()).toBe(part('tabs-panel', 1))
    expect(page.getByRole('tabpanel').elements()).toHaveLength(1)
  })

  it('displays only the panel of the selected tab', async () => {
    renderInBrowser(<Tabs items={items} />)
    const display = () => [0, 1, 2].map((index) => getComputedStyle(part('tabs-panel', index)).display)

    expect(display()).toEqual(['block', 'none', 'none'])

    await userEvent.click(tab(2))

    expect(display()).toEqual(['none', 'none', 'block'])
  })

  it.each(['ltr', 'rtl'] as const)('puts the indicator under the selected tab and moves it with the selection in %s text', async (dir) => {
    document.documentElement.setAttribute('dir', dir)
    renderInBrowser(<Tabs items={items} />)
    const indicator = part('tabs-indicator')

    expect(indicator.hasAttribute('data-visible')).toBe(true)
    expect(isUnder(indicator, tab(0))).toBe(true)
    expect(indicator.getBoundingClientRect().height).toBeCloseTo(2, 0)
    expect(indicator.getBoundingClientRect().bottom).toBeCloseTo(tab(0).getBoundingClientRect().bottom, 0)

    await userEvent.click(tab(2))
    expect(isUnder(indicator, tab(2))).toBe(true)

    await userEvent.click(tab(1))
    expect(isUnder(indicator, tab(1))).toBe(true)
  })

  it('lays the tabs out from the right in right-to-left text', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<Tabs items={items} />)

    expect(tab(0).getBoundingClientRect().left).toBeGreaterThan(tab(1).getBoundingClientRect().left)
  })

  it('keeps the indicator under a tab whose label is made of nodes and sizes the tab by them', async () => {
    const nodes = [
      { value: 'plain', label: 'Perfil', content: <p>Dados do perfil</p> },
      {
        value: 'rich',
        label: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span>Notificações</span>
            <Badge variant="primary">12</Badge>
          </span>
        ),
        content: <p>Notificações</p>
      }
    ]

    renderInBrowser(<Tabs ariaLabel="Conta" items={nodes} defaultValue="rich" />)
    const label = tab(1).querySelector('[data-slot="badge"]') as HTMLElement

    expect(isUnder(part('tabs-indicator'), tab(1))).toBe(true)
    expect(tab(1).getBoundingClientRect().width).toBeGreaterThan(tab(0).getBoundingClientRect().width)
    expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(tab(1).getBoundingClientRect().right)
    expect(getComputedStyle(tab(1)).whiteSpace).toBe('nowrap')

    await userEvent.click(tab(0))

    await expect.poll(() => isUnder(part('tabs-indicator'), tab(0))).toBe(true)
  })

  it('keeps the indicator under the selected tab when the tabs change size', async () => {
    renderInBrowser(<Tabs items={items} defaultValue="billing" />)
    const before = part('tabs-indicator').getBoundingClientRect().width

    addStyle('[data-slot="tabs-tab"] { font-size: 1.75rem; padding-inline: 40px; }')

    await expect.poll(() => part('tabs-indicator').getBoundingClientRect().width).toBeGreaterThan(before + 20)
    expect(isUnder(part('tabs-indicator'), tab(1))).toBe(true)
  })

  it.each(['ltr', 'rtl'] as const)('scrolls a long list to the focused tab and keeps the indicator under it in %s text', async (dir) => {
    document.documentElement.setAttribute('dir', dir)
    renderInBrowser(
      <div style={{ inlineSize: 260 }}>
        <Tabs items={many} />
      </div>
    )
    const list = part('tabs-list')

    expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
    expect(list.scrollLeft).toBe(0)

    await userEvent.tab()
    expect(document.activeElement).toBe(tab(0))

    await userEvent.keyboard('{End}')

    expect(checkedTab()).toBe('Aba número 12')
    expect(dir === 'ltr' ? list.scrollLeft > 0 : list.scrollLeft < 0).toBe(true)
    expect(isUnder(part('tabs-indicator'), tab(11))).toBe(true)

    await userEvent.keyboard('{Home}')

    expect(checkedTab()).toBe('Aba número 1')
    expect(isUnder(part('tabs-indicator'), tab(0))).toBe(true)
  })

  it('is one tab stop on the selected tab and the next stop is its panel', async () => {
    renderInBrowser(
      <>
        <button>Antes</button>
        <Tabs items={items} defaultValue="billing" />
        <button>Depois</button>
      </>
    )

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Antes' }).element())

    await userEvent.tab()
    expect(document.activeElement).toBe(tab(1))

    await userEvent.tab()
    expect(document.activeElement).toBe(part('tabs-panel', 1))

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Depois' }).element())
  })

  it('selects and focuses the next and previous tab with the arrow keys, wrapping around', async () => {
    renderInBrowser(<Tabs items={items} />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(tab(1))
    expect(checkedTab()).toBe('Cobrança')

    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(checkedTab()).toBe('Perfil')

    await userEvent.keyboard('{ArrowLeft}')
    expect(checkedTab()).toBe('Equipe')
    expect(getComputedStyle(part('tabs-panel', 2)).display).toBe('block')
  })

  it('swaps the arrow keys in right-to-left text so they follow the screen', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<Tabs items={items} />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowLeft}')
    expect(checkedTab()).toBe('Cobrança')
    expect(tab(1).getBoundingClientRect().left).toBeLessThan(tab(0).getBoundingClientRect().left)

    await userEvent.keyboard('{ArrowRight}')
    expect(checkedTab()).toBe('Perfil')
  })

  it('jumps to the first and last tab with Home and End and skips a disabled one', async () => {
    renderInBrowser(<Tabs items={[items[0], { ...items[1], disabled: true }, items[2]]} />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(checkedTab()).toBe('Equipe')

    await userEvent.keyboard('{Home}')
    expect(checkedTab()).toBe('Perfil')

    await userEvent.keyboard('{End}')
    expect(checkedTab()).toBe('Equipe')
  })

  it('only moves the focus under manual activation and selects with Enter', async () => {
    renderInBrowser(<Tabs items={items} activation="manual" />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(tab(1))
    expect(checkedTab()).toBe('Perfil')

    await userEvent.keyboard('{Enter}')

    expect(checkedTab()).toBe('Cobrança')
  })

  it.each(['light', 'dark'] as const)('keeps the tab texts and the indicator readable in the %s theme', (mode) => {
    renderInBrowser(<Tabs items={[items[0], items[1], { ...items[2], disabled: true }]} />, 'never', mode)
    const indicator = getComputedStyle(part('tabs-indicator'))

    for (const name of surfaces) {
      expect(contrastRatio(getComputedStyle(tab(0)).color, surface(name)), `selected tab on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(tab(1)).color, surface(name)), `unselected tab on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(indicator.borderBottomColor, surface(name)), `indicator on ${name}`).toBeGreaterThanOrEqual(3)
    }

    expect(indicator.borderBottomStyle).toBe('solid')
    expect(parseFloat(indicator.borderBottomWidth)).toBeGreaterThanOrEqual(2)
  })

  it('shows a visible focus ring on the focused tab and on the panel when reached by keyboard', async () => {
    renderInBrowser(<Tabs items={items} />)

    await userEvent.tab()
    const onTab = getComputedStyle(tab(0))

    expect(onTab.outlineStyle).toBe('solid')
    expect(parseFloat(onTab.outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(getComputedStyle(tab(1)).outlineStyle).toBe('none')

    await userEvent.tab()
    const onPanel = getComputedStyle(part('tabs-panel', 0))

    expect(document.activeElement).toBe(part('tabs-panel', 0))
    expect(onPanel.outlineStyle).toBe('solid')

    for (const name of surfaces) {
      expect(contrastRatio(onTab.outlineColor, surface(name)), `tab on ${name}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(onPanel.outlineColor, surface(name)), `panel on ${name}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('keeps every tab at least 24 by 24 px', () => {
    renderInBrowser(<Tabs items={items} />)

    for (let index = 0; index < items.length; index += 1) {
      const box = tab(index).getBoundingClientRect()

      expect(box.width).toBeGreaterThanOrEqual(24)
      expect(box.height).toBeGreaterThanOrEqual(24)
    }
  })

  it('keeps the state of a hidden panel', async () => {
    renderInBrowser(
      <Tabs
        items={[
          { value: 'a', label: 'Formulário', content: <input aria-label="Nome" /> },
          { value: 'b', label: 'Outra', content: <p>Outra</p> }
        ]}
      />
    )

    await userEvent.type(page.getByRole('textbox', { name: 'Nome' }), 'Ana')
    await userEvent.click(tab(1))
    await userEvent.click(tab(0))

    expect((page.getByRole('textbox', { name: 'Nome' }).element() as HTMLInputElement).value).toBe('Ana')
  })

  it('lets the caller class and slot selectors win on layout even when its css loads before the library', () => {
    addStyle('.mine { max-inline-size: 300px; } [data-slot="tabs-tab"] { min-block-size: 70px; } [data-slot="tabs-panel"] { padding-block-start: 31px; }')
    renderInBrowser(<Tabs items={items} className="mine" />)

    expect(part('tabs').getBoundingClientRect().width).toBeLessThanOrEqual(300)
    expect(getComputedStyle(tab(0)).minHeight).toBe('70px')
    expect(getComputedStyle(part('tabs-panel')).paddingBlockStart).toBe('31px')
  })
})

describe('Tabs motion in a real browser', () => {
  it('places the indicator at once on the first render and slides it when the tab changes', async () => {
    renderInBrowser(<Tabs items={items} />, 'auto')
    const indicator = part('tabs-indicator')
    const started = watchTransitions(indicator)

    expect(indicator.hasAttribute('data-animate')).toBe(false)
    expect(parseFloat(getComputedStyle(indicator).transitionDuration)).toBe(0)

    await userEvent.click(tab(2))

    expect(indicator.hasAttribute('data-animate')).toBe(true)
    await expect.poll(() => started).toContain('translate')
    await expect.poll(() => started).toContain('scale')
    await waitForSettled(() => part('tabs'))
    expect(isUnder(indicator, tab(2))).toBe(true)
  })

  it('fades the newly shown panel in', async () => {
    renderInBrowser(<Tabs items={items} />, 'auto')
    const started = watchTransitions(part('tabs-panel', 2))

    expect(parseFloat(getComputedStyle(part('tabs-panel', 2)).transitionDuration)).toBeCloseTo(0.2, 2)

    await userEvent.click(tab(2))

    await expect.poll(() => started).toContain('opacity')
    await waitForSettled(() => part('tabs'))
    expect(getComputedStyle(part('tabs-panel', 2)).opacity).toBe('1')
  })

  it('takes the duration from the animation tuning', async () => {
    renderInBrowser(<Tabs items={items} animation={{ tuning: { duration: 0.5 } }} />, 'auto')

    await userEvent.click(tab(1))

    expect(parseFloat(getComputedStyle(part('tabs-indicator')).transitionDuration)).toBeCloseTo(0.5, 2)
    expect(parseFloat(getComputedStyle(part('tabs-panel', 1)).transitionDuration)).toBeCloseTo(0.5, 2)
  })

  it.each([
    ['never mode', undefined, 'never'],
    ['animation={false}', false, 'auto']
  ] as const)('switches at once with %s', async (_name, animation, motion) => {
    renderInBrowser(<Tabs items={items} animation={animation} />, motion)

    await userEvent.click(tab(2))

    expect(part('tabs').getAnimations({ subtree: true })).toEqual([])
    expect(isUnder(part('tabs-indicator'), tab(2))).toBe(true)
    expect(getComputedStyle(part('tabs-panel', 2)).opacity).toBe('1')
  })

  it('stops sliding the indicator under reduced motion but still fades the panel', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<Tabs items={items} />, 'auto')
    const started = watchTransitions(part('tabs-panel', 1))
    const slid = watchTransitions(part('tabs-indicator'))

    await userEvent.click(tab(1))

    expect(getComputedStyle(part('tabs-indicator')).transitionProperty).toBe('none')
    await expect.poll(() => started).toContain('opacity')
    expect(slid).toEqual([])
    expect(isUnder(part('tabs-indicator'), tab(1))).toBe(true)
  })
})

describe('Tabs in forced colors', () => {
  const run = unlessWebkit('forcedColors') ? it : it.skip

  run('keeps the indicator visible against the page so the selected tab still shows', async () => {
    renderInBrowser(<Tabs items={items} />)

    await setForcedColors('active')
    const probe = document.createElement('div')

    probe.style.backgroundColor = 'Canvas'
    document.body.append(probe)
    const canvas = getComputedStyle(probe).backgroundColor
    probe.remove()
    const indicator = getComputedStyle(part('tabs-indicator'))

    expect(indicator.borderBottomStyle).toBe('solid')
    expect(parseFloat(indicator.borderBottomWidth)).toBeGreaterThanOrEqual(2)
    expect(contrastRatio(indicator.borderBottomColor, canvas)).toBeGreaterThanOrEqual(3)
  })
})
