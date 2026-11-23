import type { ModeTokens } from './types.ts'

export const darkTheme = {
  colors: {
    primary: '#A5ABFF',
    onPrimary: '#14143D',
    primaryHover: '#BCC0FF',
    primaryContainer: '#23254A',
    onPrimaryContainer: '#E0E2FF',

    secondary: '#B4B9C8',
    onSecondary: '#14161C',
    secondaryContainer: '#22252D',
    onSecondaryContainer: '#F2F3F6',

    background: '#0C0D11',
    surface: '#121419',
    surfaceContainerLow: '#16181E',
    surfaceContainer: '#1C1F26',
    surfaceContainerHigh: '#272A33',

    text: {
      primary: '#F2F3F6',
      secondary: '#A3A9B8',
      disabled: 'rgba(242, 243, 246, 0.5)',
      placeholder: '#9399AA',
      inverse: '#14161C'
    },

    border: '#2A2D37',
    borderStrong: '#80879A',
    borderLight: '#1E2128',

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

    inverseSurface: '#F2F3F6',
    inverseOnSurface: '#14161C',
    inversePrimary: '#4F46E5',

    overlay: 'rgba(0, 0, 0, 0.6)',
    codeBackground: '#07080A'
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.4)',
    md: '0 4px 10px -2px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg: '0 12px 24px -6px rgb(0 0 0 / 0.55), 0 4px 8px -4px rgb(0 0 0 / 0.4)',
    xl: '0 24px 48px -12px rgb(0 0 0 / 0.65), 0 8px 16px -8px rgb(0 0 0 / 0.45)'
  }
} satisfies ModeTokens
