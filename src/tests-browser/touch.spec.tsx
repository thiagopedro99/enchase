import { render } from '@testing-library/react'
import { describe, expect } from 'vitest'
import { page } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { SidebarUser } from '@components/layout/subcomponentes/SidebarUser/index.tsx'
import { builtInStyleEntries } from '@tests/shared/fixtures/styles.ts'
import { renderInBrowser } from './harness.tsx'
import { part } from './hookProbes.ts'
import { frames } from './settle.ts'
import { disableTouch, enableTouch, touchCapable } from './touchInput.ts'

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
