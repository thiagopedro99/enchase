export const asArgType = {
  description:
    'Tag HTML que a raiz renderiza, só entre as de estrutura que o tipo lista. Com `ul` ou `ol`, a raiz perde marcadores, margem e recuo e ganha `role="list"`, que mantém a semântica de lista no Safari (o `role` de quem usa vence). Links e botões não entram aqui: use `ButtonLink`, `CardLink` ou `CardButton`.',
  control: 'select',
  options: ['div', 'section', 'article', 'aside', 'nav', 'header', 'footer', 'main', 'ul', 'ol', 'li'],
  table: { defaultValue: { summary: 'div' } }
} as const
