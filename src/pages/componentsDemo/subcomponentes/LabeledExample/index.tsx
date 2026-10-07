import { Label } from './styles.ts'

import type { LabeledExampleProps } from './types.ts'

export const LabeledExample = ({ label, children }: LabeledExampleProps) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
)

export default LabeledExample
