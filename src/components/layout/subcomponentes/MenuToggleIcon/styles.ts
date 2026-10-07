import styled from 'styled-components'
import { motion } from 'motion/react'

const IconSlotBase = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`

export const IconSlot = motion.create(IconSlotBase)
