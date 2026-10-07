import { createContext } from 'react'

import { defaultUIConfig } from './defaultData.ts'

import type { UIConfig } from './types.ts'

export const UIContext = createContext<UIConfig>(defaultUIConfig)
