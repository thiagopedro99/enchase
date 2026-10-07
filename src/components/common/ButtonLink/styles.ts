import styled from 'styled-components'
import { motion } from 'motion/react'

import { buttonStyles } from '../Button/styles.ts'

import type { ButtonStyleProps } from '../Button/types.ts'

const StyledLinkBase = styled.a<ButtonStyleProps>`
  ${buttonStyles}
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
`

export const StyledLink = motion.create(StyledLinkBase)
