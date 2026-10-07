import { VisuallyHidden } from '@components/common/VisuallyHidden/index.tsx'
import { BrandLink, BrandImage, BrandMark } from './styles.ts'

import type { BrandProps } from './types.ts'

export const Brand = ({ name, logo, compact = false }: BrandProps) => (
  <BrandLink to="/">
    {logo ? <BrandImage src={logo} alt="" /> : <BrandMark aria-hidden="true">{name.charAt(0).toUpperCase()}</BrandMark>}
    {compact ? <VisuallyHidden>{name}</VisuallyHidden> : name}
  </BrandLink>
)

export default Brand
