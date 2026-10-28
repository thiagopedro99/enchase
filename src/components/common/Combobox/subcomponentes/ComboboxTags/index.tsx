import { Tag } from '../../../Tag/index.tsx'

import type { ComboboxTagsProps } from './types.ts'

export const ComboboxTags = ({ values, labelOf, onRemove }: ComboboxTagsProps) => (
  <>
    {values.map((value) => (
      <Tag key={value} size="sm" onRemove={onRemove ? () => onRemove(value) : undefined}>
        {labelOf(value) ?? value}
      </Tag>
    ))}
  </>
)

export default ComboboxTags
