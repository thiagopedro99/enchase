export const configMeanings = {
  dir: 'direção do texto, definida pelo locale',
  closeModal: 'um dos textos de acessibilidade, vindo do locale e de labels',
  breakpoint: 'largura do breakpoint md, usada pelo Container, pelo Layout e pela Navbar',
  motion: 'modo e preset do movimento de todos os componentes'
} as const

export const linkCases = [
  { href: '/sobre', outcome: 'rota do app: o clique vai para o navigate' },
  { href: '/docs#props', outcome: 'hash da página /docs: com currentHref="/docs" o navegador rola a página; com outra página, vai para o navigate' },
  { href: 'https://example.com', outcome: 'link externo: fica com o navegador' }
] as const
