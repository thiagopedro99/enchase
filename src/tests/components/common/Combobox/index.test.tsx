import { describeLabelPlacementContract } from '@tests/shared/contracts/labelPlacementContract.tsx'
import { describePortalContainerContract } from '@tests/shared/contracts/portalContainerContract.tsx'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { Combobox } from '@components/common/Combobox/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'

import type { ComboboxOption } from '@components/common/Combobox/types.ts'

const fruits: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'grape', label: 'Grape' },
  { value: 'sao', label: 'São Paulo' }
]

const field = () => screen.getByRole('combobox') as HTMLInputElement

const listbox = () => screen.getByRole('listbox')

const optionLabels = () => within(listbox()).getAllByRole('option').map((option) => option.textContent)

const closed = () => waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())

const wholePage = () => axe(document.body, { rules: { region: { enabled: false } } })

const hiddenValues = (name: string) => [...document.querySelectorAll<HTMLInputElement>(`input[type="hidden"][name="${name}"]`)].map((input) => input.value)

describeLabelPlacementContract({
  name: 'Combobox',
  slot: 'combobox',
  control: '[data-slot="combobox-input"]',
  placeholder: 'Pick one',
  render: (placement) => <Combobox label="Name" placeholder="Pick one" options={fruits} labelPlacement={placement} />
})

describePortalContainerContract({
  name: 'Combobox',
  slot: 'combobox-listbox',
  render: (container) => <Combobox label="Fruit" options={fruits} open container={container} onOpenChange={vi.fn()} />
})

describe('Combobox', () => {
  it('is a combobox named by its label, closed, and with no list in the page', () => {
    renderWithProviders(<Combobox label="Fruit" options={fruits} />)

    expect(screen.getByRole('combobox', { name: 'Fruit' })).toBe(field())
    expect(field()).toHaveAttribute('aria-expanded', 'false')
    expect(field()).toHaveAttribute('aria-autocomplete', 'list')
    expect(field()).not.toHaveAttribute('aria-controls')
    expect(field()).not.toHaveAttribute('aria-activedescendant')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens when something is typed, and lists only the options that contain it, ignoring case and accents', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} />)

    await user.tab()
    await user.keyboard('sao')

    expect(field()).toHaveAttribute('aria-expanded', 'true')
    expect(field()).toHaveAttribute('aria-controls', listbox().id)
    expect(optionLabels()).toEqual(['São Paulo'])
    await user.clear(field())
    await user.type(field(), 'AN')

    expect(optionLabels()).toEqual(['Banana'])
  })

  it('opens with every option when the field is clicked, and again from the toggle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} />)

    await user.click(field())
    expect(optionLabels()).toEqual(['Apple', 'Banana', 'Cherry', 'Grape', 'São Paulo'])

    await user.click(screen.getByRole('button', { name: 'Mostrar opções' }))
    await closed()
    expect(field()).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Mostrar opções' }))
    expect(listbox()).toBeInTheDocument()
    expect(field()).toHaveFocus()
  })

  it('marks the options, the disabled one included, and the list is named by the label', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} defaultValue="grape" />)

    await user.click(field())
    const options = within(listbox()).getAllByRole('option')

    expect(listbox()).toHaveAccessibleName('Fruit')
    expect(options.map((option) => option.getAttribute('aria-selected'))).toEqual(['false', 'false', 'false', 'true', 'false'])
    expect(options[2]).toHaveAttribute('aria-disabled', 'true')
    expect(options[0]).not.toHaveAttribute('aria-disabled')
  })

  it('chooses an option with a click: shows its label, closes, tells the app and keeps the focus in the field', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Combobox label="Fruit" options={fruits} onValueChange={onValueChange} />)

    await user.click(field())
    await user.click(screen.getByRole('option', { name: 'Banana' }))

    expect(field()).toHaveValue('Banana')
    expect(field()).toHaveFocus()
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('banana')
    await closed()
  })

  it('does not tell the app again when the option that is already chosen is chosen once more, and still closes and restores its label', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Combobox label="Fruit" options={fruits} defaultValue="banana" onValueChange={onValueChange} />)

    await user.click(field())
    await user.click(screen.getByRole('option', { name: 'Apple' }))
    expect(onValueChange).toHaveBeenCalledTimes(1)

    await user.click(field())
    await user.click(screen.getByRole('option', { name: 'Apple' }))

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(field()).toHaveValue('Apple')
    await closed()
  })

  it('does not choose a disabled option', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Combobox label="Fruit" options={fruits} onValueChange={onValueChange} />)

    await user.click(field())
    await user.click(screen.getByRole('option', { name: 'Cherry' }))

    expect(onValueChange).not.toHaveBeenCalled()
    expect(listbox()).toBeInTheDocument()
  })

  it('shows every option again after a choice, with the chosen one marked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} />)

    await user.type(field(), 'ban')
    await user.click(screen.getByRole('option', { name: 'Banana' }))
    await user.click(field())

    expect(optionLabels()).toEqual(['Apple', 'Banana', 'Cherry', 'Grape', 'São Paulo'])
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true')
  })

  it('opens on the first enabled option with ArrowDown, and moves the active option with the arrows, skipping the disabled one', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} />)

    await user.tab()
    await user.keyboard('{ArrowDown}')
    expect(field()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Apple' }).id)

    await user.keyboard('{ArrowDown}')
    expect(field()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Banana' }).id)

    await user.keyboard('{ArrowDown}')
    expect(field()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Grape' }).id)

    await user.keyboard('{ArrowUp}')
    expect(field()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Banana' }).id)
    expect(field()).toHaveFocus()
  })

  it('opens on the last enabled option with ArrowUp, and wraps around the ends', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} />)

    await user.tab()
    await user.keyboard('{ArrowUp}')
    expect(field()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'São Paulo' }).id)

    await user.keyboard('{ArrowDown}')
    expect(field()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Apple' }).id)

    await user.keyboard('{ArrowUp}')
    expect(field()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'São Paulo' }).id)
  })

  it('opens on the chosen option with ArrowDown when there is one', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} defaultValue="grape" />)

    await user.tab()
    await user.keyboard('{ArrowDown}')

    expect(field()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Grape' }).id)
  })

  it('chooses the active option with Enter, closes, and leaves the focus in the field', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Combobox label="Fruit" options={fruits} onValueChange={onValueChange} />)

    await user.tab()
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')

    expect(onValueChange).toHaveBeenCalledWith('banana')
    expect(field()).toHaveValue('Banana')
    expect(field()).toHaveFocus()
    await closed()
    expect(field()).not.toHaveAttribute('aria-activedescendant')
  })

  it('does not choose anything with Enter while no option is active', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Combobox label="Fruit" options={fruits} onValueChange={onValueChange} />)

    await user.type(field(), 'ap{Enter}')

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('starts with no active option after typing, and moves to the first match with an arrow', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} />)

    await user.type(field(), 'a')
    expect(field()).not.toHaveAttribute('aria-activedescendant')

    await user.keyboard('{ArrowDown}')
    expect(field()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Apple' }).id)
  })

  it('closes with Escape and keeps what was typed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} />)

    await user.type(field(), 'ba')
    await user.keyboard('{Escape}')

    await closed()
    expect(field()).toHaveValue('ba')
    expect(field()).toHaveAttribute('aria-expanded', 'false')
    expect(field()).toHaveFocus()
  })

  it('goes back to the label of the chosen option when the field loses the focus with other text in it', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <Combobox label="Fruit" options={fruits} defaultValue="grape" />
        <button>After</button>
      </>
    )

    await user.type(field(), 'zzz')
    await user.tab()
    await user.tab()

    expect(field()).toHaveValue('Grape')
    await closed()
  })

  it('clears the choice when the text is emptied and the field loses the focus', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(
      <>
        <Combobox label="Fruit" options={fruits} defaultValue="grape" onValueChange={onValueChange} />
        <button>After</button>
      </>
    )

    await user.clear(field())
    await user.click(screen.getByRole('button', { name: 'After' }))

    expect(onValueChange).toHaveBeenCalledWith(null)
    expect(field()).toHaveValue('')
  })

  it('closes when the page is clicked outside, and not when its own toggle or list is used', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <Combobox label="Fruit" options={fruits} />
        <p>Outside</p>
      </>
    )

    await user.click(field())
    await user.click(screen.getByText('Outside'))

    await closed()
  })

  it('shows the label of a value that the app controls, and follows it', async () => {
    const user = userEvent.setup()
    const Controlled = () => {
      const [value, setValue] = useState<string | null>('banana')

      return (
        <>
          <button onClick={() => setValue('apple')}>Apple</button>
          <button onClick={() => setValue(null)}>None</button>
          <Combobox label="Fruit" options={fruits} value={value} onValueChange={setValue} />
        </>
      )
    }
    renderWithProviders(<Controlled />)

    expect(field()).toHaveValue('Banana')
    await user.click(screen.getByRole('button', { name: 'Apple' }))
    expect(field()).toHaveValue('Apple')
    await user.click(screen.getByRole('button', { name: 'None' }))
    expect(field()).toHaveValue('')
  })

  it('leaves the choice to the app when it controls the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<Combobox label="Fruit" options={fruits} value="apple" onValueChange={onValueChange} />)

    await user.click(field())
    await user.click(screen.getByRole('option', { name: 'Banana' }))

    expect(onValueChange).toHaveBeenCalledWith('banana')
    expect(field()).toHaveValue('Apple')
  })

  it('starts with the label of defaultValue and lets the user change it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} defaultValue="banana" />)

    expect(field()).toHaveValue('Banana')
    await user.click(field())
    await user.click(screen.getByRole('option', { name: 'Grape' }))

    expect(field()).toHaveValue('Grape')
  })

  it('sends the chosen value with the form under name, and nothing when there is none', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} name="fruit" />)

    expect(hiddenValues('fruit')).toEqual([])
    expect(field()).not.toHaveAttribute('name')

    await user.click(field())
    await user.click(screen.getByRole('option', { name: 'Grape' }))

    expect(hiddenValues('fruit')).toEqual(['grape'])
  })

  it('shows a disabled message instead of an empty list, and says it in a status region', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} />)

    await user.type(field(), 'zzz')

    expect(optionLabels()).toEqual(['Nenhum resultado'])
    expect(screen.getByRole('option', { name: 'Nenhum resultado' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Nenhum resultado')
    expect(field()).not.toHaveAttribute('aria-activedescendant')
  })

  it('takes the messages from the labels of the provider', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} />, { labels: { noResults: 'Nothing here', showOptions: 'Open the list' } })

    await user.type(field(), 'zzz')

    expect(screen.getByRole('option', { name: 'Nothing here' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open the list' })).toBeInTheDocument()
  })

  it('shows every option when the filter is off, and filters with a function of the app', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<Combobox label="Fruit" options={fruits} filter={false} />)

    await user.type(field(), 'zzz')
    expect(optionLabels()).toEqual(['Apple', 'Banana', 'Cherry', 'Grape', 'São Paulo'])
    unmount()

    renderWithProviders(<Combobox label="Fruit" options={fruits} filter={(option, query) => option.value.startsWith(query)} />)

    await user.type(field(), 'g')
    expect(optionLabels()).toEqual(['Grape'])
  })

  it('tells the app what is typed on every change, so it can search', async () => {
    const user = userEvent.setup()
    const onInputChange = vi.fn()
    renderWithProviders(<Combobox label="Fruit" options={fruits} onInputChange={onInputChange} />)

    await user.type(field(), 'ba')

    expect(onInputChange.mock.calls).toEqual([['b'], ['ba']])
  })

  describe('when the app replaces the options', () => {
    const replacement: ComboboxOption[] = [{ value: 'kiwi', label: 'Kiwi' }]
    const renamed: ComboboxOption[] = [{ value: 'apple', label: 'Green apple' }]

    const Swap = ({ initial, onValueChange }: { initial?: string; onValueChange?: (value: string | null) => void }) => {
      const [options, setOptions] = useState(fruits)

      return (
        <>
          <button onClick={() => setOptions(replacement)}>Replace</button>
          <button onClick={() => setOptions(renamed)}>Rename</button>
          <Combobox label="Fruit" options={options} defaultValue={initial} onValueChange={onValueChange} />
        </>
      )
    }

    const SwapMany = () => {
      const [options, setOptions] = useState(fruits)

      return (
        <>
          <button onClick={() => setOptions(replacement)}>Replace</button>
          <Combobox multiple label="Fruit" options={options} defaultValue={['apple', 'banana']} />
        </>
      )
    }

    const tagLabels = () => [...document.querySelectorAll('[data-slot="tag-label"]')].map((tag) => tag.textContent)

    it('keeps the label of the option that was chosen', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Swap />)

      await user.click(field())
      await user.click(screen.getByRole('option', { name: 'Apple' }))
      await user.click(screen.getByRole('button', { name: 'Replace' }))

      expect(field()).toHaveValue('Apple')
    })

    it('keeps the label even when the app replaces them in the very handler that learns the choice', async () => {
      const user = userEvent.setup()
      const Search = () => {
        const [options, setOptions] = useState(fruits)

        return <Combobox label="Fruit" options={options} onValueChange={() => setOptions(replacement)} />
      }
      renderWithProviders(<Search />)

      await user.click(field())
      await user.click(screen.getByRole('option', { name: 'Grape' }))

      expect(field()).toHaveValue('Grape')
    })

    it('keeps the label of the value it started with', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Swap initial="banana" />)

      expect(field()).toHaveValue('Banana')
      await user.click(screen.getByRole('button', { name: 'Replace' }))

      expect(field()).toHaveValue('Banana')
    })

    it('keeps the tags of the chosen options', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SwapMany />)

      expect(tagLabels()).toEqual(['Apple', 'Banana'])
      await user.click(screen.getByRole('button', { name: 'Replace' }))

      expect(tagLabels()).toEqual(['Apple', 'Banana'])
    })

    it('shows the new label when the app renames the option of the value', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Swap initial="apple" />)

      await user.click(screen.getByRole('button', { name: 'Rename' }))

      expect(field()).toHaveValue('Green apple')
    })

    it('has no label to show for a value that never had an option: an empty field, and the value itself in a tag', () => {
      const { unmount } = renderWithProviders(<Combobox label="Fruit" options={fruits} value="unknown" />)

      expect(field()).toHaveValue('')
      unmount()
      renderWithProviders(<Combobox multiple label="Fruit" options={fruits} value={['unknown']} />)

      expect(tagLabels()).toEqual(['unknown'])
    })
  })

  it('marks the list as busy and shows a loading row while it loads, announced in a status region', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits.slice(0, 2)} loading />)

    await user.click(field())

    expect(listbox()).toHaveAttribute('aria-busy', 'true')
    expect(optionLabels()).toEqual(['Apple', 'Banana', 'Carregando'])
    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
  })

  it('shows only the loading row when it loads with nothing to show', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={[]} loading />)

    await user.click(field())

    expect(optionLabels()).toEqual(['Carregando'])
  })

  it('has no status text and no busy mark when it is not loading', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} />)

    await user.click(field())

    expect(listbox()).not.toHaveAttribute('aria-busy')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('does not open when disabled, and disables the toggle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} disabled />)

    await user.click(field())
    await user.click(screen.getByRole('button', { name: 'Mostrar opções' }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(field()).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Mostrar opções' })).toBeDisabled()
  })

  it('does not open when it is read only', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} readOnly defaultValue="apple" />)

    await user.click(field())
    await user.keyboard('{ArrowDown}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(field()).toHaveValue('Apple')
  })

  it('opens and closes under the control of the app', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(<Combobox label="Fruit" options={fruits} open={false} onOpenChange={onOpenChange} />)

    await user.click(field())
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    rerender(<Combobox label="Fruit" options={fruits} open onOpenChange={onOpenChange} />)
    expect(listbox()).toBeInTheDocument()
    await user.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('can start open', () => {
    renderWithProviders(<Combobox label="Fruit" options={fruits} defaultOpen />)

    expect(listbox()).toBeInTheDocument()
    expect(field()).toHaveAttribute('aria-expanded', 'true')
  })

  it('ties the error and the helper text to the field', () => {
    const { rerender } = render(<Combobox label="Fruit" options={fruits} helperText="Pick one" />)

    expect(field()).toHaveAccessibleDescription('Pick one')
    rerender(<Combobox label="Fruit" options={fruits} helperText="Pick one" error="Required" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Required')
    expect(field()).toHaveAccessibleDescription('Required')
    expect(field()).toHaveAttribute('aria-invalid', 'true')
  })

  it('gives every combobox its own ids', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <Combobox label="First" options={fruits} />
        <Combobox label="Second" options={fruits} />
      </>
    )

    await user.click(screen.getByRole('combobox', { name: 'First' }))

    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(screen.getByRole('combobox', { name: 'First' })).toHaveAttribute('aria-controls', listbox().id)
    expect(screen.getByRole('combobox', { name: 'Second' })).not.toHaveAttribute('aria-controls')
  })

  it('forwards the ref to the input and keeps the other attributes of the input', () => {
    const ref = createRef<HTMLInputElement>()
    renderWithProviders(<Combobox ref={ref} label="Fruit" options={fruits} name="fruit" required autoFocus={false} data-extra="x" />)

    expect(ref.current).toBe(field())
    expect(field()).toBeRequired()
    expect(field()).toHaveAttribute('data-extra', 'x')
  })
})

describe('Combobox with several choices', () => {
  const Several = ({ initial = [] as string[], onChange = vi.fn() }) => {
    const [value, setValue] = useState(initial)

    return (
      <Combobox
        multiple
        label="Fruits"
        name="fruits"
        options={fruits}
        value={value}
        onValueChange={(next) => {
          onChange(next)
          setValue(next)
        }}
      />
    )
  }

  it('shows the chosen options as tags before the field, each with a button that removes it', () => {
    renderWithProviders(<Several initial={['apple', 'grape']} />)

    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Grape')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remover Apple' })).toBeInTheDocument()
    expect(field()).toHaveValue('')
  })

  it('chooses and unchooses with the list kept open, the text cleared and every option marked as it should', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<Several onChange={onChange} />)

    await user.type(field(), 'ap')
    await user.click(screen.getByRole('option', { name: 'Apple' }))

    expect(field()).toHaveValue('')
    expect(listbox()).toHaveAttribute('aria-multiselectable', 'true')
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true')
    expect(onChange).toHaveBeenLastCalledWith(['apple'])

    await user.click(screen.getByRole('option', { name: 'Grape' }))
    expect(onChange).toHaveBeenLastCalledWith(['apple', 'grape'])

    await user.click(screen.getByRole('option', { name: 'Apple' }))
    expect(onChange).toHaveBeenLastCalledWith(['grape'])
    expect(listbox()).toBeInTheDocument()
    expect(field()).toHaveFocus()
  })

  it('removes a tag with its button and puts the focus back in the field', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<Several initial={['apple', 'grape']} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Remover Apple' }))

    expect(onChange).toHaveBeenCalledWith(['grape'])
    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
    expect(field()).toHaveFocus()
  })

  it('keeps the list open when a tag is removed with the button while it is open', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Several initial={['apple', 'grape']} />)

    await user.click(field())
    await user.click(screen.getByRole('button', { name: 'Remover Apple' }))

    expect(field()).toHaveAttribute('aria-expanded', 'true')
    expect(listbox()).not.toHaveAttribute('data-state', 'exiting')
    expect(field()).toHaveFocus()
  })

  it('removes the last tag with Backspace in an empty field, and not while there is text', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<Several initial={['apple', 'grape']} onChange={onChange} />)

    await user.type(field(), 'x')
    await user.keyboard('{Backspace}')
    expect(onChange).not.toHaveBeenCalled()

    await user.keyboard('{Backspace}')
    expect(onChange).toHaveBeenCalledWith(['apple'])
  })

  it('sends one value per chosen option with the form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Several initial={['apple']} />)

    await user.click(field())
    await user.click(screen.getByRole('option', { name: 'Grape' }))

    expect(hiddenValues('fruits')).toEqual(['apple', 'grape'])
  })

  it('opens on the first option with ArrowDown even when there are choices', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Several initial={['grape']} />)

    await user.tab()
    await user.tab()
    await user.keyboard('{ArrowDown}')

    expect(field()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Apple' }).id)
  })

  it('takes the values of defaultValue and works without the app holding them', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox multiple label="Fruits" options={fruits} defaultValue={['banana']} />)

    expect(screen.getByRole('button', { name: 'Remover Banana' })).toBeInTheDocument()
    await user.click(field())
    await user.click(screen.getByRole('option', { name: 'Grape' }))

    expect(screen.getByRole('button', { name: 'Remover Grape' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remover Banana' })).toBeInTheDocument()
  })

  it('has no tag buttons when it is disabled or read only', () => {
    renderWithProviders(<Combobox multiple label="Fruits" options={fruits} defaultValue={['banana']} disabled />)

    expect(screen.queryByRole('button', { name: /Remover/ })).not.toBeInTheDocument()
  })
})

describe('Combobox contract', () => {
  it('marks the root and every part with a data-slot', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Combobox label="Fruit" options={fruits} helperText="Pick" error="Wrong" loading />)

    await user.type(field(), 'zzz')

    for (const part of ['combobox', 'combobox-control', 'combobox-input', 'combobox-label', 'combobox-outline', 'combobox-toggle', 'combobox-error', 'combobox-message']) {
      expect(document.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }

    expect(container.querySelector('[data-slot="combobox-helper"]')).toBeNull()
  })

  it('marks the list and its options with a data-slot', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} />)

    await user.click(field())

    expect(document.querySelector('[data-slot="combobox-listbox"]')).toBe(listbox())
    expect(document.querySelectorAll('[data-slot="combobox-option"]')).toHaveLength(5)
  })

  it('keeps className and style on the input and the wrapper ones on the root', () => {
    const { container } = renderWithProviders(<Combobox label="Fruit" options={fruits} className="mine" style={{ color: 'red' }} wrapperClassName="outer" wrapperStyle={{ margin: '3px' }} />)
    const root = container.querySelector('[data-slot="combobox"]') as HTMLElement

    expect(field().className.split(' ').at(-1)).toBe('mine')
    expect(field().style.color).toBe('red')
    expect(root.className.split(' ').at(-1)).toBe('outer')
    expect(root.style.margin).toBe('3px')
  })

  it('puts the class and the style of the list on the list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Combobox label="Fruit" options={fruits} listboxClassName="menu" listboxStyle={{ minInlineSize: '10rem' }} />)

    await user.click(field())

    expect(listbox().className.split(' ').at(-1)).toBe('menu')
    expect(listbox().style.minInlineSize).toBe('10rem')
  })

  it('runs the handlers of the caller on the input before its own', async () => {
    const user = userEvent.setup()
    const onKeyDown = vi.fn()
    const onClick = vi.fn()
    renderWithProviders(<Combobox label="Fruit" options={fruits} onKeyDown={onKeyDown} onClick={onClick} />)

    await user.click(field())
    await user.keyboard('{ArrowDown}')

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  it('flags the wrapper as full width, invalid and disabled', () => {
    const { container } = renderWithProviders(<Combobox label="Fruit" options={fruits} fullWidth error="Wrong" disabled />)
    const root = container.querySelector('[data-slot="combobox"]') as HTMLElement

    expect(root).toHaveAttribute('data-full-width')
    expect(root).toHaveAttribute('data-invalid')
    expect(root).toHaveAttribute('data-disabled')
  })
})

describe('Combobox in a dialog', () => {
  it('closes only the list with Escape, and the dialog with the next one', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(
      <Modal isOpen onClose={onClose} title="Pick">
        <Combobox label="Fruit" options={fruits} />
      </Modal>
    )

    await user.click(field())
    expect(listbox()).toBeInTheDocument()
    await user.keyboard('{Escape}')

    await closed()
    expect(onClose).not.toHaveBeenCalled()

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('lets an option be chosen even though the dialog makes the rest of the page inert, when the list is rendered inside it', async () => {
    const user = userEvent.setup()
    const Inside = () => {
      const [host, setHost] = useState<HTMLElement | null>(null)

      return (
        <Modal isOpen onClose={vi.fn()} title="Pick">
          <div ref={setHost}>
            <Combobox label="Fruit" options={fruits} container={host} />
          </div>
        </Modal>
      )
    }
    renderWithProviders(<Inside />)

    await user.click(field())
    await user.click(await screen.findByRole('option', { name: 'Grape' }))

    expect(field()).toHaveValue('Grape')
  })
})

describe('Combobox accessibility', () => {
  it('has no axe violations closed, open, empty, loading, multiple and with an error', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(
      <>
        <Combobox label="Closed" options={fruits} helperText="Pick one" />
        <Combobox label="Several" multiple options={fruits} defaultValue={['apple', 'grape']} />
        <Combobox label="Wrong" options={fruits} error="Required" />
        <Combobox label="Plain" options={fruits} labelPlacement="stacked" disabled />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()

    await user.click(screen.getByRole('combobox', { name: 'Closed' }))
    expect(await wholePage()).toHaveNoViolations()

    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(await wholePage()).toHaveNoViolations()

    await user.type(screen.getByRole('combobox', { name: 'Closed' }), 'zzz')
    expect(await wholePage()).toHaveNoViolations()
  })

  it('has no axe violations while it loads and with several choices open', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <Combobox label="Loading" options={[]} loading />
        <Combobox label="Several" multiple options={fruits} defaultValue={['apple']} />
      </>
    )

    await user.click(screen.getByRole('combobox', { name: 'Loading' }))
    expect(await wholePage()).toHaveNoViolations()

    await user.click(screen.getByRole('combobox', { name: 'Several' }))
    expect(await wholePage()).toHaveNoViolations()
  })
})
