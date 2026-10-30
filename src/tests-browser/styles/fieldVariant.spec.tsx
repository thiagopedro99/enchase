import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { at, becomes, hooked, onRoot, part } from '../support/hookProbes.ts'
import { Input } from '@components/common/Input/index.tsx'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { accessibilityViolations } from '../support/axe.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { unlessWebkit } from '../support/browserSkips.ts'
import { setForcedColors } from '../support/media.ts'
import { waitForSettled } from '../support/settle.ts'
import { fieldKinds } from '../support/fields.tsx'

import type { FieldVariant } from '@styles/tokens/types.ts'
import type { FieldKind } from '../support/fields.tsx'
import type { CSSProperties } from 'react'

type State = 'rest' | 'hover' | 'focus' | 'error' | 'disabled'

afterEach(async () => {
  document.documentElement.removeAttribute('style')
  await setForcedColors('none')
})

const variants: FieldVariant[] = ['outlined', 'filled', 'borderless', 'underlined']

const others: FieldVariant[] = ['filled', 'borderless', 'underlined']

const transparent = 'rgba(0, 0, 0, 0)'

const settled = <Value,>(read: () => Value) => expect.poll(read, { timeout: 4000 })

const resolved = (property: string, value: string) => {
  const probe = document.createElement('i')

  probe.style.setProperty(property, value)
  document.body.append(probe)

  const result = getComputedStyle(probe).getPropertyValue(property)

  probe.remove()

  return result
}

const color = (role: string) => resolved('color', `var(--enchase-color-${role})`)

const disabledLayer = () => resolved('color', 'color-mix(in srgb, var(--enchase-color-text-primary) calc(var(--enchase-state-disabled-container, 0.12) * 100%), transparent)')

const boxOf = (kind: FieldKind) => {
  const outline = getComputedStyle(part(`${kind.name}-outline`))
  const fill = getComputedStyle(part(kind.fill))

  return {
    widths: ['top', 'right', 'bottom', 'left'].map((side) => outline.getPropertyValue(`border-${side}-width`)),
    line: outline.borderBottomColor,
    lineRadii: [outline.borderTopLeftRadius, outline.borderBottomLeftRadius],
    fill: fill.backgroundColor,
    radii: ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map((corner) => fill.getPropertyValue(`border-${corner}-radius`)),
    ring: fill.outlineStyle === 'none' ? ['none'] : [fill.outlineStyle, fill.outlineWidth]
  }
}

const expectedBox = (variant: FieldVariant, state: State) => {
  const width = state === 'focus' ? '2px' : '1px'
  const widths = variant === 'outlined' ? [width, width, width, width] : variant === 'borderless' ? ['0px', '0px', '0px', '0px'] : ['0px', '0px', width, '0px']
  const line = { rest: color('border-strong'), hover: color('text-primary'), focus: color('primary'), error: color('error'), disabled: disabledLayer() }[state]
  const fill = { rest: color('surface-container'), hover: color('surface-container-high'), focus: color('surface-container'), error: color('surface-container'), disabled: disabledLayer() }[state]
  const square = variant === 'filled' || variant === 'underlined'

  return {
    widths,
    line: variant === 'borderless' ? expect.any(String) : line,
    lineRadii: square ? ['0px', '0px'] : ['8px', '8px'],
    fill: variant === 'filled' ? fill : transparent,
    radii: variant === 'filled' ? ['8px', '8px', '0px', '0px'] : ['8px', '8px', '8px', '8px'],
    ring: variant === 'borderless' && state === 'focus' ? ['solid', '2px'] : ['none']
  }
}

const reach = async (kind: FieldKind, variant: FieldVariant, state: State) => {
  renderInBrowser(kind.render({ variant, error: state === 'error' ? 'Wrong' : undefined, disabled: state === 'disabled' ? true : undefined }))

  if (state === 'hover') await userEvent.hover(part(kind.fill))
  if (state === 'focus') part(kind.native).focus()
}

describe.each(fieldKinds)('the variants of the $name field', (kind) => {
  describe.each(variants)('%s', (variant) => {
    it.each(['rest', 'hover', 'focus', 'error', 'disabled'] as const)('draws the border by side, the fill, the corners and the focus ring of its %s state', async (state) => {
      await reach(kind, variant, state)

      await settled(() => boxOf(kind)).toEqual(expectedBox(variant, state))
    })
  })

  it.each(variants)('colors the label of the %s variant with the error color when the field has an error', async (variant) => {
    renderInBrowser(kind.render({ variant, error: 'Wrong' }))

    await settled(() => getComputedStyle(part(`${kind.name}-label`)).color).toBe(color('error'))
  })

  it('draws the floating label of the outlined variant inside the field', () => {
    renderInBrowser(kind.render({ variant: 'outlined' }))

    expect(getComputedStyle(part(`${kind.name}-label`)).position).toBe('absolute')
  })

  it.each(others)('draws the label of the %s variant above the field, whatever the placement asked for', (variant) => {
    renderInBrowser(kind.render({ variant }))

    const label = part(`${kind.name}-label`)

    expect(getComputedStyle(label).position).toBe('static')
    expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(part(kind.fill).getBoundingClientRect().top + 1)
  })

  it('keeps the look of the outlined variant, element by element, whether the prop is passed or not', () => {
    const snapshot = () =>
      [...document.querySelectorAll(`[data-slot^="${kind.name}"]`)].map((element) => {
        const style = getComputedStyle(element)

        return [element.getAttribute('data-slot'), Array.from({ length: style.length }, (_, index) => `${style.item(index)}:${style.getPropertyValue(style.item(index))}`).join(';')]
      })

    const { unmount } = renderInBrowser(kind.render())
    const byDefault = snapshot()

    unmount()
    renderInBrowser(kind.render({ variant: 'outlined' }))

    expect(snapshot()).toEqual(byDefault)
  })

  const forced = unlessWebkit('forcedColors') ? it : it.skip

  forced.each(['filled', 'underlined'] as const)('keeps a bottom border of 2px or more in focus in forced colors, on the %s variant, even if the strong border of the style is thinner, and no border on the other sides', async (variant) => {
    renderInBrowser(kind.render({ variant, wrapperStyle: { '--enchase-border-width-strong': '1px' } as CSSProperties }))
    part(kind.native).focus()

    await settled(() => boxOf(kind).widths).toEqual(['0px', '0px', '1px', '0px'])
    await setForcedColors('active')

    await settled(() => boxOf(kind).widths.map((width) => parseFloat(width) >= 2)).toEqual([false, false, true, false])
    expect(boxOf(kind).widths.slice(0, 2)).toEqual(['0px', '0px'])
    expect(boxOf(kind).widths[3]).toBe('0px')
  })

  forced('keeps a focus ring of 2px or more in forced colors on the borderless variant, where there is no border', async () => {
    renderInBrowser(kind.render({ variant: 'borderless' }))
    await setForcedColors('active')
    part(kind.native).focus()

    await settled(() => getComputedStyle(part(kind.fill)).outlineStyle).toBe('solid')

    expect(parseFloat(getComputedStyle(part(kind.fill)).outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(boxOf(kind).widths).toEqual(['0px', '0px', '0px', '0px'])
  })
})

describe.each(fieldKinds)('the fill of the filled $name field from its hooks', (kind) => {
  const background = () => getComputedStyle(part(kind.fill)).backgroundColor

  const settle = async () => {
    background()

    await waitForSettled(at(kind.name))
  }

  it('takes the fill at rest from its hook, and gives it to the focus when the focus has no hook', async () => {
    hooked([['--enchase-input-field-background-filled', 'rgb(1, 2, 3)', at(kind.fill), 'background-color']], kind.render({ variant: 'filled' }))
    part(kind.native).focus()
    await settle()

    expect(background()).toBe('rgb(1, 2, 3)')
  })

  it('takes the fill under the pointer from its hook, and only there', async () => {
    onRoot({ '--enchase-input-field-background-filled-hover': 'rgb(4, 5, 6)' })
    renderInBrowser(kind.render({ variant: 'filled' }))

    expect(background()).toBe(color('surface-container'))

    await userEvent.hover(part(kind.fill))
    await becomes(at(kind.fill), 'background-color', 'rgb(4, 5, 6)')
  })

  it('takes the fill in focus from its hook, and only there', async () => {
    onRoot({ '--enchase-input-field-background-filled-focus': 'rgb(7, 8, 9)' })
    renderInBrowser(kind.render({ variant: 'filled' }))

    expect(background()).toBe(color('surface-container'))

    part(kind.native).focus()
    await becomes(at(kind.fill), 'background-color', 'rgb(7, 8, 9)')
  })

  it('takes the fill of a disabled field from its hook, also under the pointer', async () => {
    onRoot({ '--enchase-input-field-background-filled-disabled': 'rgb(10, 11, 12)', '--enchase-input-field-background-filled-hover': 'rgb(4, 5, 6)' })
    renderInBrowser(kind.render({ variant: 'filled', disabled: true }))

    expect(background()).toBe('rgb(10, 11, 12)')

    await userEvent.hover(part(kind.fill))
    await settle()

    expect(background()).toBe('rgb(10, 11, 12)')
  })

  it('takes the hooks from the style of the wrapper, so one field alone can set them', async () => {
    renderInBrowser(kind.render({ variant: 'filled', wrapperStyle: { '--enchase-input-field-background-filled': 'rgb(1, 2, 3)', '--enchase-input-field-background-filled-hover': 'rgb(4, 5, 6)' } as CSSProperties }))

    expect(background()).toBe('rgb(1, 2, 3)')

    await userEvent.hover(part(kind.fill))
    await becomes(at(kind.fill), 'background-color', 'rgb(4, 5, 6)')
  })

  it.each(['outlined', 'underlined', 'borderless'] as const)('does not paint the %s variant with them', async (variant) => {
    onRoot({
      '--enchase-input-field-background-filled': 'rgb(1, 2, 3)',
      '--enchase-input-field-background-filled-hover': 'rgb(4, 5, 6)',
      '--enchase-input-field-background-filled-focus': 'rgb(7, 8, 9)',
      '--enchase-input-field-background-filled-disabled': 'rgb(10, 11, 12)'
    })

    const { unmount } = renderInBrowser(kind.render({ variant }))

    expect(background()).toBe(transparent)

    await userEvent.hover(part(kind.fill))
    await settle()

    expect(background()).toBe(transparent)

    part(kind.native).focus()
    await settle()

    expect(background()).toBe(transparent)
    unmount()
    renderInBrowser(kind.render({ variant, disabled: true }))

    expect(background()).toBe(transparent)
  })
})

describe.each(['light', 'dark'] as const)('the filled variant in the %s mode', (mode) => {
  const everyField = (
    <div style={{ display: 'grid', gap: '1rem', padding: '1rem' }}>
      {fieldKinds.map((kind) => (
        <div key={kind.name}>{kind.render({ variant: 'filled' })}</div>
      ))}
    </div>
  )

  it('passes the contrast checks of axe for the text, the label and the helper', async () => {
    document.body.style.backgroundColor = 'var(--enchase-color-background)'
    document.body.style.color = 'var(--enchase-color-text-primary)'
    renderInBrowser(everyField, 'never', mode)
    await waitForSettled(() => document.body)

    expect(await accessibilityViolations(document.body)).toEqual([])
  })

  it.each(['rest', 'hover', 'focus'] as const)('keeps the placeholder at 4.5:1 and the line at the base at 3:1 over the fill of its %s state', async (state) => {
    renderInBrowser(<Input label="Name" placeholder="Type" variant="filled" />, 'never', mode)

    if (state === 'hover') await userEvent.hover(part('input-field'))
    if (state === 'focus') part('input-field').focus()

    const expected = { rest: color('surface-container'), hover: color('surface-container-high'), focus: color('surface-container') }[state]

    await settled(() => getComputedStyle(part('input-field')).backgroundColor).toBe(expected)
    await settled(() => getComputedStyle(part('input-outline')).borderBottomColor).toBe({ rest: color('border-strong'), hover: color('text-primary'), focus: color('primary') }[state])

    const fill = getComputedStyle(part('input-field')).backgroundColor

    expect(contrastRatio(getComputedStyle(part('input-field'), '::placeholder').color, fill)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(getComputedStyle(part('input-outline')).borderBottomColor, fill)).toBeGreaterThanOrEqual(3)
  })
})
