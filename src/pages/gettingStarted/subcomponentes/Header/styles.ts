import styled from 'styled-components'

export const Centered = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
`

export const Title = styled.h1`
  margin: 0;
`

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`
