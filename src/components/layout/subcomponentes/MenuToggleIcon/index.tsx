import { AnimatePresence, motion } from 'motion/react'
import { MenuOpenIcon } from '@components/common/Icon/icons/MenuOpenIcon.tsx'
import { MenuIcon } from '@components/common/Icon/icons/MenuIcon.tsx'

import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import styles from './styles.module.css'

import type { MenuToggleIconProps } from './types.ts'

export const MenuToggleIcon = ({ open }: MenuToggleIconProps) => {
  const swapMotion = useMotionRecipe('pop')

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={open ? 'open' : 'closed'} {...swapMotion} className={styles.slot} aria-hidden="true">
        {open ? <MenuOpenIcon /> : <MenuIcon />}
      </motion.span>
    </AnimatePresence>
  )
}

export default MenuToggleIcon
