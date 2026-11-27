import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { unlessWebkit } from '../../../support/browserSkips.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { onRoot, part, parts, style } from '../../../support/hookProbes.ts'
import { setForcedColors } from '../../../support/media.ts'

const views = [
  { value: 'list', label: 'Lista' },
  { value: 'board', label: 'Quadro' },
  { value: 'calendar', label: 'Agenda' }
]

const withLockedBoard = [views[0], { ...views[1], disabled: true }, views[2]]

const surfaces = ['surface', 'background', 'surface-container-high'] as const

afterEach(async () => {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('dir')
  await setForcedColors('none')
})

const items = () => parts('segmented-control-item')

const checkedLabels = () => items().flatMap((item) => (item.getAttribute('aria-checked') === 'true' ? [item.textContent] : []))

const pressedLabels = () => items().flatMap((item) => (item.getAttribute('aria-pressed') === 'true' ? [item.textContent] : []))

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const transparent = 'rgba(0, 0, 0, 0)'

describe('SegmentedControl that chooses one in a real browser', () => {
  it('is exposed as a named radio group with a radio per option', () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} />)

    expect(page.getByRole('radiogroup', { name: 'Visão' }).element()).toBe(part('segmented-control'))
    expect(page.getByRole('radio').elements()).toHaveLength(3)
    expect(page.getByRole('radio', { name: 'Quadro' }).element()).toBe(items()[1])
  })

  it.each(['light', 'dark'] as const)('keeps the texts readable on the page and on the checked option in the %s theme', (mode) => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} defaultValue="board" />, 'never', mode)

    for (const name of surfaces) {
      expect(contrastRatio(style('segmented-control-item', 0).color, surface(name)), `option on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(style('segmented-control').borderTopColor, surface(name)), `border on ${name}`).toBeGreaterThanOrEqual(3)
    }

    expect(contrastRatio(style('segmented-control-item', 1).color, style('segmented-control-item', 1).backgroundColor), 'checked option').toBeGreaterThanOrEqual(4.5)
  })

  it('fills only the checked option and moves the fill with the choice', async () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} defaultValue="board" />)

    expect([0, 1, 2].map((index) => style('segmented-control-item', index).backgroundColor !== transparent)).toEqual([false, true, false])

    await userEvent.click(items()[2])

    await expect.poll(() => [0, 1, 2].map((index) => style('segmented-control-item', index).backgroundColor !== transparent)).toEqual([false, false, true])
    expect(checkedLabels()).toEqual(['Agenda'])
  })

  it('enters on the checked option, moves and checks with the arrow keys, and wraps around', async () => {
    renderInBrowser(
      <>
        <SegmentedControl ariaLabel="Visão" items={views} defaultValue="list" />
        <button>Depois</button>
      </>
    )

    await userEvent.tab()
    expect(document.activeElement).toBe(items()[0])

    for (const [key, expected] of [
      ['{ArrowRight}', 'Quadro'],
      ['{ArrowDown}', 'Agenda'],
      ['{ArrowRight}', 'Lista'],
      ['{ArrowLeft}', 'Agenda'],
      ['{ArrowUp}', 'Quadro'],
      ['{End}', 'Agenda'],
      ['{Home}', 'Lista']
    ]) {
      await userEvent.keyboard(key)
      expect(checkedLabels(), key).toEqual([expected])
      expect(document.activeElement?.textContent, key).toBe(expected)
    }

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Depois' }).element())
  })

  it('skips a disabled option with the arrow keys', async () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={withLockedBoard} defaultValue="list" />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(checkedLabels()).toEqual(['Agenda'])
  })

  it('inverts the arrows and starts the row on the right in right-to-left text', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} defaultValue="board" />)

    expect(items()[0].getBoundingClientRect().left).toBeGreaterThan(items()[1].getBoundingClientRect().left)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(checkedLabels()).toEqual(['Lista'])
  })

  it('checks the focused option with Space and with a pointer', async () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} />)

    await userEvent.tab()
    await userEvent.keyboard(' ')
    expect(checkedLabels()).toEqual(['Lista'])

    await userEvent.click(page.getByText('Agenda'))
    expect(checkedLabels()).toEqual(['Agenda'])
  })

  it('does not choose anything when it is disabled and shows the not-allowed cursor', async () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} defaultValue="list" disabled />)

    await userEvent.click(page.getByText('Quadro'), { force: true })

    expect(checkedLabels()).toEqual(['Lista'])
    expect(style('segmented-control-item', 1).cursor).toBe('not-allowed')
  })

  it('paints a disabled option with the disabled text color, apart from the others', () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={withLockedBoard} defaultValue="list" />)

    expect(style('segmented-control-item', 1).color).not.toBe(style('segmented-control-item', 2).color)
  })
})

describe('SegmentedControl that chooses several in a real browser', () => {
  it('is exposed as a named group of toggle buttons', () => {
    renderInBrowser(<SegmentedControl multiple ariaLabel="Dias" items={views} defaultValue={['list']} />)

    expect(page.getByRole('group', { name: 'Dias' }).element()).toBe(part('segmented-control'))
    expect(page.getByRole('button', { name: 'Lista', pressed: true }).element()).toBe(items()[0])
    expect(page.getByRole('radio').elements()).toHaveLength(0)
  })

  it('moves through the buttons with Tab, presses them with Space and does not use the arrow keys', async () => {
    renderInBrowser(<SegmentedControl multiple ariaLabel="Dias" items={views} />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(items()[0])

    await userEvent.keyboard(' ')
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect(pressedLabels()).toEqual(['Lista', 'Agenda'])
    expect([0, 1, 2].map((index) => style('segmented-control-item', index).backgroundColor !== transparent)).toEqual([true, false, true])
  })
})

describe('SegmentedControl layout in a real browser', () => {
  it('shows a visible focus ring inside the option that has the focus when reached by keyboard', async () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} defaultValue="board" />)

    await userEvent.tab()
    const ring = style('segmented-control-item', 1)
    const item = items()[1].getBoundingClientRect()
    const control = part('segmented-control').getBoundingClientRect()

    expect(document.activeElement).toBe(items()[1])
    expect(ring.outlineStyle).toBe('solid')
    expect(parseFloat(ring.outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(ring.outlineOffset).toBe('-2px')
    expect(item.top).toBeGreaterThanOrEqual(control.top)
    expect(item.bottom).toBeLessThanOrEqual(control.bottom)
    expect(style('segmented-control-item', 0).outlineStyle).toBe('none')

    for (const name of surfaces) expect(contrastRatio(ring.outlineColor, surface(name)), name).toBeGreaterThanOrEqual(3)
  })

  it.each(['sm', 'md', 'lg'] as const)('is as tall as a %s button', (size) => {
    renderInBrowser(
      <>
        <SegmentedControl ariaLabel="Visão" items={views} size={size} />
        <Button size={size}>Botão</Button>
      </>
    )

    expect(part('segmented-control').getBoundingClientRect().height).toBeCloseTo(page.getByRole('button', { name: 'Botão' }).element().getBoundingClientRect().height, 0)
  })

  it('keeps every option at least 24 by 24 px', () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} size="sm" />)

    for (const item of items()) {
      const box = item.getBoundingClientRect()

      expect(box.width).toBeGreaterThanOrEqual(24)
      expect(box.height).toBeGreaterThanOrEqual(24)
    }
  })

  it('draws a divider between the options and rounds the ends of the control', () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} />)

    expect(style('segmented-control-item', 0).borderInlineStartWidth).toBe('0px')
    expect(style('segmented-control-item', 1).borderInlineStartWidth).toBe('1px')
    expect(style('segmented-control-item', 2).borderInlineStartWidth).toBe('1px')
    expect(parseFloat(style('segmented-control').borderTopLeftRadius)).toBeGreaterThan(8)
    expect([style('segmented-control').overflowX, style('segmented-control').overflowY]).toEqual(['auto', 'hidden'])
  })

  it('fills the container with options of the same width when full width', () => {
    renderInBrowser(
      <div style={{ inlineSize: 420 }}>
        <SegmentedControl ariaLabel="Visão" items={views} fullWidth />
      </div>
    )
    const widths = items().map((item) => Math.round(item.getBoundingClientRect().width))

    expect(Math.round(part('segmented-control').getBoundingClientRect().width)).toBe(420)
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1)
  })

  const styleNames = ['Enchase', 'Material 2', 'Material 3', 'shadcn', 'Workbench'].map((label) => ({ value: label, label }))

  const linesOf = (item: HTMLElement) => {
    const range = document.createRange()

    range.selectNodeContents(item)

    return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size
  }

  for (const fullWidth of [false, true]) {
    it(`never breaks a label and scrolls inside a narrow container${fullWidth ? ' when full width' : ''}`, () => {
      renderInBrowser(
        <div style={{ inlineSize: 280 }}>
          <SegmentedControl ariaLabel="Estilo" items={styleNames} fullWidth={fullWidth} />
        </div>
      )
      const group = part('segmented-control')
      const container = group.parentElement as HTMLElement

      expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth)
      expect(group.getBoundingClientRect().width).toBeLessThanOrEqual(280)
      expect(group.scrollWidth).toBeGreaterThan(group.clientWidth)
      items().forEach((item) => {
        expect(linesOf(item), item.textContent ?? '').toBe(1)
        expect(item.scrollWidth, item.textContent ?? '').toBeLessThanOrEqual(item.clientWidth)
      })
    })
  }

  it('keeps one long word whole and scrolls to it', () => {
    const word = 'Benachrichtigungseinstellungsverwaltungsseite'

    renderInBrowser(
      <div style={{ inlineSize: 180 }}>
        <SegmentedControl ariaLabel="Visão" items={[{ value: 'a', label: word }, { value: 'b', label: word }]} />
      </div>
    )
    const group = part('segmented-control')
    const container = group.parentElement as HTMLElement

    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
    expect(group.getBoundingClientRect().width).toBeLessThanOrEqual(180)
    expect(linesOf(items()[0])).toBe(1)
    expect(group.scrollWidth).toBeGreaterThan(group.clientWidth)
  })

  it('brings the option that takes the focus into view', async () => {
    renderInBrowser(
      <div style={{ inlineSize: 280 }}>
        <SegmentedControl ariaLabel="Estilo" items={styleNames} defaultValue="Enchase" />
      </div>
    )
    const group = part('segmented-control')
    const inside = (item: HTMLElement) => item.getBoundingClientRect().left >= group.getBoundingClientRect().left - 1 && item.getBoundingClientRect().right <= group.getBoundingClientRect().right + 1

    expect(inside(items()[4])).toBe(false)

    await userEvent.keyboard('{Tab}{End}')

    expect(items()[4]).toHaveFocus()
    expect(inside(items()[4])).toBe(true)
    expect(window.scrollX).toBe(0)

    await userEvent.keyboard('{Home}')

    expect(inside(items()[0])).toBe(true)
  })

  it('hides its scrollbar, so the options are as tall when they overflow as when they fit', () => {
    const wide = renderInBrowser(<SegmentedControl ariaLabel="Estilo" items={styleNames} />)
    const fitting = items().map((item) => item.getBoundingClientRect().height)
    const groupHeight = part('segmented-control').getBoundingClientRect().height

    wide.unmount()
    renderInBrowser(
      <div style={{ inlineSize: 280 }}>
        <SegmentedControl ariaLabel="Estilo" items={styleNames} />
      </div>
    )
    const group = part('segmented-control')

    expect(group.scrollWidth).toBeGreaterThan(group.clientWidth)
    expect(getComputedStyle(group).scrollbarWidth).toBe('none')
    if (CSS.supports('selector(::-webkit-scrollbar)')) expect(getComputedStyle(group, '::-webkit-scrollbar').display).toBe('none')
    expect(items().map((item) => item.getBoundingClientRect().height)).toEqual(fitting)
    expect(group.getBoundingClientRect().height).toBe(groupHeight)
    expect(group.offsetHeight - group.clientHeight).toBe(parseFloat(getComputedStyle(group).borderTopWidth) + parseFloat(getComputedStyle(group).borderBottomWidth))
  })

  for (const multiple of [false, true]) {
    it(`reveals the whole option that is cut at the edge when it is clicked, and shows the next one${multiple ? ', with multiple' : ''}`, async () => {
      renderInBrowser(
        <div style={{ inlineSize: 280 }}>
          {multiple ? <SegmentedControl ariaLabel="Estilo" items={styleNames} multiple /> : <SegmentedControl ariaLabel="Estilo" items={styleNames} defaultValue="Enchase" />}
        </div>
      )
      const group = part('segmented-control')
      const box = () => group.getBoundingClientRect()
      const cut = items().findIndex((item) => item.getBoundingClientRect().left < box().right && item.getBoundingClientRect().right > box().right + 1)

      expect(cut).toBeGreaterThan(0)
      expect(cut).toBeLessThan(items().length - 1)

      await userEvent.click(items()[cut], { position: { x: 4, y: 8 } })

      expect(items()[cut].getBoundingClientRect().right).toBeLessThanOrEqual(box().right - 8)
      expect(items()[cut].getBoundingClientRect().left).toBeGreaterThanOrEqual(box().left)
      expect(items()[cut + 1].getBoundingClientRect().left).toBeLessThan(box().right - 8)
      expect(items()[cut].getAttribute(multiple ? 'aria-pressed' : 'aria-checked')).toBe('true')
      expect(window.scrollX).toBe(0)
    })
  }

  it('gives the options their own width when they do not fit in equal parts of a full width control', () => {
    renderInBrowser(
      <div style={{ inlineSize: 420 }}>
        <SegmentedControl ariaLabel="Visão" items={[views[0], { value: 'long', label: 'Uma opção bem mais comprida' }, views[2]]} fullWidth />
      </div>
    )
    const group = part('segmented-control')
    const widths = items().map((item) => Math.round(item.getBoundingClientRect().width))

    expect(Math.round(group.getBoundingClientRect().width)).toBe(420)
    expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth)
    expect(widths[1]).toBeGreaterThan(widths[0])
    expect(Math.abs(widths[0] - widths[2])).toBeLessThanOrEqual(1)
    expect(linesOf(items()[1])).toBe(1)
  })

  it('puts the icon and the word side by side with a gap', () => {
    renderInBrowser(
      <SegmentedControl
        ariaLabel="Visão"
        items={[
          {
            value: 'a',
            label: (
              <>
                <svg width="16" height="16" data-testid="icon" aria-hidden="true" />
                Texto
              </>
            )
          }
        ]}
      />
    )
    const icon = page.getByTestId('icon').element().getBoundingClientRect()
    const text = document.createRange()

    text.selectNodeContents(items()[0])

    expect(items()[0].getBoundingClientRect().height).toBeGreaterThan(16)
    expect(style('segmented-control-item').columnGap).toBe('8px')
    expect(icon.width).toBe(16)
  })
})

describe('SegmentedControl states in a real browser', () => {
  it('tints the option under the pointer, but not the checked one nor a disabled one', async () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={[views[0], views[1], { ...views[2], disabled: true }]} defaultValue="list" />)

    expect(style('segmented-control-item', 1).backgroundColor).toBe(transparent)

    await userEvent.hover(items()[1])
    await expect.poll(() => style('segmented-control-item', 1).backgroundColor).not.toBe(transparent)

    const checked = style('segmented-control-item', 0).backgroundColor

    await userEvent.hover(items()[0])
    expect(style('segmented-control-item', 0).backgroundColor).toBe(checked)

    await userEvent.hover(items()[2])
    expect(style('segmented-control-item', 2).backgroundColor).toBe(transparent)
  })

  const forcedColors = unlessWebkit('forcedColors') ? it : it.skip

  forcedColors('keeps the checked option distinguishable in forced colors', async () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} defaultValue="board" />)
    await setForcedColors('active')

    await expect.poll(() => style('segmented-control-item', 1).backgroundColor).not.toBe(style('segmented-control-item', 0).backgroundColor)
  })
})

describe('SegmentedControl from the hooks', () => {
  it('takes the border, the radius and the fill of the control from their hooks', () => {
    onRoot({
      '--enchase-segmented-control-border-width': '3px',
      '--enchase-segmented-control-border-color': 'rgb(1, 2, 3)',
      '--enchase-segmented-control-radius': '7px',
      '--enchase-segmented-control-background': 'rgb(4, 5, 6)'
    })
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} />)
    const control = style('segmented-control')

    expect([control.borderTopWidth, control.borderTopColor, control.borderTopLeftRadius, control.backgroundColor]).toEqual(['3px', 'rgb(1, 2, 3)', '7px', 'rgb(4, 5, 6)'])
  })

  it('takes the divider between the options from its hooks', () => {
    onRoot({ '--enchase-segmented-control-item-border-width': '4px', '--enchase-segmented-control-item-border-color': 'rgb(7, 8, 9)' })
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} />)

    expect([style('segmented-control-item', 1).borderInlineStartWidth, style('segmented-control-item', 1).borderInlineStartColor]).toEqual(['4px', 'rgb(7, 8, 9)'])
    expect(style('segmented-control-item', 0).borderInlineStartWidth).toBe('0px')
  })

  it('takes the colors of the option, of the checked one and of a disabled one from their hooks', () => {
    onRoot({
      '--enchase-segmented-control-item-color': 'rgb(10, 11, 12)',
      '--enchase-segmented-control-item-background-selected': 'rgb(13, 14, 15)',
      '--enchase-segmented-control-item-color-selected': 'rgb(16, 17, 18)',
      '--enchase-segmented-control-item-color-disabled': 'rgb(19, 20, 21)'
    })
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={[views[0], views[1], { ...views[2], disabled: true }]} defaultValue="board" />)

    expect(style('segmented-control-item', 0).color).toBe('rgb(10, 11, 12)')
    expect([style('segmented-control-item', 1).backgroundColor, style('segmented-control-item', 1).color]).toEqual(['rgb(13, 14, 15)', 'rgb(16, 17, 18)'])
    expect(style('segmented-control-item', 2).color).toBe('rgb(19, 20, 21)')
  })

  it('takes the type of the options from their hooks, with the size of each size from its own hook', () => {
    onRoot({
      '--enchase-segmented-control-item-font-weight': '650',
      '--enchase-segmented-control-item-line-height': '23px',
      '--enchase-segmented-control-item-font-size-sm': '11px',
      '--enchase-segmented-control-item-font-size-md': '13px',
      '--enchase-segmented-control-item-font-size-lg': '19px'
    })
    renderInBrowser(
      <>
        <SegmentedControl ariaLabel="Pequeno" items={views} size="sm" />
        <SegmentedControl ariaLabel="Médio" items={views} size="md" />
        <SegmentedControl ariaLabel="Grande" items={views} size="lg" />
      </>
    )

    expect([0, 3, 6].map((index) => style('segmented-control-item', index).fontSize)).toEqual(['11px', '13px', '19px'])
    expect([style('segmented-control-item').fontWeight, style('segmented-control-item').lineHeight]).toEqual(['650', '23px'])
  })

  it('takes the padding of the options of each size from its own hooks', () => {
    onRoot({
      '--enchase-segmented-control-item-padding-inline-sm': '5px',
      '--enchase-segmented-control-item-padding-inline-md': '9px',
      '--enchase-segmented-control-item-padding-inline-lg': '13px',
      '--enchase-segmented-control-item-padding-block-sm': '2px',
      '--enchase-segmented-control-item-padding-block-md': '3px',
      '--enchase-segmented-control-item-padding-block-lg': '4px'
    })
    renderInBrowser(
      <>
        <SegmentedControl ariaLabel="Pequeno" items={views} size="sm" />
        <SegmentedControl ariaLabel="Médio" items={views} size="md" />
        <SegmentedControl ariaLabel="Grande" items={views} size="lg" />
      </>
    )

    expect([0, 3, 6].map((index) => [style('segmented-control-item', index).paddingLeft, style('segmented-control-item', index).paddingTop])).toEqual([
      ['5px', '2px'],
      ['9px', '3px'],
      ['13px', '4px']
    ])
  })

  it('takes the gap between an icon and a word from its hook', () => {
    onRoot({ '--enchase-segmented-control-item-gap': '17px' })
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} />)

    expect(style('segmented-control-item').columnGap).toBe('17px')
  })

  it('eases the color of the options for as long as the animation says and not at all without it', () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} animation={{ tuning: { duration: 0.4 } }} />, 'auto')

    expect(style('segmented-control-item').transitionDuration.split(',').map((value) => value.trim())).toEqual(['0.4s', '0.4s'])
  })

  it('does not ease anything when the animation is off', () => {
    renderInBrowser(<SegmentedControl ariaLabel="Visão" items={views} animation={false} />, 'auto')

    expect(style('segmented-control-item').transitionDuration.split(',').map((value) => value.trim())).toEqual(['0s', '0s'])
  })
})
