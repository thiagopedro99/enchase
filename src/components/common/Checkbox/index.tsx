import { forwardRef } from 'react'

import { CheckboxWrapper, HiddenCheckbox, StyledCheckbox, CheckIcon, Label } from './styles.ts'

import type { CheckboxProps } from './types.ts'

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, ...props }, ref) => (
  <CheckboxWrapper>
    <HiddenCheckbox ref={ref} {...props} />
    <StyledCheckbox aria-hidden="true">
      <CheckIcon />
    </StyledCheckbox>
    {label && <Label>{label}</Label>}
  </CheckboxWrapper>
))

Checkbox.displayName = 'Checkbox'

export default Checkbox
