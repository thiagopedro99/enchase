import styled from 'styled-components'

export const Groups = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

export const GroupTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fonts.sizes.base};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const SwatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`

export const Swatch = styled.div<{ $background: string; $color: string; $outline: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
  min-height: 84px;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ $background, $outline, theme }) => ($outline ? theme.colors.surface : $background)};
  color: ${({ $color, $outline, theme }) => ($outline ? theme.colors.text.primary : $color)};
  box-shadow: inset 0 0 0 ${({ $outline }) => ($outline ? '3px' : '1px')} ${({ $background, $outline, theme }) => ($outline ? $background : theme.colors.border)};
`

export const SwatchName = styled.span`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
`

export const SwatchValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
`
