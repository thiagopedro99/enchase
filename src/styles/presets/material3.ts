import { defineStyle } from '../theme/style.ts'

import type { ThemeStyleMode } from '../theme/style.ts'

const light: ThemeStyleMode = {
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

    inverseSurface: '#303036',
    inverseOnSurface: '#F2EFF7',
    inversePrimary: '#BEC2FF',

    overlay: 'rgba(27, 27, 33, 0.4)',
    codeBackground: '#1E1E26'
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
    md: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
    lg: '0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)',
    xl: '0 2px 3px rgba(0, 0, 0, 0.3), 0 6px 10px 4px rgba(0, 0, 0, 0.15)'
  }
}

const dark: ThemeStyleMode = {
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

    inverseSurface: '#E5E1EC',
    inverseOnSurface: '#303036',
    inversePrimary: '#4F46E5',

    overlay: 'rgba(0, 0, 0, 0.55)',
    codeBackground: '#0D0D12'
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.5), 0 1px 3px 1px rgba(0, 0, 0, 0.3)',
    md: '0 1px 2px rgba(0, 0, 0, 0.5), 0 2px 6px 2px rgba(0, 0, 0, 0.3)',
    lg: '0 1px 3px rgba(0, 0, 0, 0.5), 0 4px 8px 3px rgba(0, 0, 0, 0.3)',
    xl: '0 2px 3px rgba(0, 0, 0, 0.5), 0 6px 10px 4px rgba(0, 0, 0, 0.3)'
  }
}

export const material3 = defineStyle({
  base: {
    control: { height: { sm: '2rem', md: '2.5rem', lg: '3rem' } },
    focus: { offsetSelector: '3px' },
    hit: { size: '40px' },
    border: { widthStrong: '2px' },
    halo: { size: '10px', sizeSwitch: '0.5rem' }
  },
  radius: { xs: '0.25rem', sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.5rem', '2xl': '1.75rem', control: '0.5rem', button: '9999px' },
  light,
  dark,
  defaults: { labelPlacement: 'floating' }
})
