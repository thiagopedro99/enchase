import styled from 'styled-components'

import { stateLayer, stateOpacity } from '../../../styles/stateLayer.ts'

export const CheckboxWrapper = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  min-height: 40px;
  cursor: pointer;
  user-select: none;
`

export const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`

export const CheckIcon = styled.span`
  display: none;
  color: ${({ theme }) => theme.colors.onPrimary};
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 5px;
    height: 10px;
    border: solid currentColor;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    margin-top: -2px;
  }
`

export const StyledCheckbox = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 2px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color ${({ theme }) => theme.transitions.fast}, border-color ${({ theme }) => theme.transitions.fast}, box-shadow ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  ${HiddenCheckbox}:checked + & {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primary};
  }

  ${HiddenCheckbox}:checked + & ${CheckIcon} {
    display: flex;
  }

  ${HiddenCheckbox}:disabled + & {
    border-color: ${({ theme }) => stateLayer(theme.colors.text.primary, 38)};
    cursor: not-allowed;
  }

  ${HiddenCheckbox}:disabled:checked + & {
    border-color: transparent;
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, 38)};
  }

  ${HiddenCheckbox}:focus-visible + & {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }

  ${CheckboxWrapper}:hover ${HiddenCheckbox}:not(:disabled) + & {
    box-shadow: 0 0 0 10px ${({ theme }) => stateLayer(theme.colors.primary, stateOpacity.hover)};
  }
`

export const Label = styled.span`
  font-size: ${({ theme }) => theme.fonts.sizes.base};
  color: ${({ theme }) => theme.colors.text.primary};

  ${HiddenCheckbox}:disabled ~ & {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }
`
