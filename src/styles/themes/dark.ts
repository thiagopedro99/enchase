import { sharedTokens } from './shared.ts'

export const darkTheme = {
  ...sharedTokens,

  colors: {
    primary: '#BEC2FF',
    onPrimary: '#14106E',
    primaryHover: '#DDE0FF',
    primaryContainer: '#2F3270',
    onPrimaryContainer: '#E1E0FF',

    secondary: '#C4C5DD',
    onSecondary: '#2D2F42',
    secondaryContainer: '#444559',
    onSecondaryContainer: '#E1E0F9',

    background: '#13131A',
    surface: '#13131A',
    surfaceContainerLow: '#1B1B22',
    surfaceContainer: '#1F1F27',
    surfaceContainerHigh: '#2A2A33',

    text: {
      primary: '#E5E1EC',
      secondary: '#C8C5D0',
      disabled: 'rgba(229, 225, 236, 0.38)',
      placeholder: '#A9A6B3',
      inverse: '#14106E'
    },

    border: '#46464F',
    borderStrong: '#928F9A',
    borderLight: '#26262E',

    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',

    success: '#8FD99B',
    onSuccess: '#00390F',
    successContainer: '#0F5223',
    onSuccessContainer: '#B7F2BF',

    warning: '#F5B964',
    onWarning: '#472A00',
    warningContainer: '#6B4400',
    onWarningContainer: '#FFDDB5',

    info: '#8DCDFF',
    onInfo: '#00344F',
    infoContainer: '#004B71',
    onInfoContainer: '#C9E6FF',

    inverseSurface: '#E5E1EC',
    inverseOnSurface: '#303036',
    inversePrimary: '#4F46E5',

    overlay: 'rgba(0, 0, 0, 0.55)',
    codeBackground: '#0D0D12'
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.5), 0 1px 3px 1px rgba(0, 0, 0, 0.3)',
    md: '0 1px 2px rgba(0, 0, 0, 0.5), 0 2px 6px 2px rgba(0, 0, 0, 0.3)',
    lg: '0 1px 3px rgba(0, 0, 0, 0.5), 0 4px 8px 3px rgba(0, 0, 0, 0.3)',
    xl: '0 2px 3px rgba(0, 0, 0, 0.5), 0 6px 10px 4px rgba(0, 0, 0, 0.3)'
  }
}
