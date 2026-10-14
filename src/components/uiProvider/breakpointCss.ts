import { layoutResponsiveCss } from '../layout/responsive.ts'
import { navbarResponsiveCss } from '../navbar/responsive.ts'

import type { Breakpoints } from './types.ts'

const responsive = ['sm', 'md', 'lg', 'xl', 'xxl'] as const

export const breakpointCss = (breakpoints: Breakpoints) =>
  responsive.map((name) => [layoutResponsiveCss(name, breakpoints[name]), navbarResponsiveCss(name, breakpoints[name])].join('\n\n')).join('\n\n')
