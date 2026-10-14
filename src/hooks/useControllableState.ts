import { useCallback, useRef, useState } from 'react'

export const useControllableState = <T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) => {
  const [internal, setInternal] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internal
  const currentRef = useRef(current)
  currentRef.current = current

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (previous: T) => T)(currentRef.current) : next
      if (Object.is(resolved, currentRef.current)) return
      currentRef.current = resolved
      if (!controlled) setInternal(resolved)
      onChange?.(resolved)
    },
    [controlled, onChange]
  )

  return [current, setValue] as const
}
