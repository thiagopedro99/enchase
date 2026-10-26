export const defaultVariant = 'neutral'

export const defaultSize = 'md'

export const variants = ['neutral', 'primary', 'success', 'warning', 'error', 'info'] as const

export const variantLabels = {
  neutral: 'Draft',
  primary: 'New',
  success: 'Paid',
  warning: 'Pending',
  error: 'Declined',
  info: 'In review'
} as const
