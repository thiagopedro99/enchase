import { useContext } from 'react'

import { ColorModeContext } from '../components/colorMode/context.ts'

export const useColorMode = () => {
  const value = useContext(ColorModeContext)

  if (!value) throw new Error('useColorMode must be used within a ColorModeProvider')

  return value
}
