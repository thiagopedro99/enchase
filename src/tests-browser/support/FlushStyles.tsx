import { useLayoutEffect } from 'react'

export const FlushStyles = () => {
  useLayoutEffect(() => {
    getComputedStyle(document.documentElement).getPropertyValue('display')
  })

  return null
}
