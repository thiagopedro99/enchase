import { createContext } from 'react'

import { shared } from '@utils/shared.ts'

import type { ToastContextType } from './types.ts'

export const ToastContext = shared('toastContext.v1', () => createContext<ToastContextType | undefined>(undefined))
