import { Hidden } from './styles.ts'

import type { VisuallyHiddenProps } from './types.ts'

export const VisuallyHidden = ({ children, ...props }: VisuallyHiddenProps) => <Hidden {...props}>{children}</Hidden>

export default VisuallyHidden
