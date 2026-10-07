import styled from 'styled-components'

import { stateLayer, stateOpacity } from '../../../../styles/stateLayer.ts'

export const Bar = styled.header`
  grid-area: appbar;
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
  height: 64px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

export const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

export const Trail = styled.div`
  flex: 1;
  min-width: 0;
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing.xs};
`
