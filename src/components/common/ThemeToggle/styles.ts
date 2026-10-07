import styled from 'styled-components'
import { motion } from 'motion/react'

import { stateLayer, stateOpacity } from '../../../styles/stateLayer.ts'

const ToggleButtonBase = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  background-color: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: background-color ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

export const ToggleButton = motion.create(ToggleButtonBase)

const IconBase = styled.span`
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
  }
`

export const Icon = motion.create(IconBase)
