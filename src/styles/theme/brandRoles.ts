export const brandColorRoles = [
  'primary',
  'onPrimary',
  'primaryHover',
  'primaryContainer',
  'onPrimaryContainer',
  'secondary',
  'onSecondary',
  'secondaryContainer',
  'onSecondaryContainer',
  'background',
  'surface',
  'surfaceContainerLow',
  'surfaceContainer',
  'surfaceContainerHigh',
  'border',
  'borderStrong',
  'borderLight',
  'inverseSurface',
  'inverseOnSurface',
  'inversePrimary',
  'codeBackground'
] as const

export const brandRoles = [...brandColorRoles, 'text'] as const

export type BrandColorRole = (typeof brandColorRoles)[number]

export type BrandRole = (typeof brandRoles)[number]
