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

export const labelPlacements: NonNullable<InputProps['labelPlacement']>[] = ['floating', 'stacked', 'start']

export const requiredArgType = {
  description:
    'Marks the field as required for the browser and for assistive technologies (the native `required` attribute) and, when there is a `label`, draws a `*` after it in the error color. The mark is only visual and is hidden from screen readers, so the accessible name of the field does not change. `--enchase-input-required-color`, `--enchase-input-required-gap` and `--enchase-input-required-display` change it, and `none` in the last one hides it.',
  control: 'boolean',
  table: { defaultValue: { summary: 'false' } }
} as const

export const requiredStoryDescription =
  'A required field in the three placements of the label. The `*` comes after the text of the label, also in the floating one, where the notch of the outline is made wide enough to hold it. It is drawn by the style of the label and is not part of its text, so the name read by assistive technologies and by tests stays the same. To hide it, set `--enchase-input-required-display: none` on the field or on a container.'

export const variantsStoryDescription =
  'The four variants side by side. Only `outlined` has a floating label, because the notch of the label belongs to its border, so in the other three the label is drawn above the field, as in `stacked`. `filled` and `underlined` keep a line at the base of the field, in the color of the border of the field, and `borderless` has no border at all: where nothing else marks where the field starts, say it with the layout (WCAG 1.4.11).'
