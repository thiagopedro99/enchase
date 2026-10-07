import styled, { css } from 'styled-components'

export const LayoutWrapper = styled.div<{ $sidebar: boolean }>`
  display: grid;
  min-height: 100vh;
  grid-template-columns: ${({ $sidebar }) => ($sidebar ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)')};
  grid-template-rows: auto 1fr auto;
  grid-template-areas: ${({ $sidebar }) => ($sidebar ? "'sidebar appbar' 'sidebar main' 'sidebar footer'" : "'appbar' 'main' 'footer'")};
`

export const SidebarArea = styled.div`
  grid-area: sidebar;
  min-height: 0;
`

export const NavbarArea = styled.div`
  grid-area: appbar;
`

export const FooterArea = styled.div`
  grid-area: footer;
  display: flex;
  flex-direction: column;
`

export const SkipLink = styled.a`
  text-decoration: none;
  position: absolute;
  top: -100px;
  left: ${({ theme }) => theme.spacing.md};
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};

  &:focus {
    top: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.onPrimary};
  }
`

export const Main = styled.main<{ $centered?: boolean }>`
  grid-area: main;
  min-width: 0;
  padding: ${({ theme }) => `${theme.spacing.xl} 0 ${theme.spacing['2xl']}`};

  ${({ $centered }) =>
    $centered &&
    css`
      display: flex;
      flex-direction: column;
      justify-content: center;
    `}

  &:focus {
    outline: none;
  }
`
