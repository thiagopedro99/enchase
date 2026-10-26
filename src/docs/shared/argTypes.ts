export const asArgType = {
  description:
    'HTML tag that the root renders, only among the structure tags that the type lists. With `ul` or `ol`, the root loses bullets, margin and indent and gains `role="list"`, which keeps the list semantics in Safari (the `role` of whoever uses it wins). Links and buttons do not go here: use `ButtonLink`, `CardLink` or `CardButton`.',
  control: 'select',
  options: ['div', 'section', 'article', 'aside', 'nav', 'header', 'footer', 'main', 'ul', 'ol', 'li'],
  table: { defaultValue: { summary: 'div' } }
} as const
