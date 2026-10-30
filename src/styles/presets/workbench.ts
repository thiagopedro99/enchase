import { defineStyle } from '../theme/style.ts'

import type { ThemeStyleMode } from '../theme/style.ts'
import type { HookValues } from '../tokens/types.ts'

const popupShadow = '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'

const thumbShadow = '0 2px 4px 0 rgba(0, 35, 11, 0.2)'

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

const selection: HookValues = {
  '--enchase-checkbox-box-size': '1rem',
  '--enchase-checkbox-box-radius': 'var(--enchase-radius-sm)',
  '--enchase-checkbox-gap': '0.5rem',
  '--enchase-radio-group-control-size': '1rem',
  '--enchase-radio-group-control-dot-size': '0.375rem',
  '--enchase-radio-group-option-gap': '0.5rem',
  '--enchase-switch-track-width': '2.75rem',
  '--enchase-switch-track-height': '1.375rem',
  '--enchase-switch-thumb-size': '1.125rem',
  '--enchase-switch-thumb-inset': '0.0625rem',
  '--enchase-switch-thumb-scale-off': '1',
  '--enchase-switch-thumb-shadow': thumbShadow,
  '--enchase-switch-thumb-shadow-hover': thumbShadow,
  '--enchase-switch-thumb-shadow-active': thumbShadow,
  '--enchase-switch-thumb-shadow-checked-hover': thumbShadow,
  '--enchase-switch-thumb-shadow-checked-active': thumbShadow,
  '--enchase-switch-track-border-color': 'transparent',
  '--enchase-switch-track-border-color-disabled': 'transparent',
  '--enchase-switch-opacity-disabled': 'var(--enchase-state-disabled-content)',
  '--enchase-slider-thumb-size': '0.875rem',
  '--enchase-slider-thumb-border-width': '2px',
  '--enchase-segmented-control-padding': '0.125rem',
  '--enchase-segmented-control-border-width': '0',
  '--enchase-segmented-control-item-border-width': '0',
  '--enchase-segmented-control-item-radius': 'var(--enchase-radius-sm)',
  '--enchase-segmented-control-item-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-segmented-control-item-font-size-lg': 'var(--enchase-font-size-lg)',
  '--enchase-segmented-control-item-line-height': '1.7143',
  '--enchase-segmented-control-item-padding-block-sm': '0',
  '--enchase-segmented-control-item-padding-block-md': '0',
  '--enchase-segmented-control-item-padding-block-lg': '0',
  '--enchase-segmented-control-item-padding-inline-sm': '0.4375rem',
  '--enchase-segmented-control-item-padding-inline-md': '0.6875rem',
  '--enchase-segmented-control-item-padding-inline-lg': '0.6875rem'
}

const navigation: HookValues = {
  '--enchase-tabs-tab-min-height': '2.875rem',
  '--enchase-tabs-tab-padding-block': '0.75rem',
  '--enchase-tabs-tab-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-tabs-indicator-width': '2px',
  '--enchase-sidebar-nav-padding-inline': '0.25rem',
  '--enchase-sidebar-item-control-height': '2.5rem',
  '--enchase-sidebar-item-control-padding-inline': '1.5rem',
  '--enchase-sidebar-item-control-gap': '0.625rem',
  '--enchase-sidebar-item-control-radius': 'var(--enchase-radius-lg)',
  '--enchase-sidebar-item-control-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-sidebar-indicator-radius': 'var(--enchase-radius-lg)',
  '--enchase-navbar-menu-link-radius': 'var(--enchase-radius-lg)',
  '--enchase-navbar-menu-link-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-menu-item-padding-block': '0.3125rem',
  '--enchase-menu-item-padding-inline': '0.75rem',
  '--enchase-menu-item-radius': 'var(--enchase-radius-sm)',
  '--enchase-menu-item-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-pagination-list-gap': '0.5rem',
  '--enchase-pagination-control-padding-inline': '0.375rem',
  '--enchase-pagination-control-padding-inline-sm': '0.375rem',
  '--enchase-pagination-control-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-pagination-control-background-current': 'transparent',
  '--enchase-breadcrumbs-link-min-height': '1.5rem',
  '--enchase-breadcrumbs-link-padding-inline': '0.25rem',
  '--enchase-breadcrumbs-link-radius': 'var(--enchase-radius-sm)',
  '--enchase-breadcrumbs-link-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-breadcrumbs-text-padding-inline': '0.25rem',
  '--enchase-breadcrumbs-text-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-breadcrumbs-current-padding-inline': '0.25rem',
  '--enchase-breadcrumbs-current-font-weight': 'var(--enchase-font-weight-regular)'
}

const containers: HookValues = {
  '--enchase-accordion-radius': '0px',
  '--enchase-accordion-border-color': 'transparent',
  '--enchase-accordion-trigger-min-height': '2.875rem',
  '--enchase-accordion-trigger-padding-block': '0.75rem',
  '--enchase-accordion-trigger-gap': '0.75rem',
  '--enchase-accordion-trigger-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-card-border-width-default': 'var(--enchase-border-width)',
  '--enchase-table-radius': 'var(--enchase-radius-lg)',
  '--enchase-table-border-color': 'transparent',
  '--enchase-table-cell-padding-block': '1rem',
  '--enchase-table-cell-padding-block-sm': '0.5rem',
  '--enchase-table-header-border-width-end': 'var(--enchase-border-width)',
  '--enchase-table-header-border-style-end': 'solid',
  '--enchase-table-row-header-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-modal-panel-max-width-md': '32.5rem',
  '--enchase-modal-header-padding-block': '1.25rem 0',
  '--enchase-modal-body-padding-block': '0.5rem 0.75rem',
  '--enchase-modal-footer-padding-block': '0 1.25rem',
  '--enchase-modal-title-font-size': 'var(--enchase-font-size-lg)',
  '--enchase-modal-title-font-weight': 'var(--enchase-font-weight-semibold)',
  '--enchase-modal-close-radius': 'var(--enchase-radius-sm)',
  '--enchase-drawer-panel-width-md': '23.625rem',
  '--enchase-drawer-panel-radius': '0px',
  '--enchase-drawer-header-padding-block': '1rem',
  '--enchase-drawer-title-font-size': 'var(--enchase-font-size-lg)',
  '--enchase-drawer-title-font-weight': 'var(--enchase-font-weight-semibold)',
  '--enchase-drawer-body-padding-block': '1.5rem',
  '--enchase-drawer-footer-padding-block': '0.5rem',
  '--enchase-drawer-footer-padding-inline': '1rem',
  '--enchase-drawer-close-radius': 'var(--enchase-radius-sm)',
  '--enchase-popover-content-padding-block': '0.75rem',
  '--enchase-popover-content-padding-inline': '0.75rem',
  '--enchase-footer-padding-block': '1.5rem'
}

const feedback: HookValues = {
  '--enchase-alert-padding-inline': '0.75rem',
  '--enchase-alert-radius': 'var(--enchase-radius-lg)',
  '--enchase-alert-border-width': 'var(--enchase-border-width)',
  '--enchase-alert-row-height': '1.5rem',
  '--enchase-alert-content-gap': '0.5rem',
  '--enchase-badge-min-height-md': '1.375rem',
  '--enchase-badge-padding-inline-md': '0.4375rem',
  '--enchase-badge-radius': 'var(--enchase-radius-sm)',
  '--enchase-badge-font-size-md': 'var(--enchase-font-size-xs)',
  '--enchase-badge-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-badge-border-style': 'solid',
  '--enchase-badge-border-width': 'var(--enchase-border-width)',
  '--enchase-tag-min-height-md': '1.375rem',
  '--enchase-tag-min-height-sm': '1.25rem',
  '--enchase-tag-padding-inline-md': '0.4375rem',
  '--enchase-tag-padding-inline-sm': '0.4375rem',
  '--enchase-tag-radius': 'var(--enchase-radius-sm)',
  '--enchase-tag-remove-radius': 'var(--enchase-radius-sm)',
  '--enchase-tag-font-size-md': 'var(--enchase-font-size-xs)',
  '--enchase-tag-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-tag-gap': '0.1875rem',
  '--enchase-tooltip-bubble-padding': '0.375rem 0.5rem',
  '--enchase-tooltip-bubble-radius': 'var(--enchase-radius-md)',
  '--enchase-tooltip-bubble-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-tooltip-bubble-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-toast-min-height': '2.5rem',
  '--enchase-toast-padding-inline': '0.75rem',
  '--enchase-toast-radius': 'var(--enchase-radius-lg)',
  '--enchase-toast-icon-width': '1rem',
  '--enchase-toast-icon-margin-inline-end': '0.5rem',
  '--enchase-progress-size-sm': '3.75rem',
  '--enchase-progress-size-md': '7.5rem',
  '--enchase-progress-thickness': '3',
  '--enchase-avatar-size-sm': '1.5rem',
  '--enchase-avatar-size-md': '2rem',
  '--enchase-avatar-size-lg': '2.5rem',
  '--enchase-avatar-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-divider-min-height': '0.9em',
  '--enchase-loading-spinner-width-xs': '0.75rem',
  '--enchase-loading-spinner-height-xs': '0.75rem',
  '--enchase-loading-spinner-width-sm': '0.875rem',
  '--enchase-loading-spinner-height-sm': '0.875rem',
  '--enchase-loading-spinner-border-width-sm': '2px',
  '--enchase-loading-spinner-width-md': '1.25rem',
  '--enchase-loading-spinner-height-md': '1.25rem',
  '--enchase-loading-spinner-border-width-md': '3px',
  '--enchase-loading-spinner-width-lg': '2rem',
  '--enchase-loading-spinner-height-lg': '2rem',
  '--enchase-loading-spinner-border-width-lg': '4px',
  '--enchase-skeleton-radius-rectangular': 'var(--enchase-radius-sm)'
}

const colorHooks: HookValues = {
  '--enchase-button-background-outline': 'var(--enchase-color-surface)',
  '--enchase-input-outline-border-color-hover': 'var(--enchase-color-primary)',
  '--enchase-input-field-background-disabled': 'color-mix(in srgb, var(--enchase-color-text-primary) calc(var(--enchase-state-disabled-container, 0.12) * 100%), transparent)',
  '--enchase-input-field-background-filled-focus': 'var(--enchase-color-surface)',
  '--enchase-select-option-background-checked': 'var(--enchase-color-primary-container)',
  '--enchase-select-option-color-checked': 'var(--enchase-color-text-primary)',
  '--enchase-date-picker-calendar-header-border-color': 'var(--enchase-color-border)',
  '--enchase-checkbox-box-border-color-hover': 'var(--enchase-color-primary)',
  '--enchase-radio-group-control-background-checked': 'var(--enchase-color-primary)',
  '--enchase-radio-group-dot-border-color': 'var(--enchase-color-on-primary)',
  '--enchase-switch-track-background': 'var(--enchase-color-border-strong)',
  '--enchase-switch-thumb-background': 'var(--enchase-color-surface)',
  '--enchase-switch-thumb-background-disabled': 'var(--enchase-color-surface)',
  '--enchase-switch-track-background-checked-disabled': 'var(--enchase-color-primary)',
  '--enchase-switch-label-color-disabled': 'var(--enchase-color-text-primary)',
  '--enchase-slider-thumb-background': 'var(--enchase-color-surface)',
  '--enchase-segmented-control-background': 'var(--enchase-color-secondary-container)',
  '--enchase-segmented-control-item-background-selected': 'var(--enchase-color-surface)',
  '--enchase-segmented-control-item-shadow-selected': 'var(--enchase-shadow-sm)',
  '--enchase-tabs-tab-color': 'var(--enchase-color-text-primary)',
  '--enchase-sidebar-item-control-color': 'var(--enchase-color-text-primary)',
  '--enchase-navbar-menu-link-color': 'var(--enchase-color-text-primary)',
  '--enchase-pagination-control-color-current': 'var(--enchase-color-primary)',
  '--enchase-pagination-control-border-color-current': 'var(--enchase-color-primary)',
  '--enchase-accordion-trigger-background': 'var(--enchase-color-surface-container-low)',
  '--enchase-card-background-default': 'var(--enchase-color-surface)',
  '--enchase-card-background-elevated': 'var(--enchase-color-surface)',
  '--enchase-card-border-color-default': 'var(--enchase-color-border)',
  '--enchase-table-header-color': 'var(--enchase-color-text-primary)',
  '--enchase-table-header-border-color-end': 'var(--enchase-color-border)',
  '--enchase-table-row-background-selected': 'var(--enchase-color-primary-container)',
  '--enchase-table-row-background-selected-hover': 'color-mix(in srgb, var(--enchase-color-primary) 12%, var(--enchase-color-primary-container))',
  '--enchase-modal-body-color': 'var(--enchase-color-text-primary)',
  '--enchase-drawer-body-color': 'var(--enchase-color-text-primary)',
  '--enchase-footer-background': 'var(--enchase-color-background)',
  '--enchase-alert-color-info': 'var(--enchase-color-text-primary)',
  '--enchase-alert-color-success': 'var(--enchase-color-text-primary)',
  '--enchase-alert-color-warning': 'var(--enchase-color-text-primary)',
  '--enchase-alert-color-error': 'var(--enchase-color-text-primary)',
  '--enchase-alert-icon-color-info': 'var(--enchase-color-info)',
  '--enchase-alert-icon-color-success': 'var(--enchase-color-success)',
  '--enchase-alert-icon-color-warning': 'var(--enchase-color-warning)',
  '--enchase-alert-icon-color-error': 'var(--enchase-color-error)',
  '--enchase-alert-border-color-info': 'var(--enchase-color-info)',
  '--enchase-alert-border-color-success': 'var(--enchase-color-success)',
  '--enchase-alert-border-color-warning': 'var(--enchase-color-warning)',
  '--enchase-alert-border-color-error': 'var(--enchase-color-error)',
  '--enchase-badge-border-color-neutral': 'var(--enchase-color-border-strong)',
  '--enchase-badge-border-color-primary': 'var(--enchase-color-primary)',
  '--enchase-badge-border-color-success': 'var(--enchase-color-success)',
  '--enchase-badge-border-color-warning': 'var(--enchase-color-warning)',
  '--enchase-badge-border-color-error': 'var(--enchase-color-error)',
  '--enchase-badge-border-color-info': 'var(--enchase-color-info)',
  '--enchase-avatar-background': 'var(--enchase-color-secondary)',
  '--enchase-avatar-color': 'var(--enchase-color-on-secondary)'
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
    '--enchase-select-picker-background': 'var(--enchase-color-surface)',
    '--enchase-popover-content-background': 'var(--enchase-color-surface)',
    '--enchase-modal-panel-background': 'var(--enchase-color-surface)',
    '--enchase-drawer-panel-background': 'var(--enchase-color-surface)',
    '--enchase-card-shadow-elevated-hover': '0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)'
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
    '--enchase-select-picker-background': 'var(--enchase-color-surface-container-low)',
    '--enchase-popover-content-background': 'var(--enchase-color-surface-container-low)',
    '--enchase-modal-panel-background': 'var(--enchase-color-surface-container-low)',
    '--enchase-drawer-panel-background': 'var(--enchase-color-surface-container-low)',
    '--enchase-card-shadow-elevated-hover': 'var(--enchase-shadow-md)'
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
  hooks: { ...buttons, ...fields, ...selection, ...navigation, ...containers, ...feedback },
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
