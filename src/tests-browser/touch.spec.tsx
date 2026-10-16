import { render } from '@testing-library/react'
import { describe, expect } from 'vitest'
import { chromiumOnly } from './browserSkips.ts'
import { cdp, page } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { SidebarUser } from '@components/layout/subcomponentes/SidebarUser/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { frames } from './settle.ts'

describe('touch pointer in a real browser', () => {
  chromiumOnly('touchEmulation')('does not apply the hover state on a touch device', async () => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    try {
      render(<Button variant="primary">Salvar</Button>)
      const button = page.getByRole('button', { name: 'Salvar' })

      expect(matchMedia('(hover: none)').matches).toBe(true)
      await button.hover()

      expect(getComputedStyle(button.element(), '::after').opacity).toBe('0')
      expect(getComputedStyle(button.element()).boxShadow).toBe('none')
    } finally {
      await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
    }
  })

  chromiumOnly('touchEmulation')('does not lift on a touch device', async () => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    try {
      renderInBrowser(<Card variant="elevated" data-testid="card">Conteúdo</Card>, 'auto')
      const card = page.getByTestId('card')

      expect(matchMedia('(hover: none)').matches).toBe(true)
      await card.hover()
      await frames(4)

      expect(getComputedStyle(card.element()).transform).toBe('none')
    } finally {
      await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
    }
  })

  chromiumOnly('touchEmulation')('raises the field text to 16px on a coarse pointer', async () => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })

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
      await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
    }
  })

  chromiumOnly('touchEmulation')('does not tint the logout button on hover with a touch pointer', async () => {
    renderInBrowser(<SidebarUser name="Pedro Lima" collapsed={false} onLogout={() => undefined} />)
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true })
    try {
      const rules = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules])
      const ungated = rules.filter((rule) => rule instanceof CSSStyleRule && rule.selectorText.includes(':hover') && rule.selectorText.includes('logout'))

      expect(ungated).toHaveLength(0)
    } finally {
      await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
    }
  })
})
