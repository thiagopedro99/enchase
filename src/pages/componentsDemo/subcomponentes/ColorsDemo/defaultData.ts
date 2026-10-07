import type { ColorGroup } from './types.ts'

export const colorGroups: ColorGroup[] = [
  {
    id: 'brand',
    title: 'Marca',
    entries: [
      { token: 'primary', on: 'onPrimary' },
      { token: 'primaryContainer', on: 'onPrimaryContainer' },
      { token: 'secondary', on: 'onSecondary' },
      { token: 'secondaryContainer', on: 'onSecondaryContainer' }
    ]
  },
  {
    id: 'surfaces',
    title: 'Superfícies',
    entries: [{ token: 'background' }, { token: 'surface' }, { token: 'surfaceContainerLow' }, { token: 'surfaceContainer' }, { token: 'surfaceContainerHigh' }]
  },
  {
    id: 'feedback',
    title: 'Feedback',
    entries: [
      { token: 'success', on: 'onSuccess' },
      { token: 'successContainer', on: 'onSuccessContainer' },
      { token: 'warning', on: 'onWarning' },
      { token: 'warningContainer', on: 'onWarningContainer' },
      { token: 'info', on: 'onInfo' },
      { token: 'infoContainer', on: 'onInfoContainer' },
      { token: 'error', on: 'onError' },
      { token: 'errorContainer', on: 'onErrorContainer' }
    ]
  },
  {
    id: 'inverse',
    title: 'Inverso e bordas',
    entries: [{ token: 'inverseSurface', on: 'inverseOnSurface' }, { token: 'border', outline: true }, { token: 'borderStrong', outline: true }]
  }
]
