import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import Input from '@components/common/Input/index.tsx'
import NumberInput from '@components/common/NumberInput/index.tsx'
import Select from '@components/common/Select/index.tsx'
import Textarea from '@components/common/Textarea/index.tsx'

import type { LabelPlacement } from '@styles/tokens/types.ts'
import type { ReactElement } from 'react'

const options = [{ value: 'a', label: 'A' }]

const fields: { name: string; slot: string; ui: (placement?: LabelPlacement) => ReactElement; control: string }[] = [
  { name: 'Input', slot: 'input', control: 'input', ui: (placement) => <Input label="Name" placeholder="Type" labelPlacement={placement} /> },
  { name: 'NumberInput', slot: 'number-input', control: 'input', ui: (placement) => <NumberInput label="Name" placeholder="0" labelPlacement={placement} /> },
  { name: 'Select', slot: 'select', control: 'select', ui: (placement) => <Select label="Name" options={options} labelPlacement={placement} /> },
  { name: 'Textarea', slot: 'textarea', control: 'textarea', ui: (placement) => <Textarea label="Name" placeholder="Type" labelPlacement={placement} /> }
]

const wrapperOf = (slot: string) => document.querySelector(`[data-slot="${slot}"]`) as HTMLElement

describe.each(fields)('the label placement of the $name', ({ slot, ui, control }) => {
  it('floats the label inside the field by default, with the notch drawn from its text', () => {
    render(ui())

    const wrapper = wrapperOf(slot)
    const field = document.querySelector(control) as HTMLElement
    const label = screen.getByText('Name', { selector: 'label' })

    expect(wrapper).not.toHaveAttribute('data-label-placement')
    expect(field).toHaveAttribute('data-has-label')
    expect(wrapper.firstElementChild?.tagName).toBe('DIV')
    expect(label.parentElement).toBe(wrapper.firstElementChild)
    expect(wrapper.querySelector('legend span')).toHaveTextContent('Name')
  })

  it('puts the label above the field when it is stacked, with no notch and the placeholder visible', () => {
    render(ui('stacked'))

    const wrapper = wrapperOf(slot)
    const field = document.querySelector(control) as HTMLElement
    const label = screen.getByText('Name', { selector: 'label' })

    expect(wrapper).toHaveAttribute('data-label-placement', 'stacked')
    expect(wrapper.firstElementChild).toBe(label)
    expect(field).not.toHaveAttribute('data-has-label')
    expect(wrapper.querySelector('fieldset')).not.toHaveAttribute('data-has-label')
    expect(wrapper.querySelector('legend span')).not.toHaveTextContent('Name')

    if (control !== 'select') expect(field).toHaveAttribute('placeholder', control === 'input' && slot === 'number-input' ? '0' : 'Type')
  })

  it('keeps the label tied to the field in both placements', () => {
    const { unmount } = render(ui())

    expect(screen.getByLabelText('Name')).toBe(document.querySelector(control))
    unmount()
    render(ui('stacked'))

    expect(screen.getByLabelText('Name')).toBe(document.querySelector(control))
  })

  it('takes the stacked label from the shadcn style and lets the prop win', () => {
    const { unmount } = render(<ColorModeProvider storage={null} theme={{ style: 'shadcn' }}>{ui()}</ColorModeProvider>)

    expect(wrapperOf(slot)).toHaveAttribute('data-label-placement', 'stacked')
    unmount()
    render(<ColorModeProvider storage={null} theme={{ style: 'shadcn' }}>{ui('floating')}</ColorModeProvider>)

    expect(wrapperOf(slot)).not.toHaveAttribute('data-label-placement')
  })

  it('draws no label at all when there is no label text', () => {
    const { container } = render(<>{ui('stacked')}</>)

    expect(container.querySelectorAll('label')).toHaveLength(1)
  })
})
