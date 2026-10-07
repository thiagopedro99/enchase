import { defaultDisabled, defaultRecipe } from './defaultData.ts'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { StyledButton } from './styles.ts'

import type { ButtonProps } from './types.ts'

export const Button = ({ children, animation, disabled = defaultDisabled, ...props }: ButtonProps) => {
  const pressMotion = useMotionRecipe(defaultRecipe, animation)
  const motionProps = disabled ? {} : pressMotion

  return (
    <StyledButton {...motionProps} {...props} disabled={disabled}>
      {children}
    </StyledButton>
  )
}

export default Button
