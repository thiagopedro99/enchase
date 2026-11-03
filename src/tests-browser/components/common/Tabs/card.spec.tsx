import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { parseComputedColor } from '../../../support/color.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { at, expectHooks, onRoot, part, parts, setHooks, style } from '../../../support/hookProbes.ts'
import { capture } from '../../../support/pixels.ts'
import { waitForSettled } from '../../../support/settle.ts'

import type { Probe } from '../../../support/hookProbes.ts'

const items = [
  { value: 'profile', label: 'Perfil', content: <p>Dados do perfil</p> },
  { value: 'billing', label: 'Cobrança', content: <p>Dados de cobrança</p> },
  { value: 'team', label: 'Equipe', content: <p>Dados da equipe</p> }
]

const stage = (ui: React.ReactNode) => <div style={{ position: 'absolute', top: 40, left: 40, inlineSize: 420 }}>{ui}</div>

const box = (name: string, index = 0) => part(name, index).getBoundingClientRect()

const role = (name: string) => {
  const probe = document.createElement('span')

  probe.style.color = `var(--enchase-color-${name})`
  document.body.append(probe)

  const result = getComputedStyle(probe).color

  probe.remove()

  return result
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('dir')
})

describe('the line Tabs in a real browser', () => {
  it('has no box around the tabs and keeps its indicator, by default', () => {
    renderInBrowser(stage(<Tabs ariaLabel="Conta" items={items} />))

    expect(part('tabs').hasAttribute('data-variant')).toBe(false)
    expect(['top', 'right', 'bottom', 'left'].map((side) => style('tabs-tab').getPropertyValue(`border-${side}-width`))).toEqual(['0px', '0px', '0px', '0px'])
    expect(style('tabs-indicator').display).not.toBe('none')
  })
})

describe('the card Tabs in a real browser', () => {
  it('draws every tab in a box of the border color with the top corners rounded and the bottom ones square', () => {
    renderInBrowser(stage(<Tabs ariaLabel="Conta" items={items} variant="card" />))

    for (const index of [1, 2]) {
      const tab = style('tabs-tab', index)

      expect([tab.borderTopWidth, tab.borderLeftWidth, tab.borderRightWidth, tab.borderBottomWidth]).toEqual(['1px', '1px', '1px', '1px'])
      expect(tab.borderTopColor).toBe(role('border'))
      expect(parseFloat(tab.borderTopLeftRadius)).toBeGreaterThan(0)
      expect(tab.borderTopLeftRadius).toBe(tab.borderTopRightRadius)
      expect([tab.borderBottomLeftRadius, tab.borderBottomRightRadius]).toEqual(['0px', '0px'])
    }
  })

  it('has no indicator and no underline, because the box of the selected tab says which one it is', () => {
    renderInBrowser(stage(<Tabs ariaLabel="Conta" items={items} variant="card" />))

    expect(style('tabs-indicator').display).toBe('none')
    expect(getComputedStyle(part('tabs-tab', 0), '::before').content).toBe('none')
  })

  it('leaves a gap of 2px between the tabs, and does not take the gap and the inline padding of the line style', () => {
    onRoot({ '--enchase-tabs-list-gap': '32px', '--enchase-tabs-tab-padding-inline': '0px' })
    renderInBrowser(stage(<Tabs ariaLabel="Conta" items={items} variant="card" />))

    expect(Math.round(box('tabs-tab', 1).left - box('tabs-tab', 0).right)).toBe(2)
    expect(style('tabs-tab', 0).paddingLeft).toBe('16px')
  })

  it('takes the height and the block padding of the line style until its own hooks say otherwise', () => {
    onRoot({ '--enchase-tabs-tab-min-height': '60px', '--enchase-tabs-tab-padding-block': '14px' })
    renderInBrowser(stage(<Tabs ariaLabel="Conta" items={items} variant="card" />))

    expect([Math.round(box('tabs-tab', 0).height), style('tabs-tab', 0).paddingTop]).toEqual([60, '14px'])

    onRoot({ '--enchase-tabs-tab-min-height-card': '44px', '--enchase-tabs-tab-padding-block-card': '6px' })

    expect([Math.round(box('tabs-tab', 0).height), style('tabs-tab', 0).paddingTop]).toEqual([44, '6px'])
  })

  it('fills the selected tab with the page background and the others with the low container surface', () => {
    renderInBrowser(stage(<Tabs ariaLabel="Conta" items={items} variant="card" defaultValue="billing" />))

    expect(style('tabs-tab', 1).backgroundColor).toBe(role('background'))
    expect(style('tabs-tab', 0).backgroundColor).toBe(role('surface-container-low'))
    expect(style('tabs-tab', 1).borderBottomColor).toBe(style('tabs-tab', 1).backgroundColor)
    expect(style('tabs-tab', 0).borderBottomColor).toBe(role('border'))
  })

  it('joins the selected tab to the panel: the line under the tabs is cut under it and goes on under the others and after the last one', async () => {
    renderInBrowser(stage(<Tabs ariaLabel="Conta" items={items} variant="card" defaultValue="billing" />))
    await waitForSettled(() => part('tabs'))
    const colorAt = await capture()
    const list = box('tabs-list')
    const [selected, other, last] = [box('tabs-tab', 1), box('tabs-tab', 0), box('tabs-tab', 2)]
    const y = list.bottom - 0.5
    const near = (first: { r: number; g: number; b: number }, second: { r: number; g: number; b: number }) => [first.r - second.r, first.g - second.g, first.b - second.b].every((difference) => Math.abs(difference) <= 6)
    const line = parseComputedColor(role('border'))
    const page = parseComputedColor(role('background'))

    expect(near(colorAt(selected.left + selected.width / 2, y), page)).toBe(true)
    expect(near(colorAt(other.left + other.width / 2, y), line)).toBe(true)
    expect(near(colorAt(last.right + 30, y), line)).toBe(true)
    expect(Math.abs(selected.bottom - list.bottom)).toBeLessThanOrEqual(1)
    expect(Math.abs(box('tabs-panel', 1).top - list.bottom)).toBeLessThanOrEqual(1)
  })

  it('moves the box to the tab that the arrows select, and keeps the line cut under it', async () => {
    renderInBrowser(stage(<Tabs ariaLabel="Conta" items={items} variant="card" />))
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')

    expect(parts('tabs-tab').map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true'])
    expect(style('tabs-tab', 2).borderBottomColor).toBe(role('background'))
    expect(style('tabs-tab', 0).borderBottomColor).toBe(role('border'))
  })

  it('lists the tabs from the right when the text runs from right to left, with the same boxes', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(stage(<Tabs ariaLabel="Conta" items={items} variant="card" />))

    expect(box('tabs-tab', 0).left).toBeGreaterThan(box('tabs-tab', 1).left)
    expect(style('tabs-tab', 0).borderTopLeftRadius).toBe(style('tabs-tab', 0).borderTopRightRadius)
    expect(Math.round(box('tabs-tab', 0).left - box('tabs-tab', 1).right)).toBe(2)
  })

  it('keeps the texts readable on the fills of the tabs', () => {
    renderInBrowser(stage(<Tabs ariaLabel="Conta" items={items} variant="card" defaultValue="billing" />))

    expect(contrastRatio(style('tabs-tab', 0).color, style('tabs-tab', 0).backgroundColor)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(style('tabs-tab', 1).color, style('tabs-tab', 1).backgroundColor)).toBeGreaterThanOrEqual(4.5)
  })

  it('has a hook for the fill, the fill of the selected tab, the border, the corners, the gap and the inline padding', () => {
    const probes: Probe[] = [
      ['--enchase-tabs-tab-background', 'rgb(1, 2, 3)', at('tabs-tab', 0), 'background-color'],
      ['--enchase-tabs-tab-background-selected', 'rgb(4, 5, 6)', at('tabs-tab', 1), 'background-color'],
      ['--enchase-tabs-tab-border-color', 'rgb(7, 8, 9)', at('tabs-tab', 0), 'border-top-color'],
      ['--enchase-tabs-tab-radius', '11px', at('tabs-tab', 0), 'border-top-left-radius'],
      ['--enchase-tabs-list-gap-card', '9px', at('tabs-list'), 'column-gap'],
      ['--enchase-tabs-tab-padding-inline-card', '21px', at('tabs-tab', 0), 'padding-left'],
      ['--enchase-tabs-tab-padding-block-card', '13px', at('tabs-tab', 0), 'padding-top'],
      ['--enchase-tabs-tab-min-height-card', '77px', at('tabs-tab', 0), 'min-height']
    ]

    setHooks(probes)
    renderInBrowser(stage(<Tabs ariaLabel="Conta" items={items} variant="card" defaultValue="billing" />))

    expectHooks(probes)
  })
})
