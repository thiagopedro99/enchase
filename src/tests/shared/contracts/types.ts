import type { RenderWithProvidersOptions } from '@tests/types.ts'
import type { ReactElement, ReactNode } from 'react'

export type DialogContractAdapter = {
  name: string
  triggerName: string | RegExp
  render: () => ReactElement
  role?: 'dialog' | 'alertdialog'
  dialogName?: string | RegExp
  options?: RenderWithProvidersOptions
  before?: () => void
  after?: () => void
}

export type ControlledDialogState = {
  open: boolean
  close: () => void
}

export interface ControlledDialogProps {
  children: (state: ControlledDialogState) => ReactNode
  triggerLabel?: string
}
