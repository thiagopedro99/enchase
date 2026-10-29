import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { CardButton } from '@components/common/CardButton/index.tsx'
import { CardLink } from '@components/common/CardLink/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Grid } from '@components/common/Grid/index.tsx'
import { builtInStyleEntries } from '@tests/shared/fixtures/styles.ts'
import { at, becomes, hooked } from '../../../support/hookProbes.ts'
import { letGoOfTheMouse, pressMouse } from '../../../support/pointer.ts'
import { setReducedMotion } from '../../../support/media.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { frames } from '../../../support/settle.ts'

import type { CardProps } from '@components/common/Card/types.ts'
import type { ReactElement } from 'react'

type Surface = Pick<CardProps, 'variant' | 'padding' | 'animation'>

const tiles: [slot: string, make: (surface?: Surface, extra?: { disabled?: boolean; id?: string }) => ReactElement][] = [
  [
    'card-button',
    (surface, extra) => (
      <CardButton {...surface} disabled={extra?.disabled} data-testid={extra?.id ?? 'tile'}>
        <span>Skills</span> <span>Twelve tools</span>
      </CardButton>
    )
  ],
  [
    'card-link',
    (surface, extra) => (
      <CardLink {...surface} href="/skills" data-testid={extra?.id ?? 'tile'}>
        <span>Skills</span> <span>Twelve tools</span>
      </CardLink>
    )
  ]
]

const added: HTMLStyleElement[] = []

const addStyle = (css: string, where: 'start' | 'end' = 'end') => {
  const style = document.createElement('style')

  style.textContent = css
  if (where === 'start') document.head.prepend(style)
  else document.head.append(style)
  added.push(style)
}

afterEach(async () => {
  await letGoOfTheMouse()
  added.splice(0).forEach((style) => style.remove())
  document.documentElement.removeAttribute('style')
  await setReducedMotion('no-preference')
})

const element = (id: string) => page.getByTestId(id).element() as HTMLElement

const computed = (id: string, pseudo?: string) => getComputedStyle(element(id), pseudo)

const readings = (id: string, properties: string[]) => Object.fromEntries(properties.map((property) => [property, computed(id).getPropertyValue(property)]))

const sides = (prefix: string, suffix: string) => ['top', 'right', 'bottom', 'left'].map((side) => `${prefix}-${side}${suffix}`)

const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => `border-${corner}-radius`)

const surface = ['display', 'inline-size', 'background-color', 'box-shadow', ...sides('border', '-width'), ...sides('padding', ''), ...sides('margin', ''), ...corners]

const text = ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color', 'text-align', 'text-decoration-line']

describe.each(builtInStyleEntries)('a clickable tile in the %s style, in a real browser', (name, style) => {
  it('fades a disabled CardButton by the opacity that the style asks for', () => {
    renderInBrowser(
      <CardButton disabled data-testid="tile">
        Soon
      </CardButton>,
      'never',
      'light',
      { style }
    )

    expect(computed('tile').opacity).toBe(name === 'shadcn' ? '0.5' : '0.38')
  })

  describe.each(tiles)('%s', (slot, make) => {
    it.each(['default', 'elevated', 'outlined'] as const)('has the surface of a %s Card: its background, border, radius, padding and shadow', (variant) => {
      renderInBrowser(
        <>
          <Card variant={variant} data-testid="card">
            <span>Skills</span> <span>Twelve tools</span>
          </Card>
          {make({ variant })}
        </>,
        'never',
        'light',
        { style }
      )

      expect(readings('tile', surface)).toEqual(readings('card', surface))
      expect(readings('tile', text)).toEqual(readings('card', text))

      if (variant === 'outlined') expect(readings('tile', ['border-top-style', 'border-top-color'])).toEqual(readings('card', ['border-top-style', 'border-top-color']))
    })

    it('takes the padding, the radius and the background of a Card from the hooks of the Card', () => {
      hooked(
        [
          ['--enchase-card-radius', '13px', at(slot), 'border-top-left-radius'],
          ['--enchase-card-padding', '19px', at(slot), 'padding-top'],
          ['--enchase-card-background-default', 'rgb(1, 2, 3)', at(slot), 'background-color']
        ],
        make()
      )
    })
  })
})

describe.each(tiles)('the states of %s in a real browser', (slot, make) => {
  it('draws a focus ring of 2px or more that is 2px away from the border, and shows the pressed layer while it is focused', async () => {
    renderInBrowser(make())
    await userEvent.tab()
    const tile = computed('tile')

    expect(element('tile')).toBe(document.activeElement)
    expect(tile.outlineStyle).not.toBe('none')
    expect(parseFloat(tile.outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(tile.outlineOffset).toBe('2px')

    await becomes(at(slot), 'opacity', '0.1', '::after')
  })

  it('lays the hover layer of the tokens over a hovered tile and takes it away when the pointer leaves', async () => {
    renderInBrowser(make())

    expect(computed('tile', '::after').opacity).toBe('0')

    await userEvent.hover(element('tile'))
    await becomes(at(slot), 'opacity', '0.08', '::after')

    await userEvent.unhover(element('tile'))
    await becomes(at(slot), 'opacity', '0', '::after')
  })

  it('lays the pressed layer of the tokens over a pressed tile', async () => {
    renderInBrowser(make())
    await pressMouse(`[data-slot="${slot}"]`)

    await becomes(at(slot), 'opacity', '0.1', '::after')
  })

  it('takes the strength of the layers from the state tokens', async () => {
    document.documentElement.style.setProperty('--enchase-state-hover', '0.5')
    renderInBrowser(make())
    await userEvent.hover(element('tile'))

    await becomes(at(slot), 'opacity', '0.5', '::after')
  })

  it('covers the tile and its corners with the layer, and lets the pointer through it', () => {
    renderInBrowser(make({ variant: 'outlined' }))
    const layer = computed('tile', '::after')

    expect(layer.position).toBe('absolute')
    expect(layer.pointerEvents).toBe('none')
    expect(layer.borderTopLeftRadius).toBe(computed('tile').borderTopLeftRadius)
    expect(layer.backgroundColor).toBe(computed('tile').color)
  })

  it('lifts an elevated tile with a fine pointer, and does not lift it under reduced motion', async () => {
    renderInBrowser(make({ variant: 'elevated' }), 'auto')

    expect(computed('tile').transform).toBe('none')

    await userEvent.hover(element('tile'))
    await expect.poll(() => computed('tile').transform).not.toBe('none')

    await userEvent.unhover(element('tile'))
    await setReducedMotion('reduce')
    await userEvent.hover(element('tile'))
    await frames(4)

    expect(computed('tile').transform).toBe('none')
  })

  it('has a target of 24px or more even when it holds nothing', () => {
    renderInBrowser(
      slot === 'card-button' ? (
        <CardButton padding="0" data-testid="tile" />
      ) : (
        <CardLink href="/x" padding="0" data-testid="tile" />
      )
    )
    const box = element('tile').getBoundingClientRect()

    expect(box.height).toBeGreaterThanOrEqual(24)
    expect(box.width).toBeGreaterThanOrEqual(24)
  })

  it('lets the caller className win on the size, the display, the alignment and the cursor even when its css loads first', () => {
    addStyle('.mine { inline-size: 200px; block-size: 90px; display: flex; text-align: center; cursor: default; padding: 5px; border-radius: 3px; background-color: rgb(1, 2, 3); }', 'start')
    renderInBrowser(
      slot === 'card-button' ? (
        <CardButton className="mine" data-testid="tile">
          a
        </CardButton>
      ) : (
        <CardLink href="/x" className="mine" data-testid="tile">
          a
        </CardLink>
      )
    )
    const tile = computed('tile')

    expect(tile.width).toBe('200px')
    expect(tile.height).toBe('90px')
    expect(tile.display).toBe('flex')
    expect(tile.textAlign).toBe('center')
    expect(tile.cursor).toBe('default')
    expect(tile.paddingTop).toBe('5px')
    expect(tile.borderTopLeftRadius).toBe('3px')
    expect(tile.backgroundColor).toBe('rgb(1, 2, 3)')
  })

  it('lets the caller className win on the color and the font when its css loads after the library', () => {
    addStyle('.mine { color: rgb(1, 2, 3); font-size: 21px; font-weight: 700; }', 'end')
    renderInBrowser(
      slot === 'card-button' ? (
        <CardButton className="mine" data-testid="tile">
          a
        </CardButton>
      ) : (
        <CardLink href="/x" className="mine" data-testid="tile">
          a
        </CardLink>
      )
    )
    const tile = computed('tile')

    expect(tile.color).toBe('rgb(1, 2, 3)')
    expect(tile.fontSize).toBe('21px')
    expect(tile.fontWeight).toBe('700')
  })

  it('is a block that fills its container and takes the text of its surroundings, not the one of a button or a link', () => {
    addStyle('a { color: rgb(0, 0, 255); text-decoration: underline; font-size: 30px; font-weight: 700 }')
    renderInBrowser(<div style={{ inlineSize: 321, fontFamily: 'monospace', fontSize: 17, fontWeight: 400, color: 'rgb(9, 9, 9)', letterSpacing: '2px' }}>{make()}</div>)
    const tile = computed('tile')

    expect(tile.display).toBe('block')
    expect(tile.width).toBe('321px')
    expect(tile.cursor).toBe('pointer')
    expect(tile.fontFamily).toContain('monospace')
    expect(tile.fontSize).toBe('17px')
    expect(tile.fontWeight).toBe('400')
    expect(tile.letterSpacing).toBe('2px')
    expect(tile.color).toBe('rgb(9, 9, 9)')
    expect(tile.textAlign).toBe('start')
    expect(tile.textDecorationLine).toBe('none')
  })
})

describe('a disabled CardButton in a real browser', () => {
  const disabled = () => renderInBrowser(<CardButton disabled variant="elevated" data-testid="tile">Soon</CardButton>, 'auto')

  it('fades to the content opacity of the state tokens and shows that it does not work', () => {
    disabled()

    expect(computed('tile').opacity).toBe('0.38')
    expect(computed('tile').cursor).toBe('not-allowed')
    expect(computed('tile').boxShadow).toBe('none')
  })

  it('takes the opacity from the hook of the Card', () => {
    hooked([['--enchase-card-opacity-disabled', '0.6', at('card-button'), 'opacity']], <CardButton disabled>Soon</CardButton>)
  })

  it('does not take the hover layer, the shadow or the lift of a hovered tile', async () => {
    disabled()
    await userEvent.hover(element('tile'), { force: true })
    await frames(8)

    expect(computed('tile', '::after').opacity).toBe('0')
    expect(computed('tile').transform).toBe('none')
    expect(computed('tile').boxShadow).toBe('none')
  })
})

describe('a CardLink against the styles of a page in a real browser', () => {
  const styled = 'a { color: rgb(0, 0, 255); text-decoration: underline; } a:visited { color: rgb(128, 0, 128); } a:hover { color: rgb(255, 0, 0); text-decoration: underline; }'

  it('stays without underline and with the color of its surroundings when the page styles every link', async () => {
    addStyle(styled)
    renderInBrowser(
      <div style={{ color: 'rgb(9, 9, 9)' }}>
        <CardLink href="/skills" data-testid="tile">
          Skills
        </CardLink>
      </div>
    )

    expect(computed('tile').textDecorationLine).toBe('none')
    expect(computed('tile').color).toBe('rgb(9, 9, 9)')

    await userEvent.hover(element('tile'))
    await frames(4)

    expect(computed('tile').textDecorationLine).toBe('none')
    expect(computed('tile').color).toBe('rgb(9, 9, 9)')
  })

  it('keeps the color of its surroundings once the address has been visited', () => {
    addStyle(styled)
    renderInBrowser(
      <div style={{ color: 'rgb(9, 9, 9)' }}>
        <CardLink href="/" data-testid="tile">
          Home
        </CardLink>
      </div>
    )

    expect(computed('tile').color).toBe('rgb(9, 9, 9)')
  })
})

describe('tiles inside a list in a real browser', () => {
  it.each(tiles)('makes the %s fill the height of its li, which fills the row of the grid', (_, make) => {
    renderInBrowser(
      <Grid as="ul" columns={3} data-testid="grid">
        {[20, 120, 60].map((height) => (
          <li key={height}>
            {make(undefined, { id: `tile-${height}` })}
            <span style={{ display: 'none' }}>{height}</span>
          </li>
        ))}
      </Grid>
    )
    const items = [...document.querySelectorAll('[data-testid="grid"] > li')]
    const tiles = items.map((item) => item.firstElementChild as HTMLElement)

    expect(new Set(items.map((item) => Math.round(item.getBoundingClientRect().height))).size).toBe(1)
    expect(tiles.map((tile, index) => Math.round(tile.getBoundingClientRect().height) - Math.round(items[index].getBoundingClientRect().height))).toEqual([0, 0, 0])
  })

  it('keeps the tile of a CardLink and of a CardButton the same size in the same cell', () => {
    renderInBrowser(
      <Grid columns={2}>
        <div>{tiles[0][1](undefined, { id: 'button' })}</div>
        <div>{tiles[1][1](undefined, { id: 'link' })}</div>
      </Grid>
    )

    expect(element('button').getBoundingClientRect().width).toBe(element('link').getBoundingClientRect().width)
    expect(element('button').getBoundingClientRect().height).toBe(element('link').getBoundingClientRect().height)
  })
})
