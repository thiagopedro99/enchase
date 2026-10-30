import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { DatePicker } from '@components/common/DatePicker/index.tsx'
import { Combobox } from '@components/common/Combobox/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Input } from '@components/common/Input/index.tsx'

import type { FieldVariant, LabelPlacement } from '@styles/tokens/types.ts'
import type { CSSProperties, ReactElement } from 'react'

export type FieldTestProps = {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  variant?: FieldVariant
  labelPlacement?: LabelPlacement
  wrapperStyle?: CSSProperties
}

export type FieldKind = {
  name: string
  native: string
  fill: string
  render: (props?: FieldTestProps) => ReactElement
}

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' }
]

export const fieldKinds: FieldKind[] = [
  { name: 'input', native: 'input-field', fill: 'input-field', render: (props) => <Input label="Name" {...props} /> },
  { name: 'textarea', native: 'textarea-field', fill: 'textarea-field', render: (props) => <Textarea label="Notes" {...props} /> },
  { name: 'number-input', native: 'number-input-field', fill: 'number-input-field', render: (props) => <NumberInput label="Amount" {...props} /> },
  { name: 'select', native: 'select-field', fill: 'select-field', render: (props) => <Select label="Pick" options={options} {...props} /> },
  { name: 'date-picker', native: 'date-picker-input', fill: 'date-picker-input', render: (props) => <DatePicker label="Date" {...props} /> },
  { name: 'combobox', native: 'combobox-input', fill: 'combobox-control', render: (props) => <Combobox label="Fruit" options={options} {...props} /> }
]
