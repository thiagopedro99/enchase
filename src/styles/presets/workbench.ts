import { defineStyle } from '../theme/style.ts'

import type { ThemeStyleMode } from '../theme/style.ts'
import type { HookValues } from '../tokens/types.ts'

const popupShadow = '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'

const buttons: HookValues = {
  '--enchase-button-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-button-font-size-lg': 'var(--enchase-font-size-lg)',
  '--enchase-button-padding-block-sm': '0',
  '--enchase-button-padding-block-md': '0',
  '--enchase-button-padding-block-lg': '0',
  '--enchase-button-padding-inline-sm': '0.4375rem',
  '--enchase-button-padding-inline-md': '0.9375rem',
  '--enchase-button-padding-inline-lg': '0.9375rem',
  '--enchase-button-padding-inline-ghost': '0.9375rem',
  '--enchase-button-radius-sm': 'var(--enchase-radius-sm)',
  '--enchase-button-radius-md': 'var(--enchase-radius-md)',
  '--enchase-button-radius-lg': 'var(--enchase-radius-lg)'
}

const fields: HookValues = {
  '--enchase-input-height': 'var(--enchase-control-height-md)',
  '--enchase-input-padding-inline': '0.75rem',
  '--enchase-input-gap': '0.5rem',
  '--enchase-input-label-width': '8rem',
  '--enchase-input-label-font-weight-stacked': 'var(--enchase-font-weight-regular)',
  '--enchase-textarea-min-height': 'var(--enchase-control-height-md)',
  '--enchase-textarea-padding-block': '0.3125rem',
  '--enchase-select-picker-radius': 'var(--enchase-radius-lg)',
  '--enchase-select-option-padding-block': '0.3125rem',
  '--enchase-select-option-padding-inline': '0.75rem',
  '--enchase-select-option-radius': 'var(--enchase-radius-sm)',
  '--enchase-select-option-font-weight-checked': 'var(--enchase-font-weight-semibold)',
  '--enchase-combobox-option-padding-block': '0.3125rem',
  '--enchase-combobox-option-padding-inline': '0.75rem',
  '--enchase-combobox-option-radius': 'var(--enchase-radius-sm)',
  '--enchase-date-picker-calendar-day-size': '2.25rem',
  '--enchase-date-picker-calendar-day-radius': 'var(--enchase-radius-sm)',
  '--enchase-date-picker-calendar-title-font-weight': 'var(--enchase-font-weight-semibold)',
  '--enchase-date-picker-calendar-weekday-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-date-picker-calendar-header-border-width': 'var(--enchase-border-width)',
  '--enchase-date-picker-calendar-header-border-style': 'solid'
}

const colorHooks: HookValues = {
  '--enchase-button-background-outline': 'var(--enchase-color-surface)',
  '--enchase-input-outline-border-color-hover': 'var(--enchase-color-primary)',
  '--enchase-input-field-background-disabled': 'color-mix(in srgb, var(--enchase-color-text-primary) calc(var(--enchase-state-disabled-container, 0.12) * 100%), transparent)',
  '--enchase-input-field-background-filled-focus': 'var(--enchase-color-surface)',
  '--enchase-select-option-background-checked': 'var(--enchase-color-primary-container)',
  '--enchase-select-option-color-checked': 'var(--enchase-color-text-primary)',
  '--enchase-date-picker-calendar-header-border-color': 'var(--enchase-color-border)'
}

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
  },
  hooks: {
    '--enchase-button-shadow-primary': '0 2px 0 rgba(5, 145, 255, 0.1)',
    '--enchase-button-shadow-primary-hover': '0 2px 0 rgba(5, 145, 255, 0.1)',
    '--enchase-button-shadow-outline': '0 2px 0 rgba(0, 0, 0, 0.02)',
    '--enchase-input-outline-shadow-focus': '0 0 0 2px color-mix(in srgb, var(--enchase-color-primary) 10%, transparent)',
    '--enchase-select-picker-background': 'var(--enchase-color-surface)'
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
  },
  hooks: {
    '--enchase-button-shadow-primary': 'none',
    '--enchase-button-shadow-primary-hover': 'var(--enchase-shadow-sm)',
    '--enchase-button-shadow-outline': 'none',
    '--enchase-input-outline-shadow-focus': '0 0 0 2px color-mix(in srgb, var(--enchase-color-primary) 31%, transparent)',
    '--enchase-select-picker-background': 'var(--enchase-color-surface-container-low)'
  }
}

export const workbench = defineStyle({
  base: {
    control: { height: { sm: '1.5rem', md: '2rem', lg: '2.5rem' } },
    focus: { width: '3px', offset: '1px', offsetSelector: '1px', offsetInset: '-3px' },
    border: { width: '1px', widthStrong: '1px' },
    halo: { size: '0px', sizeSwitch: '0px' },
    hit: { size: '2rem' },
    state: { hover: '0.06', focus: '0.1', pressed: '0.1', rowHover: '0.02', disabledContainer: '0.04', disabledContent: '0.38' }
  },
  fonts: {
    sizes: { xs: '0.75rem', sm: '0.875rem', base: '0.875rem', lg: '1rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.375rem', '5xl': '3.5rem' },
    lineHeights: { normal: 1.5714 }
  },
  radius: { xs: '0.125rem', sm: '0.25rem', md: '0.375rem', lg: '0.5rem', xl: '0.5rem', '2xl': '0.5rem', control: '0.375rem', button: '0.375rem' },
  hooks: { ...buttons, ...fields },
  colorHooks,
  brand: ['primary', 'onPrimary', 'primaryHover'],
  light,
  dark,
  density: {
    compact: {
      tokens: {
        '--enchase-hit-size': '1.5rem',
        '--enchase-control-height-sm': '1.5rem',
        '--enchase-control-height-md': '1.75rem',
        '--enchase-control-height-lg': '2.1875rem',
        '--enchase-space-sm': '0.25rem',
        '--enchase-space-md': '0.5rem',
        '--enchase-space-lg': '1rem',
        '--enchase-space-xl': '2rem',
        '--enchase-space-2xl': '3rem'
      }
    }
  },
  defaults: { labelPlacement: 'stacked' }
})
