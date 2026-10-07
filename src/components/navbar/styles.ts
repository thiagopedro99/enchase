import { Link, NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'motion/react'

import { stateLayer, stateOpacity } from '../../styles/stateLayer.ts'

export const Header = styled.header`
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.surfaceContainer};
  z-index: ${({ theme }) => theme.zIndex.sticky};
`

export const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
`

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

export const Logo = styled(Link)`
  text-decoration: none;
  font-size: ${({ theme }) => theme.fonts.sizes.xl};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

export const DesktopMenu = styled.nav`
  display: none;
  gap: ${({ theme }) => theme.spacing.xs};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }
`

export const MenuLink = styled(NavLink)`
  text-decoration: none;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  transition: background-color ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primaryContainer};
    color: ${({ theme }) => theme.colors.onPrimaryContainer};
  }
`

export const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`

const OverlayBase = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
  z-index: ${({ theme }) => theme.zIndex.backdrop};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`

export const Overlay = motion.create(OverlayBase)

const MobileMenuBase = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  max-width: 90vw;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${({ theme }) => `${theme.borderRadius['2xl']} 0 0 ${theme.borderRadius['2xl']}`};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: ${({ theme }) => theme.zIndex.modal};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-y: auto;

  &:focus {
    outline: none;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`

export const MobileMenu = motion.create(MobileMenuBase)

export const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

export const MobileNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
  }
`

export const MobileMenuLink = styled(NavLink)`
  text-decoration: none;
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  transition: background-color ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primaryContainer};
    color: ${({ theme }) => theme.colors.onPrimaryContainer};
  }
`
