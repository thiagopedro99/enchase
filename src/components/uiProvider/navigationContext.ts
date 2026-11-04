import { createContext } from 'react'

import { shared } from '@utils/shared.ts'

export type NavigateFunction = (href: string) => void

export const NavigateContext = shared('navigateContext.v1', () => createContext<NavigateFunction | undefined>(undefined))

export const CurrentHrefContext = shared('currentHrefContext.v1', () => createContext<string | undefined>(undefined))
