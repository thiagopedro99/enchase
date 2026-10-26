export const defaultVariant = 'info'

export const variants = ['info', 'success', 'warning', 'error'] as const

export const variantTexts = {
  info: { title: 'New version available', message: 'Update to see what is new.' },
  success: { title: 'Changes saved', message: 'Everything is fine with your profile.' },
  warning: { title: 'Deadline approaching', message: 'Your subscription expires today.' },
  error: { title: 'Could not send', message: 'Check your connection and try again.' }
} as const
