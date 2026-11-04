import { createContext, useContext } from 'react'

import { shared } from '@utils/shared.ts'

import type { PopoverControl } from './types.ts'

export const PopoverControlContext = shared('popoverControlContext.v1', () => createContext<PopoverControl | null>(null))

export const usePopoverControl = () => useContext(PopoverControlContext)
