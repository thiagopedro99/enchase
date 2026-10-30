import type { InputProps } from 'enchase'

export type FieldVariant = NonNullable<InputProps['variant']>

export const defaultVariant: FieldVariant = 'outlined'

export const fieldVariants: FieldVariant[] = ['outlined', 'filled', 'borderless', 'underlined']

export const variantLabels: Record<FieldVariant, string> = { outlined: 'Outlined', filled: 'Filled', borderless: 'Borderless', underlined: 'Underlined' }

export const variantArgType = {
  description:
    'Look of the field: `outlined` (the default, a border around the field), `filled` (a filled background with a line at its base), `borderless` (no border: the focus is a ring and the limit of the field is up to you, see WCAG 1.4.11) or `underlined` (only a line at its base). Only `outlined` has a floating label: with any other variant, a floating label is drawn above the field, like `stacked`.',
  control: 'inline-radio',
  options: fieldVariants,
  table: { defaultValue: { summary: defaultVariant } }
} as const

export const variantsStoryDescription =
  'The four variants side by side. Only `outlined` has a floating label, because the notch of the label belongs to its border, so in the other three the label is drawn above the field, as in `stacked`. `filled` and `underlined` keep a line at the base of the field, in the color of the border of the field, and `borderless` has no border at all: where nothing else marks where the field starts, say it with the layout (WCAG 1.4.11).'
