import styled from 'styled-components'
import { motion } from 'motion/react'

import { stateLayer, stateOpacity } from '../../styles/stateLayer.ts'

import type { DefaultTheme } from 'styled-components'
import type { ToastType } from './types.ts'

const containerColors = (theme: DefaultTheme, type: ToastType) => {
  const palette = {
    success: { background: theme.colors.successContainer, text: theme.colors.onSuccessContainer },
    error: { background: theme.colors.errorContainer, text: theme.colors.onErrorContainer },
    warning: { background: theme.colors.warningContainer, text: theme.colors.onWarningContainer },
    info: { background: theme.colors.infoContainer, text: theme.colors.onInfoContainer }
  }

  return palette[type]
}

export const ToastContainer = styled.div`
  position: fixed;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  top: 1em;
  right: 1em;
  width: 360px;
  max-height: calc(100vh - 2em);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  pointer-events: none;

  @media only screen and (max-width: 480px) {
    width: 100vw;
    padding: 0 ${({ theme }) => theme.spacing.md};
    left: 0;
    margin: 0;
    top: 0;
    right: 0;
  }
`

const ToastItemBase = styled.div<{ $type: ToastType }>`
  position: relative;
  min-height: 56px;
  box-sizing: border-box;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm} ${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-height: 800px;
  overflow: hidden;
  font-family: ${({ theme }) => theme.fonts.primary};
  cursor: pointer;
  direction: ltr;
  pointer-events: auto;
  background-color: ${({ $type, theme }) => containerColors(theme, $type).background};
  color: ${({ $type, theme }) => containerColors(theme, $type).text};
`

export const ToastItem = motion.create(ToastItemBase)

export const ToastBody = styled.div`
  margin: auto 0;
  flex: 1 1 auto;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  display: flex;
  align-items: center;
`

export const ToastIcon = styled.div`
  margin-inline-end: ${({ theme }) => theme.spacing.md};
  width: 20px;
  flex-shrink: 0;
  display: flex;
  color: inherit;
`

export const ToastContent = styled.div`
  padding: 0;
  display: flex;
  align-items: center;
`

export const ToastMessage = styled.div`
  flex: 1;
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
  white-space: pre-wrap;
  line-height: 1.5;
  color: inherit;
`

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  color: inherit;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  align-self: center;
  z-index: 1;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${stateLayer('currentColor', stateOpacity.hover)};
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 0;
  }
`

const ProgressBarBase = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 1;
  background-color: currentColor;
  opacity: 0.4;
  transform-origin: left;
`

export const ProgressBar = motion.create(ProgressBarBase)
