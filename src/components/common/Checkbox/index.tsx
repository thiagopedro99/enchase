import { forwardRef, useLayoutEffect, useMemo, useRef } from 'react'

import { defaultIndeterminate } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeRefs } from '@utils/mergeRefs.ts'
import styles from './styles.module.css'

import type { CheckboxProps } from './types.ts'

const markBase = { duration: 0.15, scale: 0.6, distance: 0 }

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, indeterminate = defaultIndeterminate, wrapperClassName, wrapperStyle, animation, ...props }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const indeterminateRef = useRef(indeterminate)
  const mergedRef = useMemo(() => mergeRefs(inputRef, ref), [ref])
  const motionStyle = useMotionStyle('pop', 'checkbox', animation, undefined, markBase)

  const keepIndeterminate = () => {
    queueMicrotask(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminateRef.current
    })
  }

  const wrapper = mergeProps({ ...slot('checkbox'), className: styles.wrapper, style: motionStyle, 'data-disabled': props.disabled ? '' : undefined }, { className: wrapperClassName, style: wrapperStyle })
  const field = mergeProps({ ...slot('checkbox', 'input'), className: styles.hidden, onClick: keepIndeterminate }, props)

  useLayoutEffect(() => {
    indeterminateRef.current = indeterminate

    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label {...wrapper}>
      <input ref={mergedRef} type="checkbox" {...field} />
      <span className={styles.box} aria-hidden="true" {...slot('checkbox', 'box')}>
        <span className={styles.icon} />
      </span>
      {label && (
        <span className={styles.label} {...slot('checkbox', 'label')}>
          {label}
        </span>
      )}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
