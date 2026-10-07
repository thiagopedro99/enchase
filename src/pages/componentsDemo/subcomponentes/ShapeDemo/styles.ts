import styled from 'styled-components'

export const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

export const GroupTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fonts.sizes.base};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const Tiles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
`

export const Tile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

export const RadiusSample = styled.div<{ $radius: string }>`
  width: 96px;
  height: 64px;
  background-color: ${({ theme }) => theme.colors.primaryContainer};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ $radius }) => $radius};
`

export const ShadowSample = styled.div<{ $shadow: string }>`
  width: 96px;
  height: 64px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ $shadow }) => $shadow};
`

export const TokenLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const Divider = styled.hr`
  margin: ${({ theme }) => `${theme.spacing.lg} 0`};
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`
