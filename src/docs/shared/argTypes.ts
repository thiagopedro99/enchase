export const asArgType = {
  description:
    'HTML tag that the root renders, only among the structure tags that the type lists. With `ul` or `ol`, the root loses bullets, margin and indent and gains `role="list"`, which keeps the list semantics in Safari (the `role` of whoever uses it wins). Links and buttons do not go here: use `ButtonLink`, `CardLink` or `CardButton`.',
  control: 'select',
  options: ['div', 'section', 'article', 'aside', 'nav', 'header', 'footer', 'main', 'ul', 'ol', 'li'],
  table: { defaultValue: { summary: 'div' } }
} as const

export const containerArgType = {
  description:
    'Element that the overlay renders in, or a function that returns it (called on the client, never on the server). Without it, or when it is null, the overlay renders in the `body`. Use it to keep the overlay inside an element with its own theme: it inherits the CSS variables of that element, which an overlay in the `body` does not. An ancestor of the container with `transform`, `filter` or `contain` becomes the containing block of the fixed positioning and moves the overlay, and one that creates a stacking context (`z-index`, `opacity`, `isolation`) confines the `z-index` of the overlay to it.',
  control: false,
  table: { type: { summary: 'HTMLElement | (() => HTMLElement | null) | null' } }
} as const
