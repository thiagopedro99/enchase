import { useState } from 'react'
import { Button, DatePicker, Flex, UIProvider } from 'enchase'
import { en, ptBR } from 'enchase/locales'
import { containerArgType } from '@docs/shared/argTypes.ts'
import { defaultFullWidth, defaultOpen, firstWeekday, isWeekend, maxDate, minDate } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const noteStyle = { fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }

const ControlledDemo = () => {
  const [value, setValue] = useState<string | null>('2026-10-28')

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <DatePicker label="Date" value={value} onValueChange={setValue} />
      <div style={noteStyle}>Chosen date: {value ?? 'none'}</div>
      <Flex gap="0.5rem" wrap>
        <Button variant="outline" size="sm" onClick={() => setValue('2026-12-25')}>
          Set Christmas
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setValue(null)}>
          Clear
        </Button>
      </Flex>
    </div>
  )
}

const LanguagesDemo = () => {
  const [name, setName] = useState('en')
  const locales = { en, ptBR, de: { ...en, locale: 'de' }, ja: { ...en, locale: 'ja' }, ar: { ...en, locale: 'ar', dir: 'rtl' as const } }
  const locale = locales[name as keyof typeof locales]

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <Flex gap="0.5rem" wrap>
        {Object.keys(locales).map((key) => (
          <Button key={key} variant={key === name ? 'primary' : 'outline'} size="sm" onClick={() => setName(key)}>
            {key}
          </Button>
        ))}
      </Flex>
      <div dir={locale.dir}>
        <UIProvider key={name} locale={locale}>
          <DatePicker label="Date" defaultValue="2026-10-28" />
        </UIProvider>
      </div>
      <div style={noteStyle}>The language of the provider decides the order, the separators and the digits of the text, the names of the months and of the weekdays, and the first day of the week.</div>
    </div>
  )
}

const FormDemo = () => {
  const [submitted, setSubmitted] = useState<string | null>(null)

  return (
    <form
      style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}
      onSubmit={(event) => {
        event.preventDefault()

        const data = new FormData(event.currentTarget)

        setSubmitted(JSON.stringify({ birthday: data.get('birthday') }))
      }}
    >
      <DatePicker label="Birthday" name="birthday" defaultValue="1990-05-17" />
      <Button type="submit">Submit</Button>
      <div style={noteStyle}>{submitted === null ? 'Submit to see what the form sends' : `The form sent ${submitted}`}</div>
    </form>
  )
}

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  args: {
    label: 'Date',
    fullWidth: defaultFullWidth,
    defaultOpen,
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component:
          'A field for a single date. The user types it, in the order and with the separators of the language of the `UIProvider` (28/10/2026 in pt-BR, 10/28/2026 in en, and the compact 28102026 or the ISO 2026-10-28 are read too), or presses the button at the end of the field to choose it in a calendar that opens in a dialog. The value is a string in the local ISO form, `YYYY-MM-DD`, with no time and no time zone, the same text that `<input type="date">` gives, or `null` when the field is empty: no `Date` object is involved, so the day never moves with the zone of the machine. The text is read when the user leaves the field or presses Enter, and what is not a date, or is a date that `min`, `max` or `isDateDisabled` rule out, is put back as it was. The calendar is a grid: the arrow keys move by a day and by a week, Home and End go to the start and to the end of the week, Page Up and Page Down change the month and Shift with them the year, Enter and Space choose the day and Esc closes the calendar and gives the focus back to the button. It opens with the focus on the chosen day, or on today. The names of the months and of the weekdays, the first day of the week and the right-to-left mirroring follow the language of the `UIProvider`. Today is read in the browser when the calendar opens, so the server renders only the field. The calendar renders in a portal, like the `Popover`, and accepts `container`. It accepts `ref`, which goes to the input, and the attributes of the `<input>`.'
      }
    }
  },
  argTypes: {
    value: {
      description: 'Date of the field when it is controlled, as `YYYY-MM-DD`, or `null` for an empty field. It also requires onValueChange. Text that is not a date counts as empty. See the Controlled story.',
      control: false,
      table: { type: { summary: 'string | null' } }
    },
    defaultValue: {
      description: 'Date at the start, as `YYYY-MM-DD`, for use without external control. Without it, the field starts empty.',
      control: false,
      table: { type: { summary: 'string | null' } }
    },
    onValueChange: {
      description: 'Called with the new date as `YYYY-MM-DD`, or with `null` when the user empties the field, when the user chooses a day or when the typed text is confirmed. It is not called for text that is not a date, for a date that is ruled out, nor for the date the field already has.',
      control: false,
      table: { type: { summary: '(value: string | null) => void' } }
    },
    min: {
      description: 'Earliest date that can be chosen or typed, as `YYYY-MM-DD`. The days before it are disabled in the calendar and its previous-month button stops at it. See the MinAndMax story.',
      control: 'text'
    },
    max: {
      description: 'Latest date that can be chosen or typed, as `YYYY-MM-DD`. The days after it are disabled in the calendar and its next-month button stops at it.',
      control: 'text'
    },
    isDateDisabled: {
      description: 'Rules out dates one by one: it receives each date as `YYYY-MM-DD` and returns `true` for the ones that cannot be chosen or typed. A disabled day stays in the calendar, with `aria-disabled`, and can be reached with the keyboard but not chosen. See the WeekdaysOnly story.',
      control: false,
      table: { type: { summary: '(date: string) => boolean' } }
    },
    firstDayOfWeek: {
      description: 'First column of the calendar, from 0 (Sunday) to 6 (Saturday). Without it, the language of the provider decides: Sunday in pt-BR and in en, Monday in most of Europe. A number that is not a day of the week is ignored.',
      control: { type: 'number', min: 0, max: 6 },
      table: { type: { summary: 'number' } }
    },
    label: {
      description: 'Label of the field, tied to the input. Without it, give the input an `aria-label`.',
      control: 'text'
    },
    labelPlacement: {
      description: 'Where the label sits: floating (inside the field, moves up to the outline on focus or when filled) or stacked (above the control, with no notch in the outline). Without the prop, the style of the theme (createTheme) applies: floating in the default style and stacked in shadcn.',
      control: 'inline-radio',
      options: ['floating', 'stacked'],
      table: { defaultValue: { summary: "'floating'" } }
    },
    placeholder: {
      description: 'Text shown in the empty input, for example the format the language expects. With a floating label it appears only while the field has the focus.',
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
    open: {
      description: 'Opens and closes the calendar, when you control it. Use it together with onOpenChange.',
      control: false
    },
    defaultOpen: {
      description: 'Whether the calendar starts open, when you do not control it. An open calendar does not take the focus on the first render, so it does not steal it from the page.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultOpen) } }
    },
    onOpenChange: {
      description: 'Called with the new state whenever the calendar opens or closes: the button, Esc, the choice of a day, Enter in the field or a click outside.',
      control: false
    },
    name: {
      description: 'Name the form sends the date under. A hidden input holds the `YYYY-MM-DD` text, or an empty text for an empty field, and the visible input has no name, because the text typed is written in the language of the provider. See the InAForm story.',
      control: 'text'
    },
    form: {
      description: 'Id of the form the hidden input belongs to, for a field outside the form element.',
      control: 'text'
    },
    disabled: {
      description: 'Disables the field and the button, and closes the calendar.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    readOnly: {
      description: 'Shows the date and keeps it from being changed: the button is disabled and the calendar does not open. The field stays in the tab order.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    container: containerArgType,
    animation: {
      description: 'Animation of the calendar when it opens and closes. false turns it off; { tuning: { duration } } sets the duration in seconds.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    },
    id: {
      description: 'Id of the input. The ids of the error and of the helper text are built from it. Without it, the field makes one.',
      control: 'text'
    },
    wrapperClassName: {
      description: 'Class of the root (data-slot="date-picker"). className and style stay on the input (data-slot="date-picker-input").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Style of the root (data-slot="date-picker"). style stays on the input.',
      control: false
    },
    popupClassName: {
      description: 'Class of the dialog that holds the calendar (data-slot="popover-content"), which renders in a portal and not inside the root.',
      control: 'text'
    },
    popupStyle: {
      description: 'Style of the dialog, merged with the library style (yours wins).',
      control: false
    }
  }
} satisfies Meta<typeof DatePicker>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDefaultValue: Story = {
  args: { defaultValue: '2026-10-28' }
}

export const Controlled: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'With `value` and `onValueChange` the app holds the date: the field shows whatever the app passes, and a choice only changes it when the app says so.' } }
  },
  render: () => <ControlledDemo />
}

export const MinAndMax: Story = {
  args: { label: 'Appointment', defaultValue: '2026-10-15', min: minDate, max: maxDate, helperText: 'Between October 5 and October 25' },
  parameters: {
    docs: { description: { story: 'The days outside `min` and `max` are disabled in the calendar, the buttons that change the month stop when the whole month is out of range, and a date typed outside the range is put back.' } }
  }
}

export const WeekdaysOnly: Story = {
  args: { label: 'Delivery', isDateDisabled: isWeekend, defaultValue: '2026-10-28', helperText: 'Weekends are not available' },
  parameters: {
    docs: { description: { story: '`isDateDisabled` rules out any date, here the weekends. A disabled day keeps its place in the grid, is read as unavailable and cannot be chosen or typed.' } }
  }
}

export const MondayFirst: Story = {
  args: { firstDayOfWeek: firstWeekday, defaultValue: '2026-10-28', defaultOpen: true },
  parameters: {
    docs: { description: { story: '`firstDayOfWeek` sets the first column. Home and End follow it, going to the first and to the last day of that week.' } }
  }
}

export const Languages: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'The language of the `UIProvider` decides how the date is written and read, the names in the calendar, the first day of the week and the direction: with `dir: "rtl"` the grid and its buttons mirror. The `dir` of the page is still up to the app, as in this demo.' } }
  },
  render: () => <LanguagesDemo />
}

export const InAForm: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'With `name`, the form sends the date as `YYYY-MM-DD`, whatever the language of the field, or an empty text when the field is empty.' } }
  },
  render: () => <FormDemo />
}

export const WithHelperText: Story = {
  args: { helperText: 'Type it or open the calendar' }
}

export const WithError: Story = {
  args: { error: 'Choose a date' }
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: '2026-10-28' }
}

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: '2026-10-28' }
}

export const LabelAbove: Story = {
  args: { labelPlacement: 'stacked' }
}

export const WithoutMotion: Story = {
  args: { animation: false }
}
