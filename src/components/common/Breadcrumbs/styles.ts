import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

import { stateLayer, stateOpacity } from '../../../styles/stateLayer.ts'

export const Nav = styled.nav`
  min-width: 0;
`

export const List = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Item = styled.li<{ $hideOnMobile: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
  font-size: ${({ theme }) => theme.fonts.sizes.sm};

  ${({ $hideOnMobile, theme }) =>
    $hideOnMobile &&
    css`
      @media (max-width: ${theme.breakpoints.sm}) {
        display: none;
      }
    `}
`

export const Separator = styled.span`
  display: flex;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const crumbStyles = css`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
  text-decoration: none;
  transition: background-color ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
    color: ${({ theme }) => theme.colors.text.primary};
    text-decoration: underline;
  }
`

export const CrumbRouterLink = styled(Link)`
  ${crumbStyles}
`

export const CrumbAnchor = styled.a`
  ${crumbStyles}
`

export const CrumbText = styled.span`
  padding: 0 ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
`

export const Current = styled.span`
  min-width: 0;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const EllipsisButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 28px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => stateLayer(theme.colors.text.primary, stateOpacity.hover)};
  }
`
