import type { FieldVariant, LabelPlacement } from '@styles/tokens/types.ts'
import type { RenderWithProvidersOptions } from '@tests/types.ts'
import type { PortalContainer } from '@utils/portalContainer.ts'
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

export type LabelPlacementContractAdapter = {
  name: string
  slot: string
  control: string
  placeholder?: string
  render: (placement?: LabelPlacement) => ReactElement
}

export type FieldVariantContractProps = {
  variant?: FieldVariant
  labelPlacement?: LabelPlacement
  error?: string
  helperText?: string
  disabled?: boolean
}

export type FieldVariantContractAdapter = {
  name: string
  slot: string
  control: string
  render: (props?: FieldVariantContractProps) => ReactElement
}

export type RequiredContractProps = {
  label?: string | undefined
  required?: boolean
  labelPlacement?: LabelPlacement
  error?: string
  helperText?: string
}

export type RequiredContractAdapter = {
  name: string
  slot: string
  control: string
  role: string
  render: (props?: RequiredContractProps) => ReactElement
}

export type PortalContainerContractAdapter = {
  name: string
  slot: string
  render: (container: PortalContainer | undefined) => ReactElement
  reveal?: () => Promise<void>
  plain?: boolean
}
