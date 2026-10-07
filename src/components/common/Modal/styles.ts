import styled from 'styled-components'
import { motion } from 'motion/react'

import { stateLayer, stateOpacity } from '../../../styles/stateLayer.ts'

import type { ModalSize } from './types.ts'

const BackdropBase = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
  z-index: ${({ theme }) => theme.zIndex.backdrop};
`

export const Backdrop = motion.create(BackdropBase)

const sizeMap: Record<ModalSize, string> = {
  sm: '400px',
  md: '600px',
  lg: '800px',
  xl: '1000px',
  full: '95vw'
}

const ModalContainerBase = styled.div<{ $size: ModalSize }>`
  position: fixed;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  width: 90%;
  max-width: ${({ $size }) => sizeMap[$size]};
  max-height: 90vh;
  background-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:focus {
    outline: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 95%;
    max-height: 95vh;
  }
`

export const ModalContainer = motion.create(ModalContainerBase)

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.lg} 0`};
`

export const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.fonts.sizes['2xl']};
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 40px;
  min-height: 40px;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: background-color ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

export const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
  flex: 1;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
`

export const ModalFooter = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg};
`
