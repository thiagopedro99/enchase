import { ChevronDownIcon } from '../../../Icon/icons/ChevronDownIcon.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { ComboboxToggleProps } from './types.ts'

export const ComboboxToggle = ({ expanded, controls, disabled, onToggle }: ComboboxToggleProps) => {
  const { labels } = useUIConfig()

  return (
    <button
      type="button"
      tabIndex={-1}
      className={styles.toggle}
      aria-label={labels.showOptions}
      aria-expanded={expanded}
      aria-controls={controls}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
      {...slot('combobox', 'toggle')}
    >
      <ChevronDownIcon size={20} />
    </button>
  )
}

export default ComboboxToggle
