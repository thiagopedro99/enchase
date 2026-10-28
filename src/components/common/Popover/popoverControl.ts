import { createContext, useContext } from 'react'

import type { PopoverControl } from './types.ts'

export const PopoverControlContext = createContext<PopoverControl | null>(null)

export const usePopoverControl = () => useContext(PopoverControlContext)
