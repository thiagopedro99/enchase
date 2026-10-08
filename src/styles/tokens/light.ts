import type { ModeTokens } from './types.ts'

export const lightTheme = {
  colors: {
    primary: '#4F46E5',
    onPrimary: '#FFFFFF',
    primaryHover: '#4338CA',
    primaryContainer: '#E1E0FF',
    onPrimaryContainer: '#14106E',

    secondary: '#5C5D72',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E1E0F9',
    onSecondaryContainer: '#191A2C',

    background: '#FBF8FF',
    surface: '#FBF8FF',
    surfaceContainerLow: '#F4F0FA',
    surfaceContainer: '#EEEAF6',
    surfaceContainerHigh: '#E8E4F0',

    text: {
      primary: '#1B1B21',
      secondary: '#46464F',
      disabled: 'rgba(27, 27, 33, 0.38)',
      placeholder: '#5F5F69',
      inverse: '#FFFFFF'
    },

    border: '#C7C5D0',
    borderStrong: '#767680',
    borderLight: '#F0ECF9',

    error: '#BA1A1A',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',

    success: '#146C2E',
    onSuccess: '#FFFFFF',
    successContainer: '#B7F2BF',
    onSuccessContainer: '#00210A',

    warning: '#8A5100',
    onWarning: '#FFFFFF',
    warningContainer: '#FFDDB5',
    onWarningContainer: '#2B1700',

    info: '#00639B',
    onInfo: '#FFFFFF',
    infoContainer: '#C9E6FF',
    onInfoContainer: '#001E31',

    inverseSurface: '#303036',
    inverseOnSurface: '#F2EFF7',
    inversePrimary: '#BEC2FF',

    overlay: 'rgba(27, 27, 33, 0.4)',
    codeBackground: '#1E1E26'
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
    md: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
    lg: '0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)',
    xl: '0 2px 3px rgba(0, 0, 0, 0.3), 0 6px 10px 4px rgba(0, 0, 0, 0.15)'
  }
} satisfies ModeTokens
