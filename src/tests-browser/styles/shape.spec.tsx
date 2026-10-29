import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { Badge } from '@components/common/Badge/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'

import type { ThemeInput } from '@styles/theme/createTheme.ts'

const sections = [{ id: 'main', items: [{ id: 'docs', label: 'Docs', href: '/docs' }] }]

const everything = (
  <div>
    <Button data-testid="button">Save</Button>
    <Badge data-testid="badge">New</Badge>
    <Input label="Name" data-testid="input" />
    <NumberInput label="Amount" defaultValue={2} />
    <Card data-testid="card">Content</Card>
    <Switch label="Alerts" />
    <RadioGroup label="Plan" options={[{ value: 'a', label: 'A' }]} />
    <Navbar sections={sections} />
  </div>
)

const radiusOf = (selector: string) => parseFloat(getComputedStyle(document.querySelector(selector) as HTMLElement).borderTopLeftRadius)

const radii = () => ({
  button: radiusOf('[data-slot="button"]'),
  badge: radiusOf('[data-slot="badge"]'),
  input: radiusOf('[data-slot="input-outline"]'),
  number: radiusOf('[data-slot="number-input-outline"]'),
  stepper: radiusOf('[data-slot="number-input-increase"]'),
  card: radiusOf('[data-slot="card"]'),
  link: radiusOf('[data-slot="navbar-menu"] a'),
  menuButton: radiusOf('[data-slot="navbar-menu-button"]'),
  track: radiusOf('[data-slot="switch-track"]'),
  radio: radiusOf('[data-slot="radio-group-control"]')
})

const show = async (theme?: ThemeInput) => {
  await page.viewport(1280, 800)
  renderInBrowser(everything, 'never', 'light', theme)
}

afterEach(() => {
  document.body.querySelectorAll('style[data-probe]').forEach((style) => style.remove())
})

describe('the shape of the theme in a real browser', () => {
  it('keeps the pills, the 8px fields, the 24px cards and the round switch of the default look', async () => {
    await show()
    const found = radii()

    for (const name of ['button', 'badge', 'stepper', 'link', 'track', 'radio'] as const) expect(found[name], name).toBeGreaterThanOrEqual(1000)
    expect(found.input).toBe(8)
    expect(found.number).toBe(8)
    expect(found.card).toBe(24)
  })

  it('rounds the buttons, the fields and the cards a little in the soft shape, and keeps the switch and the radio round', async () => {
    await show({ shape: 'soft' })
    const found = radii()

    expect(found.button).toBe(12)
    expect(found.badge).toBe(12)
    expect(found.stepper).toBe(12)
    expect(found.link).toBe(12)
    expect(found.menuButton).toBe(12)
    expect(found.input).toBe(12)
    expect(found.number).toBe(12)
    expect(found.card).toBe(16)
    expect(found.track).toBeGreaterThanOrEqual(1000)
    expect(found.radio).toBeGreaterThanOrEqual(1000)
  })

  it('squares the whole kit in the square shape, but not the switch and the radio', async () => {
    await show({ shape: 'square' })
    const found = radii()

    expect(found.button).toBe(4)
    expect(found.badge).toBe(4)
    expect(found.stepper).toBe(4)
    expect(found.link).toBe(4)
    expect(found.menuButton).toBe(4)
    expect(found.input).toBe(4)
    expect(found.number).toBe(4)
    expect(found.card).toBe(6)
    expect(found.track).toBeGreaterThanOrEqual(1000)
    expect(found.radio).toBeGreaterThanOrEqual(1000)
  })

  it('takes one radius over the preset and keeps the rest of the preset', async () => {
    await show({ shape: 'soft', radius: { button: '1rem' } })

    expect(radii().button).toBe(16)
    expect(radii().card).toBe(16)
    expect(radii().input).toBe(12)
  })

  it('changes only the buttons when only the button radius is given', async () => {
    await show({ radius: { button: '0.5rem' } })
    const found = radii()

    expect(found.button).toBe(8)
    expect(found.badge).toBe(8)
    expect(found.input).toBe(8)
    expect(found.card).toBe(24)
    expect(found.track).toBeGreaterThanOrEqual(1000)
  })

  it('lets the radius of the Button hook win over the theme', async () => {
    await show({ shape: 'square' })
    const sheet = document.createElement('style')

    sheet.dataset.probe = ''
    sheet.textContent = '[data-slot="button"] { --enchase-button-radius: 20px; }'
    document.body.append(sheet)

    expect(radiusOf('[data-slot="button"]')).toBe(20)
    expect(radiusOf('[data-slot="badge"]')).toBe(4)
  })

  it('still follows an override of the full radius made in the css of the app, as before the button role', async () => {
    await show()
    const sheet = document.createElement('style')

    sheet.dataset.probe = ''
    sheet.textContent = ':root { --enchase-radius-full: 6px; }'
    document.body.append(sheet)

    expect(radiusOf('[data-slot="button"]')).toBe(6)
    expect(radiusOf('[data-slot="navbar-menu-button"]')).toBe(6)
    expect(radiusOf('[data-slot="switch-track"]')).toBe(6)
  })

  it('reaches the surfaces that open over the page, like the dialog', async () => {
    await page.viewport(1280, 800)
    renderInBrowser(
      <Modal isOpen onClose={() => undefined} title="Title">
        Body
      </Modal>,
      'never',
      'light',
      { shape: 'square' }
    )
    await expect.poll(() => document.querySelector('[data-slot="modal-panel"]')).toBeTruthy()

    expect(radiusOf('[data-slot="modal-panel"]')).toBe(8)
  })
})
