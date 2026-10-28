import { useEffect, useRef } from 'react'

import { CheckIcon } from '../../../Icon/icons/CheckIcon.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { optionIdOf } from '../../optionId.ts'
import { slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { PointerEvent } from 'react'
import type { ComboboxOption } from '../../types.ts'
import type { ComboboxOptionsProps } from './types.ts'

export const ComboboxOptions = ({ options, selected, active, idPrefix, empty, loading, onActivate, onChoose }: ComboboxOptionsProps) => {
  const { labels } = useUIConfig()
  const activeRef = useRef<HTMLDivElement>(null)
  const pointer = useRef<[number, number] | null>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [active])

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>, option: ComboboxOption, index: number) => {
    const [x, y] = pointer.current ?? []
    const stationary = event.isTrusted && x === event.clientX && y === event.clientY

    pointer.current = [event.clientX, event.clientY]

    if (stationary || event.pointerType === 'touch' || option.disabled || active === index) return

    onActivate(index)
  }

  return (
    <>
      {options.map((option, index) => {
        const isSelected = selected.includes(option.value)

        return (
          <div
            key={option.value}
            ref={index === active ? activeRef : undefined}
            id={optionIdOf(idPrefix, index)}
            role="option"
            className={styles.option}
            aria-selected={isSelected}
            aria-disabled={option.disabled || undefined}
            data-active={index === active ? '' : undefined}
            onPointerMove={(event) => handlePointerMove(event, option, index)}
            onClick={() => onChoose(option)}
            {...slot('combobox', 'option')}
          >
            <span className={styles.optionLabel}>{option.label}</span>
            {isSelected && <CheckIcon size={18} />}
          </div>
        )
      })}

      {empty && (
        <div role="option" aria-selected="false" aria-disabled="true" className={styles.message} data-message="empty" {...slot('combobox', 'message')}>
          {labels.noResults}
        </div>
      )}

      {loading && (
        <div role="option" aria-selected="false" aria-disabled="true" className={styles.message} data-message="loading" {...slot('combobox', 'message')}>
          {labels.loading}
        </div>
      )}
    </>
  )
}

export default ComboboxOptions
