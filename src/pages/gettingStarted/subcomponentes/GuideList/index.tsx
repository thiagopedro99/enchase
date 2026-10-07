import { List, ListItem } from './styles.ts'

import type { GuideListProps } from './types.ts'

export const GuideList = ({ items }: GuideListProps) => (
  <List>
    {items.map((item, index) => (
      <ListItem key={index}>{item}</ListItem>
    ))}
  </List>
)

export default GuideList
