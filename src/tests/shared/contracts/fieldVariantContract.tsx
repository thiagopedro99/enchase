import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import type { FieldVariantContractAdapter } from './types.ts'

const variants = ['filled', 'borderless', 'underlined'] as const

const withoutIds = (html: string) => html.replace(/_r_[a-z0-9]+_/g, '#').replace(/«r[a-z0-9]*»/g, '#').replace(/:r[a-z0-9]*:/g, '#')

export const describeFieldVariantContract = ({ name, slot, control, render: ui }: FieldVariantContractAdapter) => {
  describe(`${name} · contrato da variante`, () => {
    const wrapper = () => document.querySelector(`[data-slot="${slot}"]`) as HTMLElement

    it('writes no data-variant for the default variant, so the DOM of today stays the same when outlined is passed', () => {
      const { container, unmount } = render(ui())
      const byDefault = withoutIds(container.innerHTML)

      expect(wrapper()).not.toHaveAttribute('data-variant')
      unmount()

      const explicit = render(ui({ variant: 'outlined' }))

      expect(wrapper()).not.toHaveAttribute('data-variant')
      expect(withoutIds(explicit.container.innerHTML)).toBe(byDefault)
    })

    it.each(variants)('writes data-variant="%s" on the wrapper and on nothing else', (variant) => {
      const { container } = render(ui({ variant }))

      expect(wrapper()).toHaveAttribute('data-variant', variant)
      expect(container.querySelectorAll('[data-variant]')).toHaveLength(1)
    })

    it.each(variants)('draws the label above the control in the %s variant, as if it were stacked, when the placement asked for is floating', (variant) => {
      render(ui({ variant }))

      const field = document.querySelector(control) as HTMLElement
      const label = screen.getByText('Name', { selector: 'label' })

      expect(wrapper()).toHaveAttribute('data-label-placement', 'stacked')
      expect(wrapper().firstElementChild).toBe(label)
      expect(field).not.toHaveAttribute('data-has-label')
      expect(wrapper().querySelector('fieldset')).not.toHaveAttribute('data-has-label')
      expect(wrapper().querySelector('legend span')).not.toHaveTextContent('Name')
      expect(screen.getByLabelText('Name')).toBe(field)
    })

    it('keeps the floating label in the outlined variant', () => {
      render(ui({ variant: 'outlined' }))

      expect(wrapper()).not.toHaveAttribute('data-label-placement')
      expect(document.querySelector(control)).toHaveAttribute('data-has-label')
      expect(wrapper().querySelector('legend span')).toHaveTextContent('Name')
    })

    it.each(variants)('keeps the stacked label of the %s variant', (variant) => {
      render(ui({ variant, labelPlacement: 'stacked' }))

      expect(wrapper()).toHaveAttribute('data-label-placement', 'stacked')
      expect(wrapper().firstElementChild).toBe(screen.getByText('Name', { selector: 'label' }))
    })

    it.each(variants)('keeps the error, the helper text and the disabled state working in the %s variant', (variant) => {
      const { unmount } = render(ui({ variant, error: 'Wrong', disabled: true }))
      const field = screen.getByLabelText('Name')

      expect(wrapper()).toHaveAttribute('data-invalid')
      expect(wrapper()).toHaveAttribute('data-disabled')
      expect(field).toBeDisabled()
      expect(field).toHaveAttribute('aria-invalid', 'true')
      expect(field).toHaveAccessibleDescription('Wrong')
      expect(screen.getByRole('alert')).toHaveTextContent('Wrong')
      unmount()
      render(ui({ variant, helperText: 'Help' }))

      expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Help')
    })

    it.each(variants)('has no axe violations in the %s variant', async (variant) => {
      const { container } = render(
        <form>
          {ui({ variant, helperText: 'Help' })}
          {ui({ variant, error: 'Wrong' })}
        </form>
      )

      expect(await axe(container)).toHaveNoViolations()
    })
  })
}
