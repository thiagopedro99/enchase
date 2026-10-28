import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { CheckboxGroup } from '@components/common/CheckboxGroup/index.tsx'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { renderInBrowser } from './harness.tsx'
import { onRoot, part, parts, style } from './hookProbes.ts'

const topics = [
  { value: 'news', label: 'Novidades' },
  { value: 'offers', label: 'Ofertas' },
  { value: 'events', label: 'Eventos' }
]

const surfaces = ['surface', 'background', 'surface-container-high'] as const

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const element = document.createElement('style')

  element.textContent = css
  document.head.prepend(element)
  added.push(element)
}

afterEach(() => {
  added.splice(0).forEach((element) => element.remove())
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('dir')
})

const boxes = () => [...document.body.querySelectorAll<HTMLInputElement>('[data-slot="checkbox-input"]')]

const checkedValues = () => boxes().flatMap((box) => (box.checked ? [box.value] : []))

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

describe('CheckboxGroup in a real browser', () => {
  it('is exposed as a named group with a checkbox per option', () => {
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} />)

    expect(page.getByRole('group', { name: 'Assuntos' }).element()).toBe(part('checkbox-group'))
    expect(page.getByRole('checkbox').elements()).toHaveLength(3)
    expect(page.getByRole('checkbox', { name: 'Ofertas' }).element()).toBe(boxes()[1])
  })

  it.each(['light', 'dark'] as const)('keeps the boxes and the texts readable in the %s theme', (mode) => {
    renderInBrowser(
      <>
        <CheckboxGroup label="Assuntos" options={topics} defaultValue={['news']} helperText="Dá para mudar" />
        <CheckboxGroup label="Erro" options={topics} error="Escolha um" />
      </>,
      'never',
      mode
    )

    for (const name of surfaces) {
      expect(contrastRatio(style('checkbox-box', 1).borderTopColor, surface(name)), `unchecked box on ${name}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(style('checkbox-box', 0).borderTopColor, surface(name)), `checked box on ${name}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(style('checkbox-box', 3).borderTopColor, surface(name)), `invalid box on ${name}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(style('checkbox-group-legend').color, surface(name)), `legend on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(style('checkbox-label').color, surface(name)), `label on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(style('checkbox-group-helper').color, surface(name)), `helper on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(style('checkbox-group-error').color, surface(name)), `error on ${name}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('draws the check mark only on the checked options', () => {
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} defaultValue={['offers']} />)
    const mark = (index: number) => getComputedStyle(part('checkbox-box', index).firstElementChild as HTMLElement).opacity

    expect([mark(0), mark(1), mark(2)]).toEqual(['0', '1', '0'])
  })

  it('moves through the checkboxes with Tab and checks several of them with Space', async () => {
    renderInBrowser(
      <>
        <CheckboxGroup label="Assuntos" options={topics} />
        <button>Depois</button>
      </>
    )

    await userEvent.tab()
    expect(document.activeElement).toBe(boxes()[0])

    await userEvent.keyboard(' ')
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect(document.activeElement).toBe(boxes()[2])
    expect(checkedValues()).toEqual(['news', 'events'])

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Depois' }).element())
  })

  it('does not move the focus with the arrow keys', async () => {
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')

    expect(document.activeElement).toBe(boxes()[0])
    expect(checkedValues()).toEqual([])
  })

  it('checks and unchecks with a pointer on the box as well as on the label', async () => {
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} />)

    await userEvent.click(part('checkbox-box', 1))
    await userEvent.click(page.getByText('Eventos'))

    expect(checkedValues()).toEqual(['offers', 'events'])

    await userEvent.click(page.getByText('Ofertas'))

    expect(checkedValues()).toEqual(['events'])
  })

  it('does not change anything when the group is disabled', async () => {
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} disabled defaultValue={['news']} />)

    await userEvent.click(page.getByText('Ofertas'), { force: true })

    expect(checkedValues()).toEqual(['news'])
    expect(style('checkbox-box').cursor).toBe('not-allowed')
    expect(style('checkbox-label').cursor).toBe('not-allowed')
  })

  it('shows a visible focus ring on the box of the focused option when reached by keyboard', async () => {
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} defaultValue={['offers']} />)

    await userEvent.tab()
    await userEvent.tab()
    const ring = style('checkbox-box', 1)

    expect(document.activeElement).toBe(boxes()[1])
    expect(ring.outlineStyle).toBe('solid')
    expect(parseFloat(ring.outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(style('checkbox-box', 0).outlineStyle).toBe('none')

    for (const name of surfaces) expect(contrastRatio(ring.outlineColor, surface(name)), name).toBeGreaterThanOrEqual(3)
  })

  it('keeps every option at least 24 by 24 px', () => {
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} />)

    for (const option of parts('checkbox')) {
      const box = option.getBoundingClientRect()

      expect(box.width).toBeGreaterThanOrEqual(24)
      expect(box.height).toBeGreaterThanOrEqual(24)
    }
  })

  it('stacks the options by default and puts them side by side when horizontal', () => {
    renderInBrowser(
      <>
        <CheckboxGroup label="Vertical" options={topics} />
        <CheckboxGroup label="Horizontal" options={topics} orientation="horizontal" />
      </>
    )
    const top = (index: number) => parts('checkbox')[index].getBoundingClientRect().top

    expect(top(1)).toBeGreaterThan(top(0))
    expect(top(4)).toBeCloseTo(top(3), 0)
    expect(parts('checkbox')[4].getBoundingClientRect().left).toBeGreaterThan(parts('checkbox')[3].getBoundingClientRect().right)
  })

  it('wraps a horizontal group inside a narrow container without overflowing', () => {
    renderInBrowser(
      <div style={{ inlineSize: 180 }}>
        <CheckboxGroup label="Assuntos" options={topics} orientation="horizontal" />
      </div>
    )
    const container = part('checkbox-group').parentElement as HTMLElement

    expect(parts('checkbox')[2].getBoundingClientRect().top).toBeGreaterThan(parts('checkbox')[0].getBoundingClientRect().top)
    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
  })

  it('breaks an unbreakable legend, label and helper text inside a narrow container', () => {
    const word = 'Benachrichtigungseinstellungsverwaltungsseite'

    renderInBrowser(
      <div style={{ inlineSize: 140 }}>
        <CheckboxGroup label={word} options={[{ value: 'a', label: word }]} helperText={word} />
        <CheckboxGroup label={word} options={[{ value: 'a', label: word }]} error={word} />
      </div>
    )
    const container = part('checkbox-group').parentElement as HTMLElement

    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
    expect(part('checkbox-group', 0).getBoundingClientRect().width).toBeLessThanOrEqual(140)
  })

  it('starts the horizontal row on the right in right-to-left text', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} orientation="horizontal" />)

    expect(parts('checkbox')[0].getBoundingClientRect().left).toBeGreaterThan(parts('checkbox')[1].getBoundingClientRect().left)
  })

  it('paints the legend and the unchecked boxes with the error color when invalid', () => {
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} error="Escolha um" defaultValue={['offers']} />)
    const error = style('checkbox-group-error').color

    expect(style('checkbox-group-legend').color).toBe(error)
    expect(style('checkbox-box', 0).borderTopColor).toBe(error)
    expect(style('checkbox-box', 1).borderTopColor).not.toBe(error)
  })

  it('lets the caller class and slot selectors win on layout even when its css loads before the library', () => {
    addStyle('.mine { max-inline-size: 150px; } [data-slot="checkbox-group-options"] { gap: 13px; } [data-slot="checkbox"] { min-block-size: 64px; } [data-slot="checkbox-group-legend"] { margin-block-end: 21px; }')
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} className="mine" />)

    expect(part('checkbox-group').getBoundingClientRect().width).toBeLessThanOrEqual(150)
    expect(style('checkbox-group-options').rowGap).toBe('13px')
    expect(style('checkbox').minHeight).toBe('64px')
    expect(style('checkbox-group-legend').marginBlockEnd).toBe('21px')
  })
})

describe('CheckboxGroup from the hooks', () => {
  it('takes the type, the color and the margin of the legend from their hooks', () => {
    onRoot({
      '--enchase-checkbox-group-legend-font-size': '19px',
      '--enchase-checkbox-group-legend-font-weight': '650',
      '--enchase-checkbox-group-legend-color': 'rgb(1, 2, 3)',
      '--enchase-checkbox-group-legend-margin-block-end': '23px'
    })
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} />)
    const legend = style('checkbox-group-legend')

    expect([legend.fontSize, legend.fontWeight, legend.color, legend.marginBottom]).toEqual(['19px', '650', 'rgb(1, 2, 3)', '23px'])
  })

  it('takes the color of the legend of an invalid group from its hook', () => {
    onRoot({ '--enchase-checkbox-group-legend-color-invalid': 'rgb(4, 5, 6)' })
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} error="Escolha um" />)

    expect(style('checkbox-group-legend').color).toBe('rgb(4, 5, 6)')
  })

  it('takes the gap of the options, vertical and horizontal, from their hooks', () => {
    onRoot({ '--enchase-checkbox-group-options-gap': '11px', '--enchase-checkbox-group-options-column-gap-horizontal': '29px' })
    renderInBrowser(
      <>
        <CheckboxGroup label="Vertical" options={topics} />
        <CheckboxGroup label="Horizontal" options={topics} orientation="horizontal" />
      </>
    )

    expect(style('checkbox-group-options', 0).rowGap).toBe('11px')
    expect(style('checkbox-group-options', 1).columnGap).toBe('29px')
  })

  it('takes the type, the color and the margin of the helper text and of the error from their hooks', () => {
    onRoot({
      '--enchase-checkbox-group-helper-font-size': '15px',
      '--enchase-checkbox-group-helper-color': 'rgb(7, 8, 9)',
      '--enchase-checkbox-group-helper-margin-block-start': '9px',
      '--enchase-checkbox-group-error-font-size': '17px',
      '--enchase-checkbox-group-error-font-weight': '700',
      '--enchase-checkbox-group-error-color': 'rgb(10, 11, 12)',
      '--enchase-checkbox-group-error-margin-block-start': '12px'
    })
    renderInBrowser(
      <>
        <CheckboxGroup label="Ajuda" options={topics} helperText="Dica" />
        <CheckboxGroup label="Erro" options={topics} error="Escolha um" />
      </>
    )
    const helper = style('checkbox-group-helper')
    const error = style('checkbox-group-error')

    expect([helper.fontSize, helper.color, helper.marginTop]).toEqual(['15px', 'rgb(7, 8, 9)', '9px'])
    expect([error.fontSize, error.fontWeight, error.color, error.marginTop]).toEqual(['17px', '700', 'rgb(10, 11, 12)', '12px'])
  })

  it('takes the border of an unchecked invalid box from its hook', () => {
    onRoot({ '--enchase-checkbox-box-border-color-invalid': 'rgb(13, 14, 15)' })
    renderInBrowser(<CheckboxGroup label="Assuntos" options={topics} error="Escolha um" defaultValue={['news']} />)

    expect(style('checkbox-box', 1).borderTopColor).toBe('rgb(13, 14, 15)')
    expect(style('checkbox-box', 0).borderTopColor).not.toBe('rgb(13, 14, 15)')
  })
})
