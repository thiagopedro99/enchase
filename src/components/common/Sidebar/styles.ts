import styled, { css } from 'styled-components'
import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'

import { stateLayer, stateOpacity } from '../../../styles/stateLayer.ts'
import { drawerWidth } from './defaultData.ts'

const panelBase = css`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  color: ${({ theme }) => theme.colors.text.primary};
`

const AsideBase = styled.div`
  ${panelBase}
  position: sticky;
  top: 0;
  flex-shrink: 0;
  height: 100vh;
  z-index: ${({ theme }) => theme.zIndex.sticky};
  border-radius: ${({ theme }) => `0 ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0`};
`

export const SidebarAside = motion.create(AsideBase)

export const ModalOverlayBase = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
  z-index: ${({ theme }) => theme.zIndex.backdrop};
`

export const ModalOverlay = motion.create(ModalOverlayBase)

const ModalPanelBase = styled.div`
  ${panelBase}
  position: fixed;
  top: 0;
  left: 0;
  width: ${drawerWidth}px;
  max-width: 90vw;
  height: 100vh;
  z-index: ${({ theme }) => theme.zIndex.modal};
  border-radius: ${({ theme }) => `0 ${theme.borderRadius['2xl']} ${theme.borderRadius['2xl']} 0`};
  box-shadow: ${({ theme }) => theme.shadows.lg};

  &:focus {
    outline: none;
  }
`

export const ModalPanel = motion.create(ModalPanelBase)

export const HeaderSlot = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  min-height: 72px;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  overflow: hidden;
`

export const Nav = styled.nav`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  overflow-y: auto;
  overflow-x: hidden;
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const SectionTitle = styled.p`
  margin: 0;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const SectionDivider = styled.hr`
  margin: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

export const ItemList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const ListItem = styled.li`
  display: flex;
  flex-direction: column;
`

const itemStyles = css<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  height: 52px;
  padding: ${({ $collapsed, theme }) => ($collapsed ? '0' : `0 ${theme.spacing.md}`)};
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: inherit;
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &[aria-current='page'],
  &[aria-current='location'] {
    background-color: ${({ theme }) => theme.colors.primaryContainer};
    color: ${({ theme }) => theme.colors.onPrimaryContainer};
  }
`

export const ItemRouterLink = styled(NavLink)<{ $collapsed: boolean }>`
  ${itemStyles}
`

export const ItemAnchor = styled.a<{ $collapsed: boolean }>`
  ${itemStyles}
`

export const ItemButton = styled.button<{ $collapsed: boolean }>`
  ${itemStyles}
`

export const ItemIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  font-size: ${({ theme }) => theme.fonts.sizes.base};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
`

export const ItemText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ItemBadge = styled.span`
  padding: 2px ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.secondaryContainer};
  color: ${({ theme }) => theme.colors.onSecondaryContainer};
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
`

export const FooterSlot = styled.div<{ $collapsed: boolean }>`
  display: flex;
  flex-direction: ${({ $collapsed }) => ($collapsed ? 'column' : 'row')};
  align-items: center;
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'space-between')};
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
`

export const CollapseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: background-color ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`
