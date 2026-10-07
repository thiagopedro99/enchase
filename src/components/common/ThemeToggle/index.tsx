import { AnimatePresence } from 'motion/react'
import { Moon, Sun } from 'lucide-react'

import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { useAppStore } from '@stores/app/index.ts'
import { ToggleButton, Icon } from './styles.ts'
import Tooltip from '../Tooltip/index.tsx'

const ThemeToggle = () => {
  const theme = useAppStore((state) => state.theme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const { labels } = useUIConfig()
  const pressMotion = useMotionRecipe('press')
  const iconMotion = useMotionRecipe('pop')
  const label = theme === 'light' ? labels.switchToDark : labels.switchToLight

  return (
    <Tooltip text={label} position="bottom" describe={false}>
      <ToggleButton {...pressMotion} type="button" onClick={toggleTheme} aria-label={label}>
        <AnimatePresence mode="wait" initial={false}>
          <Icon key={theme} {...iconMotion} aria-hidden="true">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </Icon>
        </AnimatePresence>
      </ToggleButton>
    </Tooltip>
  )
}

export default ThemeToggle
