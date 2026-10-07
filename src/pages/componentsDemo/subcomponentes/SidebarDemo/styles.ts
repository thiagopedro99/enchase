import styled from 'styled-components'

export const Frame = styled.div`
  display: flex;
  height: 540px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.border};

  > div:first-child {
    position: relative;
    top: auto;
    height: 100%;
    z-index: auto;
  }
`

export const FramePreview = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  text-align: center;
`
