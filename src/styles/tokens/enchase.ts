import type { HookValues } from './types.ts'

const facet = 'inset 0 1px 0 0 rgb(255 255 255 / 0.24), inset 0 -1px 0 0 rgb(0 0 0 / 0.12), 0 1px 2px 0 rgb(16 18 27 / 0.24)'

const facetHover = 'inset 0 1px 0 0 rgb(255 255 255 / 0.3), inset 0 -1px 0 0 rgb(0 0 0 / 0.12), 0 2px 6px -1px rgb(16 18 27 / 0.28)'

const edge = '0 1px 2px 0 rgb(16 18 27 / 0.06)'

const fieldComponents = ['input', 'number-input', 'select', 'textarea', 'combobox', 'date-picker']

const fields: HookValues = {
  '--enchase-input-height': 'var(--enchase-control-height-md)',
  '--enchase-input-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-input-padding-inline': '0.75rem',
  '--enchase-input-outline-padding-inline': 'calc(var(--enchase-input-padding-inline) - var(--enchase-space-sm))',
  '--enchase-input-gap': '0.5rem',
  '--enchase-input-outline-shadow': edge,
  '--enchase-input-opacity-disabled': '0.5',
  '--enchase-input-error-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-textarea-min-height': '4rem',
  '--enchase-select-picker-border-width': 'var(--enchase-border-width)',
  '--enchase-select-picker-radius': 'var(--enchase-radius-md)',
  '--enchase-select-picker-padding': '0.25rem',
  '--enchase-select-option-padding-block': '0.375rem',
  '--enchase-select-option-padding-inline': '0.5rem',
  '--enchase-select-option-radius': 'var(--enchase-radius-sm)',
  '--enchase-select-option-font-weight-checked': 'var(--enchase-font-weight-regular)',
  '--enchase-combobox-option-padding-block': '0.375rem',
  '--enchase-combobox-option-padding-inline': '0.5rem',
  '--enchase-combobox-option-radius': 'var(--enchase-radius-sm)',
  '--enchase-combobox-option-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-combobox-option-font-weight-selected': 'var(--enchase-font-weight-regular)',
  '--enchase-combobox-message-padding-block': '0.375rem',
  '--enchase-combobox-message-padding-inline': '0.5rem',
  '--enchase-combobox-message-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-date-picker-calendar-title-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-date-picker-calendar-weekday-font-size': 'var(--enchase-font-size-xs)',
  '--enchase-date-picker-calendar-day-font-size': 'var(--enchase-font-size-sm)',
  ...Object.fromEntries(fieldComponents.flatMap((name) => [[`--enchase-${name}-helper-font-size`, 'var(--enchase-font-size-sm)'], [`--enchase-${name}-error-font-size`, 'var(--enchase-font-size-sm)']]))
}

const controls: HookValues = {
  '--enchase-button-font-size-sm': 'var(--enchase-font-size-sm)',
  '--enchase-button-font-size-md': 'var(--enchase-font-size-sm)',
  '--enchase-button-font-size-lg': 'var(--enchase-font-size-sm)',
  '--enchase-button-font-weight': 'var(--enchase-font-weight-semibold)',
  '--enchase-button-letter-spacing': '0',
  '--enchase-button-padding-inline-sm': '0.75rem',
  '--enchase-button-padding-inline-md': '1rem',
  '--enchase-button-padding-inline-lg': '1.5rem',
  '--enchase-button-scale': '1',
  '--enchase-button-shadow-primary': facet,
  '--enchase-button-shadow-primary-hover': facetHover,
  '--enchase-button-shadow-danger': facet,
  '--enchase-button-shadow-danger-hover': facetHover,
  '--enchase-button-shadow-secondary': edge,
  '--enchase-button-shadow-secondary-hover': edge,
  '--enchase-button-shadow-outline': edge,
  '--enchase-button-opacity-disabled': '0.5',

  '--enchase-checkbox-box-size': '1rem',
  '--enchase-checkbox-box-radius': 'var(--enchase-radius-xs)',
  '--enchase-checkbox-gap': '0.5rem',
  '--enchase-checkbox-label-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-checkbox-opacity-disabled': '0.5',
  '--enchase-checkbox-helper-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-checkbox-error-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-checkbox-error-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-checkbox-group-legend-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-checkbox-group-helper-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-checkbox-group-error-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-checkbox-group-legend-font-weight': 'var(--enchase-font-weight-medium)',
  '--enchase-checkbox-group-error-font-weight': 'var(--enchase-font-weight-regular)',

  '--enchase-radio-group-control-size': '1rem',
  '--enchase-radio-group-option-gap': '0.5rem',
  '--enchase-radio-group-label-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-radio-group-legend-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-radio-group-helper-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-radio-group-error-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-radio-group-opacity-disabled': '0.5',
  '--enchase-radio-group-legend-font-weight': 'var(--enchase-font-weight-medium)',
  '--enchase-radio-group-error-font-weight': 'var(--enchase-font-weight-regular)',

  '--enchase-segmented-control-item-padding-inline-sm': '0.5rem',
  '--enchase-segmented-control-item-padding-inline-md': '0.75rem',
  '--enchase-segmented-control-item-padding-inline-lg': '1rem',
  '--enchase-segmented-control-label-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-segmented-control-label-font-weight': 'var(--enchase-font-weight-medium)',

  '--enchase-slider-track-height': '0.375rem',
  '--enchase-slider-thumb-size': '1rem',
  '--enchase-slider-thumb-border-width': 'var(--enchase-border-width)',
  '--enchase-slider-label-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-slider-value-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-slider-opacity-disabled': '0.5',

  '--enchase-switch-track-width': '2rem',
  '--enchase-switch-track-height': '1.15rem',
  '--enchase-switch-thumb-size': '1rem',
  '--enchase-switch-thumb-inset': '0px',
  '--enchase-switch-thumb-scale-off': '1',
  '--enchase-switch-gap': '0.5rem',
  '--enchase-switch-label-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-switch-opacity-disabled': '0.5',
  '--enchase-switch-helper-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-switch-error-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-switch-error-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-switch-track-border-color': 'transparent',
  '--enchase-switch-track-border-color-checked': 'transparent',
  '--enchase-switch-track-border-color-disabled': 'transparent',
  '--enchase-switch-track-border-color-checked-disabled': 'transparent'
}

const containers: HookValues = {
  '--enchase-badge-radius': 'var(--enchase-radius-md)',
  '--enchase-badge-padding-inline-md': '0.5rem',
  '--enchase-badge-min-height-md': '1.25rem',
  '--enchase-badge-font-size-md': 'var(--enchase-font-size-xs)',

  '--enchase-alert-radius': 'var(--enchase-radius-lg)',
  '--enchase-alert-padding-block': '0.75rem',
  '--enchase-alert-border-width': 'var(--enchase-border-width)',

  '--enchase-tabs-tab-min-height': 'var(--enchase-control-height-md)',
  '--enchase-tabs-tab-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-tabs-indicator-width': '2px',

  '--enchase-accordion-radius': '0px',
  '--enchase-accordion-border-color': 'transparent',
  '--enchase-accordion-trigger-min-height': '0px',
  '--enchase-accordion-trigger-padding-block': '1rem',
  '--enchase-accordion-trigger-padding-inline': '0px',
  '--enchase-accordion-trigger-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-accordion-panel-padding-inline': '0px',
  '--enchase-accordion-panel-font-size': 'var(--enchase-font-size-sm)',

  '--enchase-table-radius': '0px',
  '--enchase-table-border-color': 'transparent',
  '--enchase-table-header-background': 'transparent',
  '--enchase-table-cell-padding-block': '0.5rem',
  '--enchase-table-cell-padding-inline': '0.5rem',
  '--enchase-table-element-font-size-md': 'var(--enchase-font-size-sm)',
  '--enchase-table-header-font-weight': 'var(--enchase-font-weight-medium)',

  '--enchase-modal-panel-radius': 'var(--enchase-radius-lg)',
  '--enchase-modal-panel-border-width': 'var(--enchase-border-width)',
  '--enchase-modal-panel-max-width-md': '32rem',
  '--enchase-modal-body-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-modal-title-font-size': 'var(--enchase-font-size-lg)',
  '--enchase-modal-title-font-weight': 'var(--enchase-font-weight-semibold)',

  '--enchase-drawer-panel-radius': '0px',
  '--enchase-drawer-panel-border-width': 'var(--enchase-border-width)',
  '--enchase-drawer-panel-width-md': '24rem',
  '--enchase-drawer-body-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-drawer-title-font-size': 'var(--enchase-font-size-lg)',
  '--enchase-drawer-title-font-weight': 'var(--enchase-font-weight-semibold)',

  '--enchase-popover-content-radius': 'var(--enchase-radius-md)',
  '--enchase-popover-content-border-width': 'var(--enchase-border-width)',

  '--enchase-menu-min-width': '8rem',
  '--enchase-menu-item-padding-block': '0.375rem',
  '--enchase-menu-item-padding-inline': '0.5rem',
  '--enchase-menu-item-radius': 'var(--enchase-radius-sm)',
  '--enchase-menu-item-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-menu-item-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-menu-item-icon-width': '1rem',
  '--enchase-menu-item-icon-height': '1rem',
  '--enchase-menu-separator-margin-inline': '-0.25rem',

  '--enchase-tooltip-bubble-radius': 'var(--enchase-radius-md)',
  '--enchase-tooltip-bubble-padding': '0.375rem 0.75rem',

  '--enchase-toast-radius': 'var(--enchase-radius-md)',
  '--enchase-toast-border-width': 'var(--enchase-border-width)'
}

const navigation: HookValues = {
  '--enchase-pagination-control-font-size': 'var(--enchase-font-size-sm)',
  '--enchase-pagination-ellipsis-font-size': 'var(--enchase-font-size-sm)',

  '--enchase-breadcrumbs-link-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-breadcrumbs-current-font-weight': 'var(--enchase-font-weight-regular)',
  '--enchase-breadcrumbs-link-padding-inline': '0px',
  '--enchase-breadcrumbs-text-padding-inline': '0px',
  '--enchase-breadcrumbs-current-padding-inline': '0px',
  '--enchase-breadcrumbs-item-gap': '0.375rem',
  '--enchase-breadcrumbs-list-gap': '0.375rem',

  '--enchase-navbar-bar-height': '3.5rem',
  '--enchase-navbar-border-width': 'var(--enchase-border-width)',
  '--enchase-navbar-border-color-translucent': 'transparent',
  '--enchase-navbar-background-alpha': '0.95',
  '--enchase-navbar-logo-font-size': 'var(--enchase-font-size-lg)',
  '--enchase-navbar-menu-link-font-weight': 'var(--enchase-font-weight-medium)',
  '--enchase-navbar-menu-link-radius': 'var(--enchase-radius-md)',

  '--enchase-layout-header-height': '3.5rem',
  '--enchase-app-bar-background-alpha': '0.95',

  '--enchase-sidebar-border-width': 'var(--enchase-border-width)',
  '--enchase-sidebar-header-min-height': '3.5rem',
  '--enchase-sidebar-item-control-height': '2rem',
  '--enchase-sidebar-item-control-font-weight': 'var(--enchase-font-weight-medium)',
  '--enchase-sidebar-item-control-radius': 'var(--enchase-radius-md)',
  '--enchase-sidebar-indicator-radius': 'var(--enchase-radius-md)'
}

const colorHooks: HookValues = {
  '--enchase-button-border-color-outline': 'var(--enchase-color-border)',
  '--enchase-button-color-outline': 'var(--enchase-color-text-primary)',
  '--enchase-button-color-outline-hover': 'var(--enchase-color-text-primary)',
  '--enchase-button-color-ghost': 'var(--enchase-color-text-primary)',
  '--enchase-button-background-primary-disabled': 'var(--enchase-color-primary)',
  '--enchase-button-color-primary-disabled': 'var(--enchase-color-on-primary)',
  '--enchase-button-background-secondary-disabled': 'var(--enchase-color-primary-container)',
  '--enchase-button-color-secondary-disabled': 'var(--enchase-color-on-primary-container)',
  '--enchase-button-color-outline-disabled': 'var(--enchase-color-text-primary)',
  '--enchase-button-border-color-outline-disabled': 'var(--enchase-color-border)',
  '--enchase-button-color-ghost-disabled': 'var(--enchase-color-text-primary)',

  '--enchase-input-outline-border-color-hover': 'var(--enchase-color-border-strong)',
  '--enchase-input-outline-shadow-focus': `${edge}, 0 0 0 3px color-mix(in srgb, var(--enchase-color-primary) 25%, transparent)`,
  '--enchase-input-field-color-disabled': 'var(--enchase-color-text-primary)',
  '--enchase-input-outline-border-color-disabled': 'var(--enchase-color-border-strong)',
  '--enchase-input-label-color-disabled': 'var(--enchase-color-text-primary)',
  '--enchase-input-label-color-stacked-disabled': 'var(--enchase-color-text-primary)',
  '--enchase-select-picker-background': 'var(--enchase-color-surface)',
  '--enchase-select-picker-border-color': 'var(--enchase-color-border)',
  '--enchase-select-option-background-checked': 'transparent',
  '--enchase-select-option-color-checked': 'var(--enchase-color-text-primary)',

  '--enchase-checkbox-box-border-color-disabled': 'var(--enchase-color-border-strong)',
  '--enchase-checkbox-box-border-color-checked-disabled': 'var(--enchase-color-primary)',
  '--enchase-checkbox-box-background-checked-disabled': 'var(--enchase-color-primary)',
  '--enchase-checkbox-label-color-disabled': 'var(--enchase-color-text-primary)',
  '--enchase-radio-group-control-border-color-disabled': 'var(--enchase-color-border-strong)',
  '--enchase-radio-group-dot-border-color-disabled': 'var(--enchase-color-primary)',
  '--enchase-radio-group-label-color-disabled': 'var(--enchase-color-text-primary)',
  '--enchase-radio-group-legend-color': 'var(--enchase-color-text-primary)',
  '--enchase-segmented-control-item-border-color': 'var(--enchase-color-border)',
  '--enchase-segmented-control-item-background-selected': 'var(--enchase-color-surface-container)',
  '--enchase-segmented-control-item-color-selected': 'var(--enchase-color-text-primary)',
  '--enchase-segmented-control-label-color': 'var(--enchase-color-text-primary)',
  '--enchase-checkbox-group-legend-color': 'var(--enchase-color-text-primary)',
  '--enchase-slider-track-background': 'var(--enchase-color-surface-container)',
  '--enchase-slider-thumb-background': 'var(--enchase-color-background)',
  '--enchase-slider-label-color': 'var(--enchase-color-text-primary)',
  '--enchase-switch-track-background': 'var(--enchase-color-border-strong)',
  '--enchase-switch-thumb-background': 'var(--enchase-color-background)',
  '--enchase-switch-thumb-background-checked': 'var(--enchase-color-background)',
  '--enchase-switch-thumb-background-disabled': 'var(--enchase-color-background)',
  '--enchase-switch-thumb-background-disabled-checked': 'var(--enchase-color-background)',
  '--enchase-switch-track-background-checked-disabled': 'var(--enchase-color-primary)',
  '--enchase-switch-label-color-disabled': 'var(--enchase-color-text-primary)',

  '--enchase-badge-background-neutral': 'var(--enchase-color-surface-container)',
  '--enchase-badge-background-primary': 'var(--enchase-color-primary)',
  '--enchase-badge-color-primary': 'var(--enchase-color-on-primary)',
  '--enchase-badge-background-error': 'var(--enchase-color-error)',
  '--enchase-badge-color-error': 'var(--enchase-color-on-error)',

  '--enchase-card-background-default': 'var(--enchase-color-surface)',
  '--enchase-card-background-elevated': 'var(--enchase-color-surface)',
  '--enchase-card-border-width-default': 'var(--enchase-border-width)',
  '--enchase-card-border-color-default': 'var(--enchase-color-border)',
  '--enchase-card-shadow-default': 'var(--enchase-shadow-sm)',
  '--enchase-card-shadow-elevated': 'var(--enchase-shadow-md)',
  '--enchase-card-shadow-elevated-hover': 'var(--enchase-shadow-lg)',
  '--enchase-card-opacity-disabled': '0.5',

  '--enchase-alert-background-info': 'var(--enchase-color-surface)',
  '--enchase-alert-background-success': 'var(--enchase-color-surface)',
  '--enchase-alert-background-warning': 'var(--enchase-color-surface)',
  '--enchase-alert-background-error': 'var(--enchase-color-surface)',
  '--enchase-alert-color-info': 'var(--enchase-color-text-primary)',
  '--enchase-alert-color-success': 'var(--enchase-color-text-primary)',
  '--enchase-alert-color-warning': 'var(--enchase-color-text-primary)',
  '--enchase-alert-color-error': 'var(--enchase-color-text-primary)',
  '--enchase-alert-border-color': 'var(--enchase-color-border)',
  '--enchase-alert-icon-color-info': 'var(--enchase-color-info)',
  '--enchase-alert-icon-color-success': 'var(--enchase-color-success)',
  '--enchase-alert-icon-color-warning': 'var(--enchase-color-warning)',
  '--enchase-alert-icon-color-error': 'var(--enchase-color-error)',
  '--enchase-alert-title-color-info': 'var(--enchase-color-info)',
  '--enchase-alert-title-color-success': 'var(--enchase-color-success)',
  '--enchase-alert-title-color-warning': 'var(--enchase-color-warning)',
  '--enchase-alert-title-color-error': 'var(--enchase-color-error)',

  '--enchase-tabs-tab-color-selected': 'var(--enchase-color-text-primary)',
  '--enchase-tabs-indicator-color': 'var(--enchase-color-text-primary)',

  '--enchase-table-header-color': 'var(--enchase-color-text-primary)',
  '--enchase-table-header-background-sticky': 'var(--enchase-color-surface)',

  '--enchase-modal-panel-background': 'var(--enchase-color-background)',
  '--enchase-modal-panel-border-color': 'var(--enchase-color-border)',

  '--enchase-drawer-panel-background': 'var(--enchase-color-background)',
  '--enchase-drawer-panel-border-color': 'var(--enchase-color-border)',

  '--enchase-popover-content-background': 'var(--enchase-color-surface)',
  '--enchase-popover-content-border-color': 'var(--enchase-color-border)',

  '--enchase-toast-background-success': 'var(--enchase-color-surface)',
  '--enchase-toast-background-error': 'var(--enchase-color-surface)',
  '--enchase-toast-background-warning': 'var(--enchase-color-surface)',
  '--enchase-toast-background-info': 'var(--enchase-color-surface)',
  '--enchase-toast-color-success': 'var(--enchase-color-text-primary)',
  '--enchase-toast-color-error': 'var(--enchase-color-text-primary)',
  '--enchase-toast-color-warning': 'var(--enchase-color-text-primary)',
  '--enchase-toast-color-info': 'var(--enchase-color-text-primary)',
  '--enchase-toast-border-color': 'var(--enchase-color-border)',
  '--enchase-toast-shadow': 'var(--enchase-shadow-lg)',

  '--enchase-pagination-control-background-current': 'transparent',
  '--enchase-pagination-control-color-current': 'var(--enchase-color-text-primary)',
  '--enchase-pagination-control-border-color-current': 'var(--enchase-color-border)',

  '--enchase-navbar-background-solid': 'var(--enchase-color-background)',
  '--enchase-navbar-border-color': 'var(--enchase-color-border)',
  '--enchase-app-bar-background-solid': 'var(--enchase-color-background)',
  '--enchase-sidebar-border-color': 'var(--enchase-color-border)',

  '--enchase-skeleton-background': 'var(--enchase-color-surface-container)'
}

const ownCompactHooks: HookValues = {
  '--enchase-input-height': 'var(--enchase-control-height-md)',
  '--enchase-textarea-min-height': '4rem',
  '--enchase-tabs-tab-min-height': 'var(--enchase-control-height-md)',
  '--enchase-accordion-trigger-min-height': '0px',
  '--enchase-select-option-padding-block': '0.375rem',
  '--enchase-badge-padding-inline-md': '0.5rem',
  '--enchase-sidebar-item-control-height': '2rem',
  '--enchase-sidebar-header-min-height': '3.5rem',
  '--enchase-navbar-bar-height': '3.5rem',
  '--enchase-layout-header-height': '3.5rem'
}

export const enchaseStyle = {
  base: {
    control: { height: { sm: '2rem', md: '2.25rem', lg: '2.5rem' } },
    focus: { offsetSelector: '2px' },
    border: { widthStrong: '1px' },
    halo: { size: '0px', sizeSwitch: '0px' },
    hit: { size: '2rem' }
  },
  radius: { xs: '0.25rem', sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', '2xl': '1.25rem', control: '0.625rem', button: '0.625rem' },
  hooks: { ...fields, ...controls, ...containers, ...navigation },
  colorHooks,
  brand: ['primary', 'onPrimary', 'primaryHover', 'inversePrimary'] as const,
  light: {
    colors: {
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

      inverseSurface: '#14161C',
      inverseOnSurface: '#F6F7F9',
      inversePrimary: '#A5B4FC',

      overlay: 'rgba(16, 18, 27, 0.5)',
      codeBackground: '#14161C'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(16 18 27 / 0.06), 0 1px 1px 0 rgb(16 18 27 / 0.04)',
      md: '0 4px 10px -2px rgb(16 18 27 / 0.08), 0 2px 4px -2px rgb(16 18 27 / 0.06)',
      lg: '0 12px 24px -6px rgb(16 18 27 / 0.12), 0 4px 8px -4px rgb(16 18 27 / 0.06)',
      xl: '0 24px 48px -12px rgb(16 18 27 / 0.18), 0 8px 16px -8px rgb(16 18 27 / 0.08)'
    }
  },
  dark: {
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

      inverseSurface: '#F2F3F6',
      inverseOnSurface: '#14161C',
      inversePrimary: '#4F46E5',

      overlay: 'rgba(0, 0, 0, 0.6)',
      codeBackground: '#07080A'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.4)',
      md: '0 4px 10px -2px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      lg: '0 12px 24px -6px rgb(0 0 0 / 0.55), 0 4px 8px -4px rgb(0 0 0 / 0.4)',
      xl: '0 24px 48px -12px rgb(0 0 0 / 0.65), 0 8px 16px -8px rgb(0 0 0 / 0.45)'
    }
  },
  defaults: { labelPlacement: 'stacked' as const },
  density: { compact: { hooks: ownCompactHooks } },
  hooksSpecificity: 'zero' as const
}
