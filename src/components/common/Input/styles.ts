import styled, { css } from 'styled-components'

import { stateLayer, stateOpacity } from '../../../styles/stateLayer.ts'

import type { InputStyleProps } from './types.ts'

export const InputWrapper = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`

export const Field = styled.div`
  position: relative;
  display: flex;
`

export const StyledInput = styled.input<InputStyleProps>`
  width: 100%;
  min-width: 200px;
  height: 56px;
  padding: 0 ${({ theme, $hasToggle }) => ($hasToggle ? '3.5rem' : theme.spacing.md)} 0 ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fonts.sizes.base};
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.placeholder};
    opacity: ${({ $hasLabel }) => ($hasLabel ? 0 : 1)};
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }

  &:focus::placeholder {
    opacity: 1;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }
`

const floated = css`
  transform: translateY(calc(-50% - 28px)) scale(0.75);
`

export const Label = styled.label<InputStyleProps>`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: 50%;
  max-width: calc(100% - 2rem);
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

  ${StyledInput}:focus ~ &,
  ${StyledInput}:not(:placeholder-shown) ~ & {
    ${floated}
  }

  ${StyledInput}:-webkit-autofill ~ & {
    ${floated}
  }

  ${StyledInput}:focus ~ & {
    color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.primary)};
  }

  ${StyledInput}:disabled ~ & {
    color: ${({ theme }) => theme.colors.text.disabled};
  }

  ${({ $hasError, theme }) =>
    $hasError &&
    css`
      color: ${theme.colors.error};
    `}
`

export const NotchedOutline = styled.fieldset<InputStyleProps>`
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

  ${StyledInput}:focus ~ & legend,
  ${StyledInput}:not(:placeholder-shown) ~ & legend {
    max-width: 100%;
  }

  ${StyledInput}:-webkit-autofill ~ & legend {
    max-width: 100%;
  }

  ${StyledInput}:hover:not(:disabled):not(:focus) ~ & {
    border-color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.text.primary)};
  }

  ${StyledInput}:focus ~ & {
    border-width: 2px;
    border-color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.primary)};
  }

  ${StyledInput}:disabled ~ & {
    border-color: ${({ theme }) => stateLayer(theme.colors.text.primary, 12)};
  }
`

export const PasswordToggleButton = styled.button`
  position: absolute;
  top: 50%;
  right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background-color: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transform: translateY(-50%);
  transition: background-color ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
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
