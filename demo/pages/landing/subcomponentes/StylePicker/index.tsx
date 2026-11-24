import { SegmentedControl, Select, useBreakpoint } from 'enchase'

import { defaultLabelled, defaultSize, styleOptions } from './defaultData.ts'

import type { StylePickerProps } from './types.ts'
import type { LookStyle } from '../../types.ts'

const StylePicker = ({ name, value, onChange, labelled = defaultLabelled, size = defaultSize }: StylePickerProps) => {
  const { up } = useBreakpoint()
  const naming = labelled ? { label: name } : {}

  if (up('sm')) return <SegmentedControl {...naming} ariaLabel={name} items={styleOptions} value={value} onValueChange={(style: string) => onChange(style as LookStyle)} size={size} fullWidth />

  return <Select {...naming} aria-label={labelled ? undefined : name} options={styleOptions} value={value} onChange={({ target }) => onChange(target.value as LookStyle)} fullWidth />
}

export default StylePicker
