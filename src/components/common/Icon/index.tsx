import { defaultSize } from './defaultData.ts'

import type { BaseIconProps } from './types.ts'

export const Icon = ({ name, size = defaultSize, children, ...props }: BaseIconProps) => (
  <svg
    data-icon={name}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {children}
  </svg>
)

export default Icon
