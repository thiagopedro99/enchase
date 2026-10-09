import { createContext } from 'react'

export type NavigateFunction = (href: string) => void

export const NavigateContext = createContext<NavigateFunction | undefined>(undefined)

export const CurrentHrefContext = createContext<string | undefined>(undefined)
