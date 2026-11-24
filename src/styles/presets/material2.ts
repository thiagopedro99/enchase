import { defineStyle } from '../theme/style.ts'

import type { ThemeStyleMode } from '../theme/style.ts'
import type { HookValues } from '../tokens/types.ts'

const elevation1 = '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)'

const elevation2 = '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)'

const elevation4 = '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)'

const elevation6 = '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)'

const elevation8 = '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)'

const elevation16 = '0px 8px 10px -5px rgba(0, 0, 0, 0.2), 0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12)'

const elevation24 = '0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)'

const selectedLayer = 'color-mix(in srgb, var(--enchase-color-text-primary) 8%, var(--enchase-color-surface))'

const primaryLayer = 'color-mix(in srgb, var(--enchase-color-primary) 8%, var(--enchase-color-surface))'

const buttons: HookValues = {
  '--enchase-button-font-size-sm': '0.8125rem',
  '--enchase-button-font-size-md': '0.875rem',
  '--enchase-button-font-size-lg': '0.9375rem',
  '--enchase-button-font-weight': 'var(--enchase-font-weight-medium)',
  '--enchase-button-letter-spacing': '0.02857em',
  '--enchase-button-text-transform': 'uppercase',
  '--enchase-button-min-width': '4rem',
  '--enchase-button-padding-inline-sm': '0.625rem',
  '--enchase-button-padding-inline-md': '1rem',
  '--enchase-button-padding-inline-lg': '1.375rem',
  '--enchase-button-shadow-primary': elevation2,
  '--enchase-button-shadow-secondary': elevation2
}

const fields: HookValues = {
  '--enchase-input-height': '3.5rem',
  '--enchase-input-padding-inline': '0.875rem',
  '--enchase-select-option-padding-block': '0.375rem',
  '--enchase-select-option-padding-inline': '1rem',
  '--enchase-select-option-radius': '0px',
  '--enchase-combobox-option-padding-block': '0.375rem',
  '--enchase-combobox-option-padding-inline': '1rem',
  '--enchase-combobox-option-radius': '0px',
  '--enchase-input-toggle-radius': 'var(--enchase-radius-full)',
  '--enchase-number-input-stepper-radius': 'var(--enchase-radius-full)',
  '--enchase-combobox-toggle-radius': 'var(--enchase-radius-full)',
  '--enchase-date-picker-toggle-radius': 'var(--enchase-radius-full)'
}

const selection: HookValues = {
  '--enchase-switch-track-width': '2.125rem',
  '--enchase-switch-track-height': '0.875rem',
  '--enchase-switch-thumb-size': '1.25rem',
  '--enchase-switch-thumb-inset': '0.0625rem',
  '--enchase-switch-thumb-scale-off': '1',
  '--enchase-switch-thumb-shadow': elevation1,
  '--enchase-switch-thumb-shadow-hover': elevation1,
  '--enchase-switch-thumb-shadow-active': elevation1,
  '--enchase-switch-thumb-shadow-checked-hover': elevation1,
  '--enchase-switch-thumb-shadow-checked-active': elevation1,
  '--enchase-switch-track-border-color': 'transparent',
  '--enchase-switch-track-border-color-disabled': 'transparent',
  '--enchase-segmented-control-background': 'transparent'
}

const navigation: HookValues = {
  '--enchase-tabs-tab-min-height': '3rem',
  '--enchase-tabs-tab-padding-block': '0.75rem',
  '--enchase-tabs-tab-font-size': '0.875rem',
  '--enchase-tabs-tab-font-weight': 'var(--enchase-font-weight-medium)',
  '--enchase-tabs-tab-letter-spacing': '0.02857em',
  '--enchase-tabs-tab-text-transform': 'uppercase',
  '--enchase-sidebar-item-control-height': '3rem',
  '--enchase-sidebar-item-control-radius': '0px',
  '--enchase-pagination-control-size': '2rem',
  '--enchase-pagination-control-size-sm': '1.5rem',
  '--enchase-pagination-control-radius': 'var(--enchase-radius-full)',
  '--enchase-menu-item-padding-block': '0.375rem',
  '--enchase-menu-item-padding-inline': '1rem',
  '--enchase-menu-item-radius': '0px',
  '--enchase-sidebar-border-width': '1px',
  '--enchase-sidebar-radius-start-end': '0px',
  '--enchase-sidebar-radius-end-end': '0px'
}

const containers: HookValues = {
  '--enchase-modal-title-font-size': '1.25rem',
  '--enchase-modal-header-padding-block': '1rem 0',
  '--enchase-drawer-panel-radius': '0px',
  '--enchase-drawer-panel-shadow': elevation16,
  '--enchase-drawer-title-font-size': '1.25rem',
  '--enchase-drawer-title-font-weight': 'var(--enchase-font-weight-medium)',
  '--enchase-accordion-trigger-padding-block': '0',
  '--enchase-table-header-font-weight': 'var(--enchase-font-weight-medium)',
  '--enchase-table-cell-padding-block': '1rem',
  '--enchase-table-cell-padding-block-sm': '0.375rem',
  '--enchase-table-cell-padding-inline-sm': '1rem',
  '--enchase-table-element-font-size-md': '0.875rem',
  '--enchase-table-header-background': 'transparent'
}

const feedback: HookValues = {
  '--enchase-tooltip-bubble-font-size': '0.6875rem',
  '--enchase-tooltip-bubble-font-weight': 'var(--enchase-font-weight-medium)',
  '--enchase-toast-min-height': '3rem',
  '--enchase-toast-shadow': elevation6,
  '--enchase-progress-track-height-md': '0.25rem',
  '--enchase-progress-thickness': '3.6',
  '--enchase-tag-radius': 'var(--enchase-radius-full)',
  '--enchase-tag-remove-radius': 'var(--enchase-radius-full)',
  '--enchase-badge-radius': 'var(--enchase-radius-full)',
  '--enchase-tag-min-height-sm': '1.5rem',
  '--enchase-tag-font-size-md': '0.8125rem'
}

const colorHooks: HookValues = {
  '--enchase-checkbox-box-border-color': 'var(--enchase-color-text-secondary)',
  '--enchase-radio-group-control-border-color': 'var(--enchase-color-text-secondary)',
  '--enchase-segmented-control-item-background-selected': selectedLayer,
  '--enchase-segmented-control-item-color-selected': 'var(--enchase-color-text-primary)',
  '--enchase-pagination-control-background-current': selectedLayer,
  '--enchase-pagination-control-color-current': 'var(--enchase-color-primary-hover)',
  '--enchase-select-option-background-checked': primaryLayer,
  '--enchase-combobox-option-background-selected': primaryLayer,
  '--enchase-sidebar-item-control-background-current': primaryLayer,
  '--enchase-table-row-background-selected': primaryLayer,
  '--enchase-switch-thumb-background-checked': 'var(--enchase-color-primary)',
  '--enchase-switch-track-background': 'var(--enchase-color-border-strong)',
  '--enchase-switch-track-background-checked': 'color-mix(in srgb, var(--enchase-color-primary) 50%, var(--enchase-color-surface))',
  '--enchase-switch-track-background-disabled': 'color-mix(in srgb, var(--enchase-color-text-primary) 12%, transparent)',
  '--enchase-switch-track-background-checked-disabled': 'color-mix(in srgb, var(--enchase-color-text-primary) 12%, transparent)',
  '--enchase-card-shadow-default': 'var(--enchase-shadow-sm)',
  '--enchase-card-shadow-elevated': 'var(--enchase-shadow-sm)',
  '--enchase-accordion-shadow': 'var(--enchase-shadow-sm)',
  '--enchase-modal-panel-shadow': 'var(--enchase-shadow-xl)',
  '--enchase-popover-content-shadow': 'var(--enchase-shadow-lg)',
  '--enchase-select-picker-shadow': 'var(--enchase-shadow-lg)',
  '--enchase-navbar-shadow': 'var(--enchase-shadow-md)',
  '--enchase-button-shadow-primary-hover': 'var(--enchase-shadow-md)',
  '--enchase-button-shadow-secondary-hover': 'var(--enchase-shadow-md)',
  '--enchase-button-background-secondary': 'var(--enchase-color-secondary-container)',
  '--enchase-button-color-secondary': 'var(--enchase-color-on-secondary-container)',
  '--enchase-avatar-background': '#767676',
  '--enchase-avatar-color': '#FFFFFF',
  '--enchase-alert-icon-color-info': 'var(--enchase-color-info)',
  '--enchase-alert-icon-color-success': 'var(--enchase-color-success)',
  '--enchase-alert-icon-color-warning': 'var(--enchase-color-warning)',
  '--enchase-alert-icon-color-error': 'var(--enchase-color-error)',
  '--enchase-sidebar-background': 'var(--enchase-color-surface)',
  '--enchase-sidebar-border-color': 'var(--enchase-color-border)',
  '--enchase-table-header-background-sticky': 'var(--enchase-color-surface)',
  '--enchase-table-header-color': 'var(--enchase-color-text-primary)',
  '--enchase-tag-border-color': 'transparent'
}

const compactHooks: HookValues = {
  '--enchase-input-height': '2.5rem'
}

const light: ThemeStyleMode = {
  colors: {
    primary: '#066CC8',
    onPrimary: '#FFFFFF',
    primaryHover: '#1565C0',
    primaryContainer: '#EDF4FB',
    onPrimaryContainer: '#066CC8',

    secondary: '#9C27B0',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E0E0E0',
    onSecondaryContainer: 'rgba(0, 0, 0, 0.87)',

    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceContainerLow: '#FAFAFA',
    surfaceContainer: '#F5F5F5',
    surfaceContainerHigh: '#EEEEEE',

    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      placeholder: 'rgba(0, 0, 0, 0.6)',
      inverse: '#FFFFFF'
    },

    border: 'rgba(0, 0, 0, 0.12)',
    borderStrong: 'rgba(0, 0, 0, 0.45)',
    borderLight: 'rgba(0, 0, 0, 0.08)',

    error: '#CF2A2C',
    onError: '#FFFFFF',
    errorContainer: '#FDEDED',
    onErrorContainer: '#5F2120',

    success: '#2C7B31',
    onSuccess: '#FFFFFF',
    successContainer: '#EDF7ED',
    onSuccessContainer: '#1E4620',

    warning: '#B24F00',
    onWarning: '#FFFFFF',
    warningContainer: '#FFF4E5',
    onWarningContainer: '#663C00',

    info: '#0071B0',
    onInfo: '#FFFFFF',
    infoContainer: '#E5F6FD',
    onInfoContainer: '#014361',

    inverseSurface: 'rgba(97, 97, 97, 0.92)',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#BCE1FF',

    overlay: 'rgba(0, 0, 0, 0.5)',
    codeBackground: '#2B2B2B'
  },
  shadows: { sm: elevation1, md: elevation4, lg: elevation8, xl: elevation24 },
  hooks: {
    '--enchase-button-border-color-outline': 'color-mix(in srgb, var(--enchase-color-primary) 75%, transparent)',
    '--enchase-skeleton-background': 'rgba(0, 0, 0, 0.11)',
    '--enchase-card-background-default': 'var(--enchase-color-surface)',
    '--enchase-card-background-elevated': 'var(--enchase-color-surface)',
    '--enchase-modal-panel-background': 'var(--enchase-color-surface)',
    '--enchase-drawer-panel-background': 'var(--enchase-color-surface)',
    '--enchase-popover-content-background': 'var(--enchase-color-surface)',
    '--enchase-select-picker-background': 'var(--enchase-color-surface)',
    '--enchase-navbar-background-solid': 'var(--enchase-color-surface)',
    '--enchase-accordion-background': 'var(--enchase-color-surface)',
    '--enchase-switch-thumb-background': 'var(--enchase-color-surface)',
    '--enchase-switch-thumb-background-disabled': '#F5F5F5',
    '--enchase-switch-thumb-background-disabled-checked': '#F5F5F5',
    '--enchase-tag-background': selectedLayer
  }
}

const dark: ThemeStyleMode = {
  colors: {
    primary: '#90CAF9',
    onPrimary: 'rgba(0, 0, 0, 0.87)',
    primaryHover: '#BBDEFB',
    primaryContainer: '#262F37',
    onPrimaryContainer: '#90CAF9',

    secondary: '#CE93D8',
    onSecondary: 'rgba(0, 0, 0, 0.87)',
    secondaryContainer: '#424242',
    onSecondaryContainer: '#FFFFFF',

    background: '#121212',
    surface: '#121212',
    surfaceContainerLow: '#1E1E1E',
    surfaceContainer: '#272727',
    surfaceContainerHigh: '#2E2E2E',

    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
      placeholder: 'rgba(255, 255, 255, 0.7)',
      inverse: 'rgba(0, 0, 0, 0.87)'
    },

    border: 'rgba(255, 255, 255, 0.12)',
    borderStrong: 'rgba(255, 255, 255, 0.4)',
    borderLight: 'rgba(255, 255, 255, 0.08)',

    error: '#FF7362',
    onError: 'rgba(0, 0, 0, 0.87)',
    errorContainer: '#160B0B',
    onErrorContainer: '#F4C7C7',

    success: '#66BB6A',
    onSuccess: 'rgba(0, 0, 0, 0.87)',
    successContainer: '#0C130D',
    onSuccessContainer: '#CCE8CD',

    warning: '#FFA726',
    onWarning: 'rgba(0, 0, 0, 0.87)',
    warningContainer: '#191207',
    onWarningContainer: '#FFE2B7',

    info: '#29B6F6',
    onInfo: 'rgba(0, 0, 0, 0.87)',
    infoContainer: '#071318',
    onInfoContainer: '#B8E7FB',

    inverseSurface: 'rgba(97, 97, 97, 0.92)',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#BCE1FF',

    overlay: 'rgba(0, 0, 0, 0.5)',
    codeBackground: '#2B2B2B'
  },
  shadows: { sm: elevation1, md: elevation4, lg: elevation8, xl: elevation24 },
  hooks: {
    '--enchase-button-border-color-outline': 'color-mix(in srgb, var(--enchase-color-primary) 50%, transparent)',
    '--enchase-skeleton-background': 'rgba(255, 255, 255, 0.13)',
    '--enchase-card-background-default': '#1E1E1E',
    '--enchase-card-background-elevated': '#1E1E1E',
    '--enchase-accordion-background': '#1E1E1E',
    '--enchase-navbar-background-solid': '#272727',
    '--enchase-popover-content-background': '#2E2E2E',
    '--enchase-select-picker-background': '#2E2E2E',
    '--enchase-drawer-panel-background': '#363636',
    '--enchase-modal-panel-background': '#383838',
    '--enchase-switch-thumb-background': '#E0E0E0',
    '--enchase-switch-thumb-background-disabled': '#757575',
    '--enchase-switch-thumb-background-disabled-checked': '#757575',
    '--enchase-tag-background': 'color-mix(in srgb, var(--enchase-color-text-primary) 16%, var(--enchase-color-surface))'
  }
}

export const material2 = defineStyle({
  base: {
    control: { height: { sm: '1.875rem', md: '2.25rem', lg: '2.625rem' } },
    state: { hover: '0.04', focus: '0.12', pressed: '0.12', rowHover: '0.04', disabledContainer: '0.12', disabledContent: '0.38' }
  },
  radius: { xs: '0.125rem', sm: '0.25rem', md: '0.25rem', lg: '0.25rem', xl: '0.25rem', '2xl': '0.25rem', control: '0.25rem', button: '0.25rem' },
  hooks: { ...buttons, ...fields, ...selection, ...navigation, ...containers, ...feedback },
  colorHooks,
  brand: ['primary', 'onPrimary', 'primaryHover', 'primaryContainer', 'onPrimaryContainer'],
  light,
  dark,
  density: {
    compact: {
      hooks: compactHooks
    }
  },
  defaults: { labelPlacement: 'floating' }
})
