import { useCallback, useEffect, useRef } from 'react'

const stack: symbol[] = []

export const useOverlayStack = (active: boolean) => {
  const token = useRef(Symbol('overlay'))

  useEffect(() => {
    if (!active) return undefined

    const current = token.current
    stack.push(current)

    return () => {
      const index = stack.indexOf(current)
      if (index >= 0) stack.splice(index, 1)
    }
  }, [active])

  return useCallback(() => stack[stack.length - 1] === token.current, [])
}
