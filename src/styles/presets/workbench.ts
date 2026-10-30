import { defineStyle } from '../theme/style.ts'

import type { ThemeStyleMode } from '../theme/style.ts'

const popupShadow = '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'

const light: ThemeStyleMode = {
  colors: {
    primary: '#0958D9',
    onPrimary: '#FFFFFF',
    primaryHover: '#003EB3',
    primaryContainer: '#E6F4FF',
    onPrimaryContainer: '#0958D9',

    secondary: '#595959',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F5F5F5',
    onSecondaryContainer: '#1F1F1F',

    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceContainerLow: '#FAFAFA',
    surfaceContainer: '#F5F5F5',
    surfaceContainerHigh: '#F0F0F0',

    text: {
      primary: 'rgba(0, 0, 0, 0.88)',
      secondary: 'rgba(0, 0, 0, 0.65)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      placeholder: 'rgba(0, 0, 0, 0.55)',
      inverse: '#FFFFFF'
    },

    border: '#F0F0F0',
    borderStrong: 'rgba(0, 0, 0, 0.45)',
    borderLight: '#F5F5F5',

    error: '#CF1322',
    onError: '#FFFFFF',
    errorContainer: '#FFF2F0',
    onErrorContainer: '#CF1322',

    success: '#237804',
    onSuccess: '#FFFFFF',
    successContainer: '#F6FFED',
    onSuccessContainer: '#237804',

    warning: '#874D00',
    onWarning: '#FFFFFF',
    warningContainer: '#FFFBE6',
    onWarningContainer: '#874D00',

    info: '#0958D9',
    onInfo: '#FFFFFF',
    infoContainer: '#E6F4FF',
    onInfoContainer: '#0958D9',

    inverseSurface: '#262626',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#69B1FF',

    overlay: 'rgba(0, 0, 0, 0.45)',
    codeBackground: '#141414'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
    md: popupShadow,
    lg: popupShadow,
    xl: popupShadow
  }
}

const dark: ThemeStyleMode = {
  colors: {
    primary: '#65A9F3',
    onPrimary: '#141414',
    primaryHover: '#8DC5F8',
    primaryContainer: '#15325B',
    onPrimaryContainer: '#8DC5F8',

    secondary: '#ADADAD',
    onSecondary: '#141414',
    secondaryContainer: '#272727',
    onSecondaryContainer: '#DCDCDC',

    background: '#000000',
    surface: '#141414',
    surfaceContainerLow: '#1F1F1F',
    surfaceContainer: '#272727',
    surfaceContainerHigh: '#303030',

    text: {
      primary: 'rgba(255, 255, 255, 0.85)',
      secondary: 'rgba(255, 255, 255, 0.65)',
      disabled: 'rgba(255, 255, 255, 0.38)',
      placeholder: 'rgba(255, 255, 255, 0.55)',
      inverse: '#141414'
    },

    border: '#303030',
    borderStrong: 'rgba(255, 255, 255, 0.45)',
    borderLight: '#1F1F1F',

    error: '#F39C97',
    onError: '#141414',
    errorContainer: '#2C1618',
    onErrorContainer: '#F8C6C2',

    success: '#6ABE39',
    onSuccess: '#141414',
    successContainer: '#162312',
    onSuccessContainer: '#B2E58B',

    warning: '#D89614',
    onWarning: '#141414',
    warningContainer: '#2B2111',
    onWarningContainer: '#F3CC62',

    info: '#65A9F3',
    onInfo: '#141414',
    infoContainer: '#111A2C',
    onInfoContainer: '#8DC5F8',

    inverseSurface: '#424242',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#8DC5F8',

    overlay: 'rgba(0, 0, 0, 0.45)',
    codeBackground: '#0D0D0D'
  }
}

export const workbench = defineStyle({
  brand: ['primary', 'onPrimary', 'primaryHover'],
  light,
  dark
})
