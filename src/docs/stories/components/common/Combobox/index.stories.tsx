import { useEffect, useRef, useState } from 'react'
import { Button, Combobox, Flex } from 'enchase'
import { fieldVariants, labelPlacements, requiredArgType, requiredStoryDescription, variantArgType, variantLabels, variantsStoryDescription } from '@docs/shared/fields.ts'
import { containerArgType } from '@docs/shared/argTypes.ts'
import { countries, defaultFullWidth, defaultLoading, defaultMultiple, defaultOpen, frameworks, searchCountries, searchDelay } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComboboxOption } from 'enchase'
import type { CSSProperties } from 'react'

const noteStyle = { fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }

const HooksDemo = () => {
  const [host, setHost] = useState<HTMLElement | null>(null)

  return (
    <div ref={setHost} style={{ minBlockSize: '16rem', '--enchase-combobox-option-background-selected': 'var(--enchase-color-secondary-container)' } as CSSProperties}>
      <Combobox label="Framework" options={frameworks} defaultValue="react" defaultOpen container={host} />
    </div>
  )
}

const ControlledDemo = () => {
  const [value, setValue] = useState<string | null>('react')

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <Combobox label="Framework" options={frameworks} value={value} onValueChange={setValue} />
      <div style={noteStyle}>Chosen value: {value ?? 'none'}</div>
      <Flex gap="0.5rem" wrap>
        <Button variant="outline" size="sm" onClick={() => setValue('vue')}>
          Choose Vue
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setValue(null)}>
          Clear
        </Button>
      </Flex>
    </div>
  )
}

const MultipleDemo = () => {
  const [value, setValue] = useState(['react', 'svelte'])

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <Combobox multiple label="Frameworks" placeholder="Add a framework" options={frameworks} value={value} onValueChange={setValue} />
      <div style={noteStyle}>Chosen values: {value.length === 0 ? 'none' : value.join(', ')}</div>
    </div>
  )
}

const AsyncDemo = () => {
  const [results, setResults] = useState<ComboboxOption[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const search = (query: string) => {
    window.clearTimeout(timer.current)

    if (query.trim() === '') {
      setResults([])
      setLoading(false)

      return
    }

    setLoading(true)
    timer.current = window.setTimeout(() => {
      setResults(searchCountries(query))
      setLoading(false)
    }, searchDelay)
  }

  return <Combobox label="Country" placeholder="Type to search" options={results} filter={false} loading={loading} onInputChange={search} helperText="The options come from a pretend server that answers after a short wait" />
}

const FormDemo = () => {
  const [submitted, setSubmitted] = useState<string | null>(null)

  return (
    <form
      style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}
      onSubmit={(event) => {
        event.preventDefault()

        const data = new FormData(event.currentTarget)

        setSubmitted(JSON.stringify({ framework: data.getAll('framework'), countries: data.getAll('countries') }))
      }}
    >
      <Combobox label="Framework" name="framework" options={frameworks} defaultValue="react" />
      <Combobox multiple label="Countries" name="countries" options={countries} defaultValue={['brazil', 'portugal']} />
      <Button type="submit">Submit</Button>
      <div style={noteStyle}>{submitted === null ? 'Submit to see what the form sends' : `The form sent ${submitted}`}</div>
    </form>
  )
}

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  args: {
    label: 'Framework',
    placeholder: 'Search a framework',
    options: frameworks,
    fullWidth: defaultFullWidth,
    loading: defaultLoading,
    defaultOpen,
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component:
          'A text field with a list of options under it. Typing filters the options, the arrow keys move through the list, Enter chooses the active option, Esc closes the list and Tab leaves the field. It follows the ARIA 1.2 combobox pattern: the focus never leaves the input and the active option is announced through `aria-activedescendant`, so a screen reader keeps reading the field while the list changes. By default it chooses one option and its label fills the field; with `multiple` the chosen options become tags before the input, each with a button that removes it, and Backspace in an empty field removes the last one. Use it instead of the `Select` when the list is long enough to need a search, or when the options come from a server: turn the filter off and search in `onInputChange`. It is not a free text field: the value is always one of the options, and leaving the field puts the label of the chosen option back. The list renders in a portal, like the `Popover`, and accepts `container`. It accepts `ref`, which goes to the input, and the attributes of the `<input>`.'
      }
    }
  },
  argTypes: {
    options: {
      description: 'The options, in order. Each one has `value` (unique), `label` (the text that is shown, filtered and read) and, optionally, `disabled`: a disabled option stays in the list, is skipped by the arrow keys and cannot be chosen. The label of a chosen option is remembered, so a list that the app replaces while the user searches does not blank the field or the tags.',
      control: false,
      table: { type: { summary: 'ComboboxOption[]' } }
    },
    multiple: {
      description: 'Chooses several options instead of one. The chosen options become tags before the input, the list stays open after a choice and the text is cleared, and `value` and `defaultValue` become lists. See the Multiple story.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: String(defaultMultiple) } }
    },
    value: {
      description: 'Value of the chosen option when the field is controlled, or the list of the chosen values with `multiple`. It also requires onValueChange. Pass `null`, or an empty list, to control it with nothing chosen. See the Controlled story.',
      control: false,
      table: { type: { summary: 'string | null | string[]' } }
    },
    defaultValue: {
      description: 'Option chosen at the start, or the list of the chosen ones with `multiple`, for use without external control. Without it, nothing is chosen.',
      control: false,
      table: { type: { summary: 'string | null | string[]' } }
    },
    onValueChange: {
      description: 'Called with the value of the option the user has just chosen, or `null` when the user empties the field and leaves it, and with the whole list of the chosen values, in the order they were chosen, with `multiple`. It is not called for an option that is disabled.',
      control: false,
      table: { type: { summary: '((value: string | null) => void) | ((value: string[]) => void)' } }
    },
    label: {
      description: 'Label of the field, tied to the input and used as the name of the list. Without it, give the input an `aria-label`.',
      control: 'text'
    },
    labelPlacement: {
      description: 'Where the label sits: floating (inside the field, moves up to the outline on focus or when filled), stacked (above the control, with no notch in the outline) or start (before the control, on the same line: the column of the label is as wide as `--enchase-input-label-width`, 7.5rem by default, and the error and the helper text go under the control). Without the prop, the style of the theme (createTheme) applies: floating in the default style and stacked in shadcn. With a variant other than outlined, a floating label is drawn above the field.',
      control: 'inline-radio',
      options: ['floating', 'stacked', 'start'],
      table: { defaultValue: { summary: "'floating'" } }
    },
    variant: variantArgType,
    required: requiredArgType,
    placeholder: {
      description: 'Text shown in the empty input. With a floating label it appears only while the field has the focus.',
      control: 'text'
    },
    helperText: {
      description: 'Helper text. It is tied to the input by aria-describedby and disappears when there is an error.',
      control: 'text'
    },
    error: {
      description: 'Error message. Marks the field as invalid (aria-invalid) and is announced as an alert.',
      control: 'text'
    },
    fullWidth: {
      description: 'Takes up the full available width.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultFullWidth) } }
    },
    filter: {
      description: 'How the options are filtered by what is typed. By default an option stays when its label contains the text, ignoring case and accents. Pass a function `(option, query) => boolean` to decide for yourself, or `false` to show every option, for when the app searches on a server and passes the results as `options`. See the AsyncSearch and CustomFilter stories.',
      control: false,
      table: { type: { summary: '((option: ComboboxOption, query: string) => boolean) | false' } }
    },
    onInputChange: {
      description: 'Called with the text of the input every time the user types, and with an empty text when a choice clears it with `multiple`. Use it to search on a server. Choosing an option in the single mode does not call it.',
      control: false,
      table: { type: { summary: '(text: string) => void' } }
    },
    loading: {
      description: 'Shows a loading row after the options, marks the list as busy (aria-busy) and announces it in a status region. Use it while the options are on their way.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultLoading) } }
    },
    open: {
      description: 'Opens and closes the list, when you control it. Use it together with onOpenChange.',
      control: false
    },
    defaultOpen: {
      description: 'Whether the list starts open, when you do not control it.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultOpen) } }
    },
    onOpenChange: {
      description: 'Called with the new state whenever the list opens or closes: typing, a click, the arrow keys, Esc, a choice or a click outside.',
      control: false
    },
    name: {
      description: 'Name the form sends the value under. A hidden input is rendered for each chosen value, so a form with `multiple` sends one entry per choice and a form with nothing chosen sends none. The visible input has no name, because what is typed is not the value. See the InAForm story.',
      control: 'text'
    },
    form: {
      description: 'Id of the form the hidden inputs belong to, for a field outside the form element.',
      control: 'text'
    },
    disabled: {
      description: 'Disables the field, the tags and the toggle.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    readOnly: {
      description: 'Shows the value and keeps it from being changed: the list does not open and the tags have no remove button. The field stays in the tab order.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    container: containerArgType,
    animation: {
      description: 'Animation of the list when it opens and closes. false turns it off; { tuning: { duration } } sets the duration in seconds.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    },
    id: {
      description: 'Id of the input. The ids of the list, of the options, of the error and of the helper text are built from it. Without it, the field makes one.',
      control: 'text'
    },
    wrapperClassName: {
      description: 'Class of the root (data-slot="combobox"). className and style stay on the input (data-slot="combobox-input").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Style of the root (data-slot="combobox"). style stays on the input.',
      control: false
    },
    listboxClassName: {
      description: 'Class of the list (data-slot="combobox-listbox"), which renders in a portal and not inside the root. Each option is data-slot="combobox-option".',
      control: 'text'
    },
    listboxStyle: {
      description: 'Style of the list, merged with the library style (yours wins).',
      control: false
    }
  }
} satisfies Meta<typeof Combobox>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDefaultValue: Story = {
  args: { defaultValue: 'react' }
}

export const Multiple: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'With `multiple` the chosen options are tags before the input. The list stays open for the next choice, a click on a chosen option unchooses it, and Backspace in the empty field removes the last tag.' } }
  },
  render: () => <MultipleDemo />
}

export const Controlled: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'With `value` and `onValueChange` the app holds the choice: the field shows whatever the app passes, and a choice only changes it when the app says so.' } }
  },
  render: () => <ControlledDemo />
}

export const AsyncSearch: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'The filter is off (`filter={false}`), `onInputChange` starts a search and `loading` shows that it is on its way. The options that come back replace the old ones, and the label of the option that was chosen stays in the field.' } }
  },
  render: () => <AsyncDemo />
}

export const CustomFilter: Story = {
  args: {
    label: 'Country',
    placeholder: 'Type the first letters',
    options: countries,
    filter: (option, query) => option.label.toLowerCase().startsWith(query.toLowerCase())
  },
  parameters: {
    docs: { description: { story: 'A `filter` function decides which options stay. This one keeps the options that start with the text, instead of the ones that contain it.' } }
  }
}

export const LongList: Story = {
  args: { label: 'Country', placeholder: 'Search a country', options: countries },
  parameters: {
    docs: { description: { story: 'The list takes the room it has and scrolls inside when it is longer, and the active option is kept in view as the arrow keys move.' } }
  }
}

export const InAForm: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'With `name`, each chosen value goes in the form as an entry of its own, so the single field sends one value and the field with `multiple` sends one per choice. The text typed in the input is not sent.' } }
  },
  render: () => <FormDemo />
}

export const WithHelperText: Story = {
  args: { helperText: 'Type to filter the list' }
}

export const WithError: Story = {
  args: { error: 'Choose a framework' }
}

export const Loading: Story = {
  args: { loading: true, defaultOpen: true },
  parameters: {
    docs: { description: { story: 'The loading row comes after the options. Without options it is the only row.' } }
  }
}

export const NoResults: Story = {
  args: { options: [], defaultOpen: true },
  parameters: {
    docs: { description: { story: 'When nothing matches, a row says so, and a status region announces it to screen readers.' } }
  }
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'react' }
}

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'react' }
}

export const LabelAbove: Story = {
  args: { labelPlacement: 'stacked' }
}

export const WithoutMotion: Story = {
  args: { animation: false }
}

export const Variants: Story = {
  parameters: { controls: { disable: true }, docs: { description: { story: variantsStoryDescription } } },
  render: (args) => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {fieldVariants.map((variant) => (
        <Combobox key={variant} {...args} variant={variant} label={variantLabels[variant]} />
      ))}
    </div>
  )
}

export const LabelStart: Story = {
  args: { labelPlacement: 'start' }
}

export const Required: Story = {
  parameters: { controls: { disable: true }, docs: { description: { story: requiredStoryDescription } } },
  render: (args) => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {labelPlacements.map((labelPlacement) => (
        <Combobox key={labelPlacement} {...args} required labelPlacement={labelPlacement} label={`Label ${labelPlacement}`} />
      ))}
    </div>
  )
}

export const CustomHooks: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'The selected option of the list has no background of its own: it takes its weight from `--enchase-combobox-option-font-weight-selected` and its background from `--enchase-combobox-option-background-selected`, transparent when it is not set. The layer of an option under the pointer or reached by the keyboard stays over it, as it does over the checked option of the `Select`. The list opens in a portal, so the hook reaches it through the `container` prop: here the wrapper that holds the hook is the container, and the selected option is filled with the container of the secondary role.'
      }
    }
  },
  render: () => <HooksDemo />
}
