import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { en } from '@locales/en.ts'
import { Tag } from '@components/common/Tag/index.tsx'

const sizes = ['sm', 'md'] as const

describe('Tag', () => {
  it('is a plain span with its content and no button when it cannot be removed', () => {
    renderWithProviders(<Tag>React</Tag>)
    const tag = screen.getByText('React').closest('[data-slot="tag"]') as HTMLElement

    expect(tag.tagName).toBe('SPAN')
    expect(tag).not.toHaveAttribute('role')
    expect(tag).not.toHaveAttribute('data-removable')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has a remove button named after the label of the locale and the content of the tag', () => {
    renderWithProviders(<Tag onRemove={vi.fn()}>React</Tag>, { locale: en })

    expect(screen.getByRole('button', { name: 'Remove React' })).toBeInTheDocument()
    expect(screen.getByText('React').closest('[data-slot="tag"]')).toHaveAttribute('data-removable')
  })

  it('takes the name of the button from content that is more than text', () => {
    renderWithProviders(
      <Tag onRemove={vi.fn()}>
        <strong>React</strong> 19
      </Tag>,
      { locale: en }
    )

    expect(screen.getByRole('button', { name: 'Remove React 19' })).toBeInTheDocument()
  })

  it('takes the label of the button from the labels of the provider, and falls back to English for a locale without it', () => {
    const { unmount } = renderWithProviders(<Tag onRemove={vi.fn()}>React</Tag>, { labels: { removeTag: 'Quitar' } })

    expect(screen.getByRole('button', { name: 'Quitar React' })).toBeInTheDocument()
    unmount()

    const { removeTag, ...messages } = en.messages

    void removeTag
    renderWithProviders(<Tag onRemove={vi.fn()}>React</Tag>, { locale: { ...en, messages } })

    expect(screen.getByRole('button', { name: 'Remove React' })).toBeInTheDocument()
  })

  it('calls onRemove once per click, with no arguments', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    renderWithProviders(<Tag onRemove={onRemove}>React</Tag>, { locale: en })
    await user.click(screen.getByRole('button', { name: 'Remove React' }))

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith()
  })

  it('is removed by the keyboard, with Enter and with Space', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    renderWithProviders(<Tag onRemove={onRemove}>React</Tag>, { locale: en })
    await user.tab()

    expect(screen.getByRole('button', { name: 'Remove React' })).toHaveFocus()

    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(onRemove).toHaveBeenCalledTimes(2)
  })

  it('gives each tag its own names, so two tags with the same text do not share an id', () => {
    renderWithProviders(
      <>
        <Tag onRemove={vi.fn()}>Same</Tag>
        <Tag onRemove={vi.fn()}>Same</Tag>
      </>,
      { locale: en }
    )
    const buttons = screen.getAllByRole('button', { name: 'Remove Same' })

    expect(buttons).toHaveLength(2)
    expect(buttons[0]?.id).not.toBe(buttons[1]?.id)
  })

  it('is medium by default and takes each size', () => {
    const { rerender } = renderWithProviders(<Tag data-testid="tag">React</Tag>)

    expect(screen.getByTestId('tag')).toHaveAttribute('data-size', 'md')

    for (const size of sizes) {
      rerender(
        <Tag size={size} data-testid="tag">
          React
        </Tag>
      )

      expect(screen.getByTestId('tag')).toHaveAttribute('data-size', size)
    }
  })

  it('does not pass size and onRemove to the page as attributes', () => {
    renderWithProviders(
      <Tag size="sm" onRemove={vi.fn()} data-testid="tag">
        React
      </Tag>
    )

    expect(screen.getByTestId('tag')).not.toHaveAttribute('size')
    expect(screen.getByTestId('tag')).not.toHaveAttribute('onremove')
  })

  it('passes the other attributes to the root span', () => {
    renderWithProviders(
      <Tag id="stack" title="Framework" data-testid="tag">
        React
      </Tag>
    )

    expect(screen.getByTestId('tag')).toHaveAttribute('id', 'stack')
    expect(screen.getByTestId('tag')).toHaveAttribute('title', 'Framework')
  })

  it('has no axe violations static, removable, in each size and inside a list', async () => {
    const { container } = renderWithProviders(
      <ul>
        {sizes.map((size) => (
          <li key={size}>
            <Tag size={size}>Static {size}</Tag>
            <Tag size={size} onRemove={vi.fn()}>
              Removable {size}
            </Tag>
          </li>
        ))}
      </ul>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Tag contract', () => {
  it('marks the root, the label and the button with data-slots', () => {
    renderWithProviders(<Tag onRemove={vi.fn()}>React</Tag>)

    expect(document.querySelector('[data-slot="tag"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="tag-label"]')).toHaveTextContent('React')
    expect(document.querySelector('[data-slot="tag-remove"]')?.tagName).toBe('BUTTON')
  })

  it('keeps the caller className last and lets the caller style win', () => {
    renderWithProviders(
      <Tag className="mine" style={{ color: 'red' }} data-testid="tag">
        React
      </Tag>
    )
    const tag = screen.getByTestId('tag')

    expect(tag.className.split(' ').at(-1)).toBe('mine')
    expect(tag.style.color).toBe('red')
  })

  it('keeps the data-slot of the library when the caller sends one', () => {
    renderWithProviders(
      <Tag data-slot="mine" data-testid="tag">
        React
      </Tag>
    )

    expect(screen.getByTestId('tag')).toHaveAttribute('data-slot', 'tag')
  })

  it('makes the button a button of type button, so inside a form it does not submit', () => {
    renderWithProviders(
      <form>
        <Tag onRemove={vi.fn()}>React</Tag>
      </form>
    )

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})
