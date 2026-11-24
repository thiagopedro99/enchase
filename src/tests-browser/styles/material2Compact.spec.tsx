import { afterEach, describe, expect, it } from 'vitest'

import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { part } from '../support/hookProbes.ts'
import { Input } from '@components/common/Input/index.tsx'
import { material2 } from '@styles/presets/material2.ts'
import { renderInBrowser } from '../support/harness.tsx'

import type { ReactElement } from 'react'

const styled = { style: material2 } as const

const show = (ui: ReactElement, density?: 'compact') => {
  renderInBrowser(ui, 'never', 'light', styled)

  if (density) document.documentElement.setAttribute('data-density', density)
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('data-density')
})

describe('the compact density of the material2 style', () => {
  it('shrinks the field from 56px to 40px, the MUI "small" field, and the number input along with it', () => {
    show(
      <>
        <Input label="Name" />
        <NumberInput label="Amount" />
      </>,
      'compact'
    )

    expect(part('input-field').getBoundingClientRect().height).toBe(40)
    expect(part('number-input-field').getBoundingClientRect().height).toBe(40)
  })

  it('keeps the field at 56px without the attribute', () => {
    show(<Input label="Name" />)

    expect(part('input-field').getBoundingClientRect().height).toBe(56)
  })

  it('still shrinks the button, because the generic compact block of the library already covers the control heights that material2 does not redeclare', () => {
    show(<Button size="md">Save</Button>)
    const normal = part('button').getBoundingClientRect().height

    show(<Button size="md">Save</Button>, 'compact')
    const compact = part('button').getBoundingClientRect().height

    expect(compact).toBeLessThan(normal)
    expect(compact).toBeGreaterThanOrEqual(24)
  })
})
