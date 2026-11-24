import { SegmentedControl, Select, useBreakpoint } from 'enchase'

import { defaultLabelled, defaultSize, segmentedMinWidth, styleOptions } from './defaultData.ts'
import { useWidth } from './useWidth.ts'
import styles from './styles.module.css'

import type { StylePickerProps } from './types.ts'
import type { LookStyle } from '../../types.ts'

const StylePicker = ({ name, value, onChange, labelled = defaultLabelled, size = defaultSize }: StylePickerProps) => {
  const { up } = useBreakpoint()
  const { ref, width } = useWidth<HTMLDivElement>()
  const naming = labelled ? { label: name } : {}
  const segmented = width > 0 ? width >= segmentedMinWidth : up('sm')

  return (
    <div ref={ref} className={styles.picker}>
      {segmented ? (
        <SegmentedControl {...naming} ariaLabel={name} items={styleOptions} value={value} onValueChange={(style: string) => onChange(style as LookStyle)} size={size} fullWidth />
      ) : (
        <Select {...naming} aria-label={labelled ? undefined : name} options={styleOptions} value={value} onChange={({ target }) => onChange(target.value as LookStyle)} fullWidth />
      )}
    </div>
  )
}

export default StylePicker
