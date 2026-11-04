import { createContext } from 'react'

import { defaultUIConfig } from './defaultData.ts'
import { shared } from '@utils/shared.ts'

import type { UIConfig } from './types.ts'

export const UIContext = shared('uiContext.v1', () => createContext<UIConfig>(defaultUIConfig))
