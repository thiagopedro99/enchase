import type { StyleDefinition, StyleModeDefinition } from './types.ts'

const light: StyleModeDefinition = {
  colors: {
    primary: '#171717',
    onPrimary: '#FAFAFA',
    primaryHover: '#2E2E2E',
    primaryContainer: '#F5F5F5',
    onPrimaryContainer: '#171717',

    secondary: '#525252',
    onSecondary: '#FAFAFA',
    secondaryContainer: '#F5F5F5',
    onSecondaryContainer: '#171717',

    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceContainerLow: '#FAFAFA',
    surfaceContainer: '#F5F5F5',
    surfaceContainerHigh: '#EBEBEB',

    text: {
      primary: '#0A0A0A',
      secondary: '#636363',
      disabled: 'rgba(10, 10, 10, 0.5)',
      placeholder: '#696969',
      inverse: '#FAFAFA'
    },

    border: '#E5E5E5',
    borderStrong: '#808080',
    borderLight: '#F5F5F5',

    error: '#D20000',

    inverseSurface: '#171717',
    inverseOnSurface: '#FAFAFA',
    inversePrimary: '#E5E5E5',

    overlay: 'rgba(0, 0, 0, 0.5)',
    codeBackground: '#171717'
  },
  shadows: {
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
}

const dark: StyleModeDefinition = {
  colors: {
    primary: '#E5E5E5',
    onPrimary: '#171717',
    primaryHover: '#CFCFCF',
    primaryContainer: '#262626',
    onPrimaryContainer: '#FAFAFA',

    secondary: '#A3A3A3',
    onSecondary: '#171717',
    secondaryContainer: '#262626',
    onSecondaryContainer: '#FAFAFA',

    background: '#0A0A0A',
    surface: '#0A0A0A',
    surfaceContainerLow: '#171717',
    surfaceContainer: '#262626',
    surfaceContainerHigh: '#333333',

    text: {
      primary: '#FAFAFA',
      secondary: '#A1A1A1',
      disabled: 'rgba(250, 250, 250, 0.5)',
      placeholder: '#A1A1A1',
      inverse: '#171717'
    },

    border: '#262626',
    borderStrong: '#808080',
    borderLight: '#1A1A1A',

    error: '#FF7375',

    inverseSurface: '#FAFAFA',
    inverseOnSurface: '#171717',
    inversePrimary: '#171717',

    overlay: 'rgba(0, 0, 0, 0.5)',
    codeBackground: '#171717'
  },
  shadows: {
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)'
  }
}

export const shadcnStyle: StyleDefinition = {
  base: {
    control: { height: { sm: '2rem', md: '2.25rem', lg: '2.5rem' } },
    focus: { width: '3px', offset: '0px', offsetInset: '-3px', offsetSelector: '0px' },
    border: { widthStrong: '1px' },
    halo: { size: '0px', sizeSwitch: '0px' }
  },
  radius: { none: '0', xs: '0.25rem', sm: '0.375rem', md: '0.5rem', lg: '0.625rem', xl: '0.875rem', '2xl': '1rem', control: '0.5rem', button: '0.5rem', full: '9999px' },
  brand: ['primary', 'onPrimary', 'primaryHover', 'inversePrimary'],
  light,
  dark,
  defaults: { labelPlacement: 'stacked' }
}
