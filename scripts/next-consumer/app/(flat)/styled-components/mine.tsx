'use client'

import { Button } from 'enchase'
import styled from 'styled-components'

export const Mine = styled(Button)`
  background-color: rgb(1, 2, 3);

  &:hover {
    background-color: rgb(9, 9, 9);
  }

  &:disabled {
    background-color: rgb(4, 5, 6);
  }
`
