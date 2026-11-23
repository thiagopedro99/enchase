import type { ModeTokens } from './types.ts'

export const lightTheme = {
  colors: {
    primary: '#4F46E5',
    onPrimary: '#FFFFFF',
    primaryHover: '#4338CA',
    primaryContainer: '#EEF0FF',
    onPrimaryContainer: '#312E81',

    secondary: '#4B5162',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F0F1F4',
    onSecondaryContainer: '#14161C',

    background: '#FBFBFC',
    surface: '#FFFFFF',
    surfaceContainerLow: '#F6F7F9',
    surfaceContainer: '#F0F1F4',
    surfaceContainerHigh: '#E5E7EC',

    text: {
      primary: '#10121B',
      secondary: '#5A6072',
      disabled: 'rgba(16, 18, 27, 0.5)',
      placeholder: '#5C6274',
      inverse: '#F6F7F9'
    },

    border: '#E2E4EA',
    borderStrong: '#7B8194',
    borderLight: '#EDEEF2',

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

    inverseSurface: '#14161C',
    inverseOnSurface: '#F6F7F9',
    inversePrimary: '#A5B4FC',

    overlay: 'rgba(16, 18, 27, 0.5)',
    codeBackground: '#14161C'
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(16 18 27 / 0.06), 0 1px 1px 0 rgb(16 18 27 / 0.04)',
    md: '0 4px 10px -2px rgb(16 18 27 / 0.08), 0 2px 4px -2px rgb(16 18 27 / 0.06)',
    lg: '0 12px 24px -6px rgb(16 18 27 / 0.12), 0 4px 8px -4px rgb(16 18 27 / 0.06)',
    xl: '0 24px 48px -12px rgb(16 18 27 / 0.18), 0 8px 16px -8px rgb(16 18 27 / 0.08)'
  }
} satisfies ModeTokens
