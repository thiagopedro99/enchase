import { afterEach, describe, expect, it } from 'vitest'

import Alert from '@components/common/Alert/index.tsx'
import Badge from '@components/common/Badge/index.tsx'
import DatePicker from '@components/common/DatePicker/index.tsx'
import Table from '@components/common/Table/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'
import { onRoot, parts } from '../support/hookProbes.ts'

import type { TableColumn } from '@components/common/Table/types.ts'

const sides = ['top', 'right', 'bottom', 'left'] as const

const bordersOf = (element: Element) => {
  const style = getComputedStyle(element)

  return {
    width: sides.map((side) => style.getPropertyValue(`border-${side}-width`)),
    style: sides.map((side) => style.getPropertyValue(`border-${side}-style`)),
    color: sides.map((side) => style.getPropertyValue(`border-${side}-color`))
  }
}

const all = (value: string) => [value, value, value, value]

const absent = (color: string) => ({ width: all('0px'), style: all('none'), color: all(color) })

const variants = ['neutral', 'primary', 'success', 'warning', 'error', 'info'] as const

const alertVariants = ['info', 'success', 'warning', 'error'] as const

const textOf = {
  light: { neutral: 'rgb(27, 27, 33)', primary: 'rgb(20, 16, 110)', success: 'rgb(0, 33, 10)', warning: 'rgb(43, 23, 0)', error: 'rgb(65, 0, 2)', info: 'rgb(0, 30, 49)' },
  dark: { neutral: 'rgb(229, 225, 236)', primary: 'rgb(225, 224, 255)', success: 'rgb(183, 242, 191)', warning: 'rgb(255, 221, 181)', error: 'rgb(255, 218, 214)', info: 'rgb(201, 230, 255)' }
}

const headerOf = {
  light: { text: 'rgb(70, 70, 79)', line: 'rgb(199, 197, 208)' },
  dark: { text: 'rgb(200, 197, 208)', line: 'rgb(70, 70, 79)' }
}

const calendarText = { light: 'rgb(27, 27, 33)', dark: 'rgb(229, 225, 236)' }

const columns: TableColumn<{ id: string; name: string; city: string }>[] = [
  { key: 'id', header: 'Id', rowHeader: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'city', header: 'City' }
]

const rows = [{ id: '1', name: 'Ana', city: 'Recife' }]

const tables = (
  <>
    <Table columns={columns} rows={rows} ariaLabel="Plain" />
    <Table columns={columns} rows={rows} ariaLabel="Small and selectable" size="sm" selectedKeys={[]} onSelectedKeysChange={() => undefined} />
    <Table columns={columns} rows={rows} ariaLabel="Sticky" stickyHeader />
  </>
)

const headers = () => [...document.body.querySelectorAll<HTMLElement>('thead th')]

const calendar = () => document.body.querySelector('[data-slot="date-picker-calendar-header"]') as HTMLElement

const opened = () => expect.poll(() => document.body.querySelector('[data-slot="date-picker-calendar-header"]')).toBeTruthy()

afterEach(() => {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('dir')
})

describe.each(['light', 'dark'] as const)('the borders of today, with no border hook set, in the %s mode', (mode) => {
  it('has no border on a badge of any variant and size: no width, no style, and the color of its text, as the initial value gives', () => {
    renderInBrowser(
      <>
        {variants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
        {variants.map((variant) => (
          <Badge key={`small-${variant}`} variant={variant} size="sm">
            {variant}
          </Badge>
        ))}
      </>,
      'never',
      mode
    )

    expect(parts('badge').map(bordersOf)).toEqual([...variants, ...variants].map((variant) => absent(textOf[mode][variant])))
  })

  it('has only the line under the cell on every header cell of a table: nothing at the sides or above', () => {
    renderInBrowser(tables, 'never', mode)
    const { text, line } = headerOf[mode]

    expect(headers().length).toBe(10)
    expect(headers().map(bordersOf)).toEqual(
      headers().map(() => ({ width: ['0px', '0px', '1px', '0px'], style: ['none', 'none', 'solid', 'none'], color: [text, text, line, text] }))
    )
  })

  it('has no border on the header of the calendar', async () => {
    renderInBrowser(<DatePicker label="Date" defaultOpen />, 'never', mode)
    await opened()

    expect(bordersOf(calendar())).toEqual(absent(calendarText[mode]))
  })

  it('keeps the border of zero width and solid style on an alert, with a transparent color', () => {
    renderInBrowser(
      <>
        {alertVariants.map((variant) => (
          <Alert key={variant} variant={variant}>
            {variant}
          </Alert>
        ))}
      </>,
      'never',
      mode
    )

    expect(parts('alert').map(bordersOf)).toEqual(alertVariants.map(() => ({ width: all('0px'), style: all('solid'), color: all('rgba(0, 0, 0, 0)') })))
  })
})

describe('the border of the badge from the hooks', () => {
  const badges = (
    <>
      {variants.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </>
  )

  it('draws the border all around with the width, the style and the color of each variant', () => {
    onRoot({
      '--enchase-badge-border-width': '3px',
      '--enchase-badge-border-style': 'solid',
      ...Object.fromEntries(variants.map((variant, index) => [`--enchase-badge-border-color-${variant}`, `rgb(${index + 1}, 2, 3)`]))
    })
    renderInBrowser(badges)

    expect(parts('badge').map(bordersOf)).toEqual(variants.map((_, index) => ({ width: all('3px'), style: all('solid'), color: all(`rgb(${index + 1}, 2, 3)`) })))
  })

  it('does not draw the border with only the width: the style decides', () => {
    onRoot({ '--enchase-badge-border-width': '3px' })
    renderInBrowser(badges)

    expect(parts('badge').map(bordersOf)).toEqual(variants.map((variant) => absent(textOf.light[variant])))
  })

  it('draws no width with only the style: the width is zero until a hook gives one', () => {
    onRoot({ '--enchase-badge-border-style': 'solid' })
    renderInBrowser(badges)

    expect(parts('badge').map(bordersOf)).toEqual(variants.map((variant) => ({ width: all('0px'), style: all('solid'), color: all(textOf.light[variant]) })))
  })

  it('draws the border in the color of the text of the variant when only the width and the style are set', () => {
    onRoot({ '--enchase-badge-border-width': '2px', '--enchase-badge-border-style': 'dashed' })
    renderInBrowser(badges)

    expect(parts('badge').map(bordersOf)).toEqual(variants.map((variant) => ({ width: all('2px'), style: all('dashed'), color: all(textOf.light[variant]) })))
  })

  it('changes one variant and leaves the others with the color of their text', () => {
    onRoot({ '--enchase-badge-border-width': '1px', '--enchase-badge-border-style': 'solid', '--enchase-badge-border-color-success': 'rgb(9, 8, 7)' })
    renderInBrowser(badges)

    expect(parts('badge').map((badge) => bordersOf(badge).color[0])).toEqual(variants.map((variant) => (variant === 'success' ? 'rgb(9, 8, 7)' : textOf.light[variant])))
  })
})

describe('the separator of the header of the table from the hooks', () => {
  const separator = { '--enchase-table-header-border-width-end': '3px', '--enchase-table-header-border-style-end': 'solid', '--enchase-table-header-border-color-end': 'rgb(1, 2, 3)' }

  it('draws a line at the end of every header cell but the last, and nowhere else', () => {
    onRoot(separator)
    renderInBrowser(<Table columns={columns} rows={rows} ariaLabel="Plain" />)

    const cells = headers().map(bordersOf)

    expect(cells.map((cell) => [cell.width[1], cell.style[1], cell.color[1]])).toEqual([
      ['3px', 'solid', 'rgb(1, 2, 3)'],
      ['3px', 'solid', 'rgb(1, 2, 3)'],
      ['0px', 'none', headerOf.light.text]
    ])
    expect(cells.map((cell) => [cell.width[0], cell.width[2], cell.width[3]])).toEqual([
      ['0px', '1px', '0px'],
      ['0px', '1px', '0px'],
      ['0px', '1px', '0px']
    ])
  })

  it('draws it on the left in a right-to-left page', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    onRoot(separator)
    renderInBrowser(<Table columns={columns} rows={rows} ariaLabel="Plain" />)

    expect(headers().map((header) => bordersOf(header).width)).toEqual([
      ['0px', '0px', '1px', '3px'],
      ['0px', '0px', '1px', '3px'],
      ['0px', '0px', '1px', '0px']
    ])
  })

  it('does not draw it with only the width: the style decides', () => {
    onRoot({ '--enchase-table-header-border-width-end': '3px' })
    renderInBrowser(<Table columns={columns} rows={rows} ariaLabel="Plain" />)

    expect(headers().map((header) => [bordersOf(header).width[1], bordersOf(header).style[1]])).toEqual([
      ['0px', 'none'],
      ['0px', 'none'],
      ['0px', 'none']
    ])
  })

  it('draws no width with only the style: the width is zero until a hook gives one', () => {
    onRoot({ '--enchase-table-header-border-style-end': 'solid' })
    renderInBrowser(<Table columns={columns} rows={rows} ariaLabel="Plain" />)

    expect(headers().map((header) => [bordersOf(header).width[1], bordersOf(header).style[1]])).toEqual([
      ['0px', 'solid'],
      ['0px', 'solid'],
      ['0px', 'none']
    ])
  })

  it('takes the color of the text of the header when only the width and the style are set', () => {
    onRoot({ '--enchase-table-header-border-width-end': '2px', '--enchase-table-header-border-style-end': 'solid' })
    renderInBrowser(<Table columns={columns} rows={rows} ariaLabel="Plain" />)

    expect(bordersOf(headers()[0]).color[1]).toBe(headerOf.light.text)
  })

  it('also separates the sortable and the selection cells', () => {
    onRoot(separator)
    renderInBrowser(<Table columns={columns} rows={rows} ariaLabel="Selectable" selectedKeys={[]} onSelectedKeysChange={() => undefined} />)

    expect(headers().map((header) => bordersOf(header).width[1])).toEqual(['3px', '3px', '3px', '0px'])
  })
})

describe('the border of the header of the calendar from the hooks', () => {
  it('draws the line under the header with the width, the style and the color of the hooks, and only under it', async () => {
    onRoot({ '--enchase-date-picker-calendar-header-border-width': '3px', '--enchase-date-picker-calendar-header-border-style': 'solid', '--enchase-date-picker-calendar-header-border-color': 'rgb(1, 2, 3)' })
    renderInBrowser(<DatePicker label="Date" defaultOpen />)
    await opened()

    expect(bordersOf(calendar())).toEqual({
      width: ['0px', '0px', '3px', '0px'],
      style: ['none', 'none', 'solid', 'none'],
      color: [calendarText.light, calendarText.light, 'rgb(1, 2, 3)', calendarText.light]
    })
  })

  it('draws no width with only the style: the width is zero until a hook gives one', async () => {
    onRoot({ '--enchase-date-picker-calendar-header-border-style': 'solid' })
    renderInBrowser(<DatePicker label="Date" defaultOpen />)
    await opened()

    expect(bordersOf(calendar())).toEqual({ width: all('0px'), style: ['none', 'none', 'solid', 'none'], color: all(calendarText.light) })
  })

  it('does not draw the line with only the width: the style decides', async () => {
    onRoot({ '--enchase-date-picker-calendar-header-border-width': '3px' })
    renderInBrowser(<DatePicker label="Date" defaultOpen />)
    await opened()

    expect(bordersOf(calendar())).toEqual(absent(calendarText.light))
  })
})
