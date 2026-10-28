import { render } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect } from 'vitest'
import { page } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { CardButton } from '@components/common/CardButton/index.tsx'
import { CardLink } from '@components/common/CardLink/index.tsx'
import { Calendar } from '@components/common/DatePicker/subcomponentes/Calendar/index.tsx'
import { Combobox } from '@components/common/Combobox/index.tsx'
import { Drawer } from '@components/common/Drawer/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Menu } from '@components/common/Menu/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Slider } from '@components/common/Slider/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { SidebarUser } from '@components/layout/subcomponentes/SidebarUser/index.tsx'
import { builtInStyleEntries } from '@tests/shared/fixtures/styles.ts'
import { renderInBrowser } from './harness.tsx'
import { part, parts } from './hookProbes.ts'
import { parkMouse } from './pointer.ts'
import { frames } from './settle.ts'
import { chromiumOnly } from './browserSkips.ts'
import { disableTouch, dragFinger, enableTouch, touchCapable } from './touchInput.ts'

const DrawerPage = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Filtros">
        <p>Texto</p>
      </Drawer>
    </>
  )
}

describe('touch pointer in a real browser', () => {
  touchCapable('touchEmulation')('does not apply the hover state on a touch device', async () => {
    await enableTouch()
    try {
      render(<Button variant="primary">Salvar</Button>)
      const button = page.getByRole('button', { name: 'Salvar' })

      expect(matchMedia('(hover: none)').matches).toBe(true)
      await button.hover()

      expect(getComputedStyle(button.element(), '::after').opacity).toBe('0')
      expect(getComputedStyle(button.element()).boxShadow).toBe('none')
    } finally {
      await disableTouch()
    }
  })

  touchCapable('touchEmulation')('does not lift on a touch device', async () => {
    await enableTouch()
    try {
      renderInBrowser(<Card variant="elevated" data-testid="card">Conteúdo</Card>, 'auto')
      const card = page.getByTestId('card')

      expect(matchMedia('(hover: none)').matches).toBe(true)
      await card.hover()
      await frames(4)

      expect(getComputedStyle(card.element()).transform).toBe('none')
    } finally {
      await disableTouch()
    }
  })

  touchCapable('touchEmulation')('does not lift or tint a clickable tile on a touch device', async () => {
    await enableTouch()
    try {
      renderInBrowser(
        <>
          <CardButton variant="elevated" data-testid="button">
            Ação
          </CardButton>
          <CardLink variant="elevated" href="/x" data-testid="link">
            Destino
          </CardLink>
        </>,
        'auto'
      )

      expect(matchMedia('(hover: none)').matches).toBe(true)

      for (const id of ['button', 'link']) {
        const tile = page.getByTestId(id).element()

        await page.getByTestId(id).hover()
        await frames(4)

        expect(getComputedStyle(tile).transform, id).toBe('none')
        expect(getComputedStyle(tile, '::after').opacity, id).toBe('0')
      }
    } finally {
      await disableTouch()
    }
  })

  touchCapable('touchEmulation')('raises the field text to 16px on a coarse pointer', async () => {
    await enableTouch()

    try {
      renderInBrowser(
        <div style={{ ['--enchase-font-size-base' as string]: '14px' }}>
          <Input label="Nome" />
          <Select label="País" options={[{ value: 'br', label: 'Brasil' }]} />
        </div>
      )
      const fields = [document.querySelector('[data-slot="input-field"]'), document.querySelector('[data-slot="select-field"]')] as HTMLElement[]

      await expect.poll(() => fields.map((field) => getComputedStyle(field).fontSize)).toEqual(['16px', '16px'])
    } finally {
      await disableTouch()
    }
  })

  touchCapable('touchEmulation')('does not tint the logout button on hover with a touch pointer', async () => {
    renderInBrowser(<SidebarUser name="Pedro Lima" collapsed={false} onLogout={() => undefined} />)
    await enableTouch()
    try {
      const rules = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules])
      const ungated = rules.filter((rule) => rule instanceof CSSStyleRule && rule.selectorText.includes(':hover') && rule.selectorText.includes('logout'))

      expect(ungated).toHaveLength(0)
    } finally {
      await disableTouch()
    }
  })
})

describe.each(builtInStyleEntries)('touch pointer with the %s style in a real browser', (_, themeStyle) => {
  touchCapable('touchEmulation')('raises the text of the fields to 16px on a coarse pointer', async () => {
    await enableTouch()

    try {
      renderInBrowser(
        <>
          <Input label="Name" />
          <NumberInput label="Amount" />
          <Select label="Country" options={[{ value: 'br', label: 'Brasil' }]} />
          <Textarea label="Notes" />
        </>,
        'never',
        'light',
        { style: themeStyle }
      )

      const fields = ['input-field', 'number-input-field', 'select-field', 'textarea-field'].map((name) => part(name))

      await expect.poll(() => fields.map((field) => getComputedStyle(field).fontSize)).toEqual(['16px', '16px', '16px', '16px'])
    } finally {
      await disableTouch()
    }
  })
})

describe('the drawer on a touch device in a real browser', () => {
  touchCapable('touchEmulation')('fits the screen, takes the whole height and does not tint its close button on hover', async () => {
    await enableTouch()
    try {
      renderInBrowser(<DrawerPage />)
      await page.getByRole('button', { name: 'Abrir' }).click()
      await expect.poll(() => part('drawer-panel')?.getAttribute('data-state'), { timeout: 4000 }).toBe('open')

      const box = part('drawer-panel').getBoundingClientRect()
      const area = part('drawer-overlay').getBoundingClientRect()
      const close = part('drawer-close')
      const before = getComputedStyle(close).color

      expect(matchMedia('(hover: none)').matches).toBe(true)
      expect(Math.round(box.width)).toBe(Math.round(Math.min(400, window.innerWidth * 0.9)))
      expect([Math.round(box.left - area.left), Math.round(box.top - area.top), Math.round(box.height)]).toEqual([0, 0, Math.round(area.height)])

      await page.elementLocator(close).hover()
      await frames(4)

      expect(getComputedStyle(close).color).toBe(before)
      expect(getComputedStyle(close).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    } finally {
      await disableTouch()
    }
  })
})

describe('the menu on a touch device in a real browser', () => {
  touchCapable('touchEmulation')('opens with a tap, chooses an item with a tap and does not tint the item on hover', async () => {
    await enableTouch()
    try {
      const log: string[] = []

      renderInBrowser(
        <Menu
          label="Ações"
          items={[
            { id: 'edit', label: 'Editar', onSelect: () => log.push('edit') },
            { id: 'duplicate', label: 'Duplicar', onSelect: () => log.push('duplicate') }
          ]}
        >
          <button>Abrir</button>
        </Menu>
      )
      await page.getByRole('button', { name: 'Abrir' }).click()
      await expect.poll(() => part('popover-content')?.getAttribute('data-state'), { timeout: 4000 }).toBe('open')

      const [edit, duplicate] = parts('menu-item')

      expect(matchMedia('(hover: none)').matches).toBe(true)

      await page.elementLocator(edit).hover()
      await frames(4)

      expect(getComputedStyle(edit).backgroundColor).toBe('rgba(0, 0, 0, 0)')

      await page.elementLocator(duplicate).click()

      await expect.poll(() => part('popover-content'), { timeout: 4000 }).toBeUndefined()
      expect(log).toEqual(['duplicate'])
    } finally {
      await disableTouch()
    }
  })
})

describe('the combobox on a touch device in a real browser', () => {
  const fruits = [
    { value: 'apple', label: 'Maçã' },
    { value: 'banana', label: 'Banana' },
    { value: 'grape', label: 'Uva' }
  ]

  touchCapable('touchEmulation')('opens with a tap, chooses an option with a tap and keeps the text at 16px or more', async () => {
    await enableTouch()
    try {
      renderInBrowser(<Combobox label="Fruta" options={fruits} />)
      await page.getByRole('combobox', { name: 'Fruta' }).click()
      await expect.poll(() => part('combobox-listbox')?.getAttribute('data-state'), { timeout: 4000 }).toBe('open')

      expect(matchMedia('(hover: none)').matches).toBe(true)
      expect(parseFloat(getComputedStyle(part('combobox-input')).fontSize)).toBeGreaterThanOrEqual(16)

      await page.elementLocator(parts('combobox-option')[1]).click()

      await expect.poll(() => part('combobox-listbox')).toBeUndefined()
      expect((part('combobox-input') as HTMLInputElement).value).toBe('Banana')
    } finally {
      await disableTouch()
    }
  })

  chromiumOnly('touchEmulation')('leaves no option active after a tap in the multiple mode, where the list stays open', async () => {
    await enableTouch()
    try {
      await parkMouse()
      renderInBrowser(
        <div style={{ position: 'absolute', top: 16, left: 300, width: 320 }}>
          <Combobox multiple label="Fruta" options={fruits} />
        </div>
      )
      const input = part('combobox-input').getBoundingClientRect()

      await dragFinger([{ x: input.left + 20, y: input.top + input.height / 2 }])
      await expect.poll(() => part('combobox-listbox')?.getAttribute('data-state'), { timeout: 4000 }).toBe('open')

      const target = parts('combobox-option')[1].getBoundingClientRect()

      await dragFinger([{ x: target.left + 20, y: target.top + target.height / 2 }])

      await expect.poll(() => parts('tag').length).toBe(1)
      await frames(4)

      expect(parts('tag')[0].textContent).toBe('Banana')
      expect(part('combobox-listbox')?.getAttribute('data-state')).toBe('open')
      expect(parts('combobox-option').some((option) => option.hasAttribute('data-active'))).toBe(false)
      expect(part('combobox-input').hasAttribute('aria-activedescendant')).toBe(false)

      const last = parts('combobox-option')[2].getBoundingClientRect()
      const x = last.left + 20
      const y = last.top + last.height / 2

      await dragFinger([
        { x, y },
        { x, y: y + 20 },
        { x, y: y + 40 },
        { x, y: y + 60 }
      ])
      await frames(4)

      expect(parts('combobox-option').some((option) => option.hasAttribute('data-active'))).toBe(false)
      expect(parts('tag').length).toBe(1)
    } finally {
      await disableTouch()
    }
  })
})

describe('the calendar on a touch device in a real browser', () => {
  touchCapable('touchEmulation')('chooses a day with a tap, moves the month with a tap and does not tint a day on hover', async () => {
    await enableTouch()
    try {
      let picked = ''

      renderInBrowser(<Calendar today="2026-10-28" value="2026-10-15" onSelect={(date) => (picked = date)} />)
      const day = (iso: string) => document.querySelector(`[data-date="${iso}"]`) as HTMLElement
      const number = (iso: string) => day(iso).querySelector('[data-slot="date-picker-calendar-day-number"]') as HTMLElement

      expect(matchMedia('(hover: none)').matches).toBe(true)
      expect(day('2026-10-20').getBoundingClientRect().height).toBeGreaterThanOrEqual(40)

      await page.elementLocator(day('2026-10-20')).hover()
      await frames(4)

      expect(getComputedStyle(number('2026-10-20')).backgroundColor).toBe('rgba(0, 0, 0, 0)')

      await page.elementLocator(day('2026-10-20')).click()

      await expect.poll(() => picked).toBe('2026-10-20')

      await page.getByRole('button', { name: 'Próximo mês' }).click()

      await expect.poll(() => part('date-picker-calendar-title')?.textContent).toBe('novembro de 2026')
    } finally {
      await disableTouch()
    }
  })
})

describe('the segmented control on a touch device in a real browser', () => {
  touchCapable('touchEmulation')('checks an option with a tap and does not tint the others on hover', async () => {
    await enableTouch()
    try {
      renderInBrowser(
        <SegmentedControl
          ariaLabel="Visão"
          items={[
            { value: 'list', label: 'Lista' },
            { value: 'board', label: 'Quadro' }
          ]}
        />
      )

      const [list, board] = parts('segmented-control-item')

      expect(matchMedia('(hover: none)').matches).toBe(true)

      await page.elementLocator(list).hover()
      await frames(4)

      expect(getComputedStyle(list).backgroundColor).toBe('rgba(0, 0, 0, 0)')

      await page.elementLocator(board).click()

      await expect.poll(() => board.getAttribute('aria-checked')).toBe('true')
      expect(list.getAttribute('aria-checked')).toBe('false')
    } finally {
      await disableTouch()
    }
  })
})

describe('the slider on a touch device in a real browser', () => {
  const geometry = () => {
    const inner = part('slider-track').getBoundingClientRect()
    const outer = part('slider-control').getBoundingClientRect()

    return { inner, outer, at: (ratio: number) => ({ x: inner.left + inner.width * ratio, y: outer.top + outer.height / 2 }) }
  }

  const value = () => Number(part('slider-thumb').getAttribute('aria-valuenow'))

  touchCapable('touchEmulation')('leaves the horizontal drag to the control, shows no hover halo and takes a tap', async () => {
    await enableTouch()
    try {
      renderInBrowser(<Slider ariaLabel="Volume" defaultValue={20} />)
      const { inner, outer } = geometry()

      expect(matchMedia('(hover: none)').matches).toBe(true)
      expect(getComputedStyle(part('slider-control')).touchAction).toBe('pan-y')

      await page.elementLocator(part('slider-thumb')).hover()
      await frames(4)

      expect(getComputedStyle(part('slider-thumb')).boxShadow).toBe('none')

      await page.elementLocator(part('slider-control')).click({ position: { x: inner.left - outer.left + inner.width * 0.8, y: 20 } })

      await expect.poll(value).toBe(80)
    } finally {
      await disableTouch()
    }
  })

  chromiumOnly('touchEmulation')('follows a finger dragged across the track', async () => {
    await enableTouch()
    try {
      renderInBrowser(<Slider ariaLabel="Volume" />)
      const { at } = geometry()

      await dragFinger([at(0.1), at(0.15), at(0.3), at(0.5), at(0.65)])

      await expect.poll(value).toBe(65)
    } finally {
      await disableTouch()
    }
  })

  chromiumOnly('touchEmulation')('leaves the value alone when a finger swipes up the page from the track, and the page scrolls', async () => {
    await enableTouch()
    try {
      renderInBrowser(
        <div style={{ blockSize: 3000, paddingBlockStart: 400 }}>
          <Slider ariaLabel="Volume" defaultValue={30} />
        </div>
      )
      window.scrollTo(0, 300)
      await frames(2)

      const { at } = geometry()
      const start = at(0.7)

      await dragFinger([start, { x: start.x + 2, y: start.y - 30 }, { x: start.x + 4, y: start.y - 90 }, { x: start.x + 4, y: start.y - 160 }])
      await frames(4)

      expect(value()).toBe(30)
      expect(window.scrollY).toBeGreaterThan(300)
    } finally {
      await disableTouch()
    }
  })
})

describe('the sort buttons of the table on a touch device in a real browser', () => {
  touchCapable('touchEmulation')('sorts with a tap and does not tint the cell on hover', async () => {
    await enableTouch()
    try {
      const calls: unknown[] = []

      renderInBrowser(<Table caption="Pedidos" columns={[{ key: 'id', header: 'Pedido', sortable: true }, { key: 'customer', header: 'Cliente', sortable: true }]} rows={[{ id: '#1', customer: 'Ana' }]} onSortChange={(sort) => calls.push(sort)} />)
      const [first, second] = parts('table-sort')

      expect(matchMedia('(hover: none)').matches).toBe(true)

      await page.elementLocator(first).hover()
      await frames(4)

      expect(getComputedStyle(first, '::after').backgroundColor).toBe('rgba(0, 0, 0, 0)')

      await page.elementLocator(second).click()

      await expect.poll(() => calls).toEqual([{ key: 'customer', direction: 'ascending' }])
    } finally {
      await disableTouch()
    }
  })
})
