import styled, { css } from 'styled-components'

import { stateLayer, stateOpacity } from '../../../styles/stateLayer.ts'

import type { SelectStyleProps } from './types.ts'

export const SelectWrapper = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`

export const Field = styled.div`
  position: relative;
  display: flex;
`

export const StyledSelect = styled.select<SelectStyleProps>`
  width: 100%;
  min-width: 200px;
  height: 56px;
  padding: 0 2.75rem 0 ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fonts.sizes.base};
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  option {
    background-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:focus {
    outline: none;
  }

  ${({ $hasLabel }) =>
    $hasLabel &&
    css`
      &:not(:focus):not(:has(option:checked:not([data-placeholder]))) {
        color: transparent;
      }
    `}

  &:disabled {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }

  @supports (appearance: base-select) {
    &,
    &::picker(select) {
      appearance: base-select;
    }

    & {
      display: flex;
      align-items: center;
    }

    &::picker-icon {
      display: none;
    }

    &::picker(select) {
      min-inline-size: anchor-size(width);
      margin-block: ${({ theme }) => theme.spacing.xs};
      padding: ${({ theme }) => theme.spacing.xs};
      background-color: ${({ theme }) => theme.colors.surfaceContainer};
      border: none;
      border-radius: ${({ theme }) => theme.borderRadius.md};
      box-shadow: ${({ theme }) => theme.shadows.md};
      opacity: 0;
      transform: translateY(-4px);
      transition: opacity ${({ theme }) => theme.transitions.fast}, transform ${({ theme }) => theme.transitions.fast}, overlay ${({ theme }) => theme.transitions.fast} allow-discrete,
        display ${({ theme }) => theme.transitions.fast} allow-discrete;
    }

    &:open::picker(select) {
      opacity: 1;
      transform: none;
    }

    @starting-style {
      &:open::picker(select) {
        opacity: 0;
        transform: translateY(-4px);
      }
    }

    option {
      display: flex;
      align-items: center;
      gap: ${({ theme }) => theme.spacing.sm};
      padding: ${({ theme }) => `0.75rem ${theme.spacing.md}`};
      background-color: transparent;
      border-radius: ${({ theme }) => theme.borderRadius.sm};
      cursor: pointer;
      transition: background-color ${({ theme }) => theme.transitions.fast};
    }

    option::checkmark {
      order: 1;
      margin-inline-start: auto;
    }

    option:hover:not(:disabled),
    option:focus-visible {
      background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
    }

    option:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primary};
      outline-offset: -2px;
    }

    option:checked {
      background-color: ${({ theme }) => theme.colors.secondaryContainer};
      color: ${({ theme }) => theme.colors.onSecondaryContainer};
      font-weight: ${({ theme }) => theme.fonts.weights.medium};
    }

    option:disabled {
      color: ${({ theme }) => theme.colors.text.disabled};
      cursor: not-allowed;
    }

    option[data-placeholder] {
      display: none;
    }
  }
`

const floated = css`
  transform: translateY(calc(-50% - 28px)) scale(0.75);
`

export const Label = styled.label<SelectStyleProps>`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: 50%;
  max-width: calc(100% - 4rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.fonts.sizes.base};
  font-weight: ${({ theme }) => theme.fonts.weights.regular};
  color: ${({ theme }) => theme.colors.text.secondary};
  transform: translateY(-50%);
  transform-origin: top left;
  pointer-events: none;
  transition: transform ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast};

  ${StyledSelect}:focus ~ & {
    ${floated}
  }

  ${StyledSelect}:open ~ & {
    ${floated}
  }

  ${StyledSelect}:has(option:checked:not([data-placeholder])) ~ & {
    ${floated}
  }

  ${StyledSelect}:focus ~ & {
    color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.primary)};
  }

  ${StyledSelect}:open ~ & {
    color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.primary)};
  }

  ${StyledSelect}:disabled ~ & {
    color: ${({ theme }) => theme.colors.text.disabled};
  }

  ${({ $hasError, theme }) =>
    $hasError &&
    css`
      color: ${theme.colors.error};
    `}
`

export const NotchedOutline = styled.fieldset<SelectStyleProps>`
  position: absolute;
  inset: -5px 0 0 0;
  min-width: 0;
  margin: 0;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  font: inherit;
  text-align: left;
  pointer-events: none;
  border: 1px solid ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.borderStrong)};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  legend {
    display: block;
    width: auto;
    max-width: 0.01px;
    height: 11px;
    padding: 0;
    font-size: 0.75em;
    visibility: hidden;
    white-space: nowrap;
    transition: max-width ${({ theme }) => theme.transitions.fast};

    span {
      display: inline-block;
      padding: ${({ $hasLabel, theme }) => ($hasLabel ? `0 ${theme.spacing.sm}` : '0')};
      opacity: 0;
      visibility: visible;
    }
  }

  ${StyledSelect}:focus ~ & legend {
    max-width: 100%;
  }

  ${StyledSelect}:open ~ & legend {
    max-width: 100%;
  }

  ${StyledSelect}:has(option:checked:not([data-placeholder])) ~ & legend {
    max-width: 100%;
  }

  ${StyledSelect}:hover:not(:disabled):not(:focus) ~ & {
    border-color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.text.primary)};
  }

  ${StyledSelect}:focus ~ & {
    border-width: 2px;
    border-color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.primary)};
  }

  ${StyledSelect}:open ~ & {
    border-width: 2px;
    border-color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.primary)};
  }

  ${StyledSelect}:disabled ~ & {
    border-color: ${({ theme }) => stateLayer(theme.colors.text.primary, 12)};
  }
`

export const SelectIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: transform ${({ theme }) => theme.transitions.fast};

  ${StyledSelect}:open ~ & {
    transform: translateY(-50%) rotate(180deg);
  }

  &::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid currentColor;
  }
`

export const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.error};
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
`

export const HelperText = styled.span`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`
