import { AnimatePresence } from 'motion/react'
import { Menu } from 'lucide-react'

import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { IconSlot } from './styles.ts'

import type { MenuToggleIconProps } from './types.ts'

const MenuOpenIcon = () => (
  <svg data-icon="menu-open" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
    <path d="M3 6h13" />
    <path d="M3 12h9" />
    <path d="M3 18h13" />
    <path d="M21 8l-4 4 4 4" />
  </svg>
)

export const MenuToggleIcon = ({ open }: MenuToggleIconProps) => {
  const swapMotion = useMotionRecipe('pop')

  return (
    <AnimatePresence mode="wait" initial={false}>
      <IconSlot key={open ? 'open' : 'closed'} {...swapMotion} aria-hidden="true">
        {open ? <MenuOpenIcon /> : <Menu size={24} />}
      </IconSlot>
    </AnimatePresence>
  )
}

export default MenuToggleIcon
