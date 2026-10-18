import type { HrefCase } from './types.ts'

export const hrefCases: HrefCase[] = [
  { id: 'section', href: '#recursos', outcome: 'Âncora da página: o navegador rola até o elemento.' },
  { id: 'route', href: '/sobre', outcome: 'Rota do app: vai para o navigate do UIProvider.' },
  { id: 'route-hash', href: '/sobre#equipe', outcome: 'Rota com hash em outra página: vai para o navigate, com o hash no href.' },
  { id: 'same-page-hash', href: '/docs#props', outcome: 'Hash da página atual (currentHref="/docs"): o navegador rola e o navigate não é chamado.' },
  { id: 'external', href: 'https://example.com', outcome: 'URL externa: o navegador.' },
  { id: 'mail', href: 'mailto:oi@example.com', outcome: 'mailto: e tel: seguem o navegador.' },
  { id: 'native', href: '/referencia', native: true, outcome: 'native: o navegador, mesmo sendo uma rota. Serve para rotas de outro app no mesmo domínio.' },
  { id: 'blank', href: '/sobre', target: '_blank', outcome: 'target diferente de _self: o navegador abre o destino.' },
  { id: 'download', href: '/manual.pdf', download: '', outcome: 'download: o navegador baixa o arquivo.' }
]
