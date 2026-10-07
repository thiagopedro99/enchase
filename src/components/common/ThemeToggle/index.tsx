import { AnimatePresence } from 'motion/react'
import { Moon, Sun } from 'lucide-react'

import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { useColorMode } from '@hooks/useColorMode.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { ToggleButton, Icon } from './styles.ts'
import Tooltip from '../Tooltip/index.tsx'

const ThemeToggle = () => {
  const { resolvedMode, toggleMode } = useColorMode()
  const { labels } = useUIConfig()
  const pressMotion = useMotionRecipe('press')
  const iconMotion = useMotionRecipe('pop')
  const label = resolvedMode === 'light' ? labels.switchToDark : labels.switchToLight

  return (
    <Tooltip text={label} position="bottom" describe={false}>
      <ToggleButton {...pressMotion} type="button" onClick={toggleMode} aria-label={label}>
        <AnimatePresence mode="wait" initial={false}>
          <Icon key={resolvedMode} {...iconMotion} aria-hidden="true">
            {resolvedMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </Icon>
        </AnimatePresence>
      </ToggleButton>
    </Tooltip>
  )
}

export default ThemeToggle
