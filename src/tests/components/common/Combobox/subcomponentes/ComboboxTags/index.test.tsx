import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { ComboboxTags } from '@components/common/Combobox/subcomponentes/ComboboxTags/index.tsx'

const names: Record<string, string> = { apple: 'Apple', banana: 'Banana', cherry: 'Cherry' }

const labelOf = (value: string) => names[value]

const tags = () => [...document.querySelectorAll('[data-slot="tag"]')]

describe('ComboboxTags', () => {
  it('renders one tag per value, in the order of the values, with the label it is given for it', () => {
    renderWithProviders(<ComboboxTags values={['cherry', 'apple']} labelOf={labelOf} />)

    expect(tags().map((tag) => tag.textContent)).toEqual(['Cherry', 'Apple'])
  })

  it('falls back to the value itself when there is no label for it', () => {
    renderWithProviders(<ComboboxTags values={['kiwi']} labelOf={labelOf} />)

    expect(tags().map((tag) => tag.textContent)).toEqual(['kiwi'])
  })

  it('renders nothing for no values', () => {
    renderWithProviders(<ComboboxTags values={[]} labelOf={labelOf} />)

    expect(tags()).toHaveLength(0)
  })

  it('makes small tags', () => {
    renderWithProviders(<ComboboxTags values={['apple']} labelOf={labelOf} />)

    expect(tags()[0]).toHaveAttribute('data-size', 'sm')
  })

  it('has no remove button without onRemove', () => {
    renderWithProviders(<ComboboxTags values={['apple', 'banana']} labelOf={labelOf} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(tags().every((tag) => !tag.hasAttribute('data-removable'))).toBe(true)
  })

  it('gives every tag a remove button named after it, and hands onRemove the value of the one that was pressed', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    renderWithProviders(<ComboboxTags values={['apple', 'banana']} labelOf={labelOf} onRemove={onRemove} />)

    expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-labelledby') && button.textContent)).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Remover Banana' }))

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith('banana')

    await user.click(screen.getByRole('button', { name: 'Remover Apple' }))
    expect(onRemove).toHaveBeenLastCalledWith('apple')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<ComboboxTags values={['apple', 'banana']} labelOf={labelOf} onRemove={vi.fn()} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
