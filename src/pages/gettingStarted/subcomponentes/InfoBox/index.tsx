import { StyledInfoBox } from './styles.ts'

import type { InfoBoxProps } from './types.ts'

export const InfoBox = ({ children, $spaced }: InfoBoxProps) => <StyledInfoBox $spaced={$spaced}>{children}</StyledInfoBox>

export default InfoBox
