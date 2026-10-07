import styled from 'styled-components'

export const DemoSection = styled.section`
  width: 100%;
  scroll-margin-top: 88px;
`

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`

export const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fonts.sizes['2xl']};
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`

export const SectionDescription = styled.p`
  margin: 0;
  max-width: 560px;
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.secondary};
`
