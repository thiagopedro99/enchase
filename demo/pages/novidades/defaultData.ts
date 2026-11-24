import type { GroupKind, ReleaseNote } from './types.ts'

export const groupLabels: Record<GroupKind, { label: string; variant: 'success' | 'warning' | 'info' }> = {
  novo: { label: 'Novo', variant: 'success' },
  mudou: { label: 'Mudou', variant: 'warning' },
  corrigido: { label: 'Corrigido', variant: 'info' }
}

export const anchorOf = (version: string) => `v-${version.replace(/\./g, '-')}`

export const releases: ReleaseNote[] = [
  {
    version: '0.24.0',
    previous: '0.23.0',
    date: '24 de novembro de 2026',
    shortDate: '24 nov',
    title: 'Lapidado, o novo visual padrão',
    summary: 'Quem não escolhe um estilo passa a receber o Lapidado: superfícies neutras, bordas precisas e a cor da marca só onde há ação, seleção ou foco. O visual anterior continua disponível, igual ao que era, como o estilo `material3`.',
    behavior: true,
    groups: [
      {
        kind: 'novo',
        items: [
          'Estilo `material3`, em `enchase/styles/material3`: o visual padrão da 0.23, com o mesmo tema de antes.',
          'Um gancho seu declarado em `:root` vence o estilo padrão em qualquer ordem de CSS, também com a densidade compacta.',
          'Ganchos novos: `--enchase-table-header-background-sticky` e `--enchase-input-outline-padding-inline`.'
        ]
      },
      {
        kind: 'mudou',
        items: [
          'Sem `style`, o visual é o Lapidado, não mais o Material 3: cantos de 10 px nos controles e 16 px nos cards, borda de 1 px com sombra curta e controles um pouco mais baixos.',
          'O rótulo dos campos fica em cima por padrão (`stacked`). No `material3` ele continua flutuante.'
        ]
      },
      {
        kind: 'corrigido',
        items: [
          'Texto longo sem espaços na ajuda e no erro dos campos quebra a linha em vez de alargar a página.',
          'O rótulo ao lado do campo fica centralizado com ele quando quebra em duas linhas.',
          'No estilo shadcn, o cabeçalho fixo da `Table` deixa de mostrar as linhas que rolam por trás.'
        ]
      }
    ],
    migration: {
      text: 'Para manter o visual da 0.23, passe o estilo `material3` ao tema. É a única mudança.',
      blocks: [{ label: 'main.tsx', language: 'tsx', code: "import { ColorModeProvider } from 'enchase'\nimport { material3 } from 'enchase/styles/material3'\n\n<ColorModeProvider theme={{ style: material3 }}>\n  <App />\n</ColorModeProvider>" }]
    }
  },
  {
    version: '0.23.0',
    previous: '0.22.0',
    date: '12 de novembro de 2026',
    shortDate: '12 nov',
    title: 'A sua classe vence o CSS da biblioteca',
    summary: 'O CSS da Enchase passa a ocupar uma faixa fixa da cascata. Uma classe sua vence as regras da biblioteca em qualquer ordem de carregamento, sem camada de cascata e sem `!important`. Vale para CSS puro, CSS Modules e styled-components.',
    behavior: true,
    groups: [
      {
        kind: 'novo',
        items: [
          'Uma classe sua vence a regra de repouso da biblioteca, venha antes ou depois do CSS dela.',
          'Uma classe que nomeia um estado, como `.salvar:hover` ou `.salvar:disabled`, vence a regra da biblioteca para aquele estado.',
          'Guia novo, `STYLING.md`, que diz o que vence o quê.'
        ]
      },
      {
        kind: 'mudou',
        items: [
          'Um seletor só de elemento, como `button` ou `h1`, perde para todas as regras da biblioteca. Antes ele podia vencer algumas.',
          'Uma regra sua em estado de elemento, como `a:hover`, não altera mais o hover do `Link` nem o anel de foco dos links de navegação.',
          'O `styles.css` cresce 4,5% em gzip (de 27,3 para 28,6 kB). Nenhuma API foi removida.'
        ]
      }
    ],
    migration: {
      text: 'Se você mudava um componente com um seletor de elemento, troque por uma classe.',
      blocks: [
        { label: 'Antes', language: 'css', code: 'button {\n  border-radius: 0;\n}' },
        { label: 'Depois', language: 'css', code: '.salvar {\n  border-radius: 0;\n}' }
      ]
    }
  },
  {
    version: '0.22.0',
    previous: '0.21.1',
    date: '6 de novembro de 2026',
    shortDate: '6 nov',
    title: 'CSS por componente',
    summary: 'Agora dá para importar só o CSS dos componentes que você usa, e o item do `Breadcrumbs` passa a ser nomeado como nos outros componentes de lista.',
    behavior: false,
    groups: [
      {
        kind: 'novo',
        items: [
          '`enchase/css/<nome>.css` traz o CSS de um componente só. O mapa `enchase/css/index.json` diz de quais outros arquivos cada um precisa.',
          '`BreadcrumbItem` aceita `value`, como `TabsItem` e `AccordionItem`. O `id` continua valendo até a 1.0.',
          '`contrastChecks` passa a ser exportado de `enchase/theme`.'
        ]
      }
    ],
    migration: {
      text: 'Opcional. Use os arquivos por componente no lugar do `enchase/styles.css`, nunca os dois juntos.',
      blocks: [{ label: 'main.tsx', language: 'tsx', code: "import 'enchase/theme.css'\nimport 'enchase/css/icon.css'\nimport 'enchase/css/button.css'" }]
    }
  },
  {
    version: '0.21.1',
    previous: '0.21.0',
    date: '6 de novembro de 2026',
    shortDate: '6 nov',
    title: 'Correção no estilo shadcn',
    summary: 'Uma correção visual, sem mudança na API.',
    behavior: false,
    groups: [{ kind: 'corrigido', items: ['O rótulo do `SegmentedControl` agora segue o estilo shadcn.'] }]
  },
  {
    version: '0.21.0',
    previous: '0.20.0',
    date: '6 de novembro de 2026',
    shortDate: '6 nov',
    title: 'ButtonLink só com ícone e ref em todo componente',
    summary: 'Quatro recursos pedidos no uso do dia a dia. Nada foi removido nem mudou de comportamento.',
    behavior: false,
    groups: [
      {
        kind: 'novo',
        items: [
          '`ButtonLink` aceita `iconOnly`, como o `Button`: um quadrado para um ícone só, nomeado por `aria-label`.',
          '`SegmentedControl` ganha um rótulo visível com a prop `label`.',
          'Todo componente que desenha um elemento aceita `ref`.',
          'No `Combobox`, a primeira opção que combina com o texto já fica ativa enquanto você digita.'
        ]
      },
      { kind: 'corrigido', items: ['O `padding` do `Card` deixa de ser escrito inline: uma classe sua agora vence a prop.'] }
    ]
  },
  {
    version: '0.20.0',
    previous: '0.19.1',
    date: '5 de novembro de 2026',
    shortDate: '5 nov',
    title: 'Hooks headless em caminhos estáveis',
    summary: 'Os cinco hooks sem interface saem do caminho experimental, e o `enchase eject` passa a ser estável.',
    behavior: false,
    groups: [
      {
        kind: 'novo',
        items: [
          '`useTabs`, `useAccordion`, `usePagination`, `useSegmentedControl` e `useSlider` são exportados de `enchase/headless/<nome>`.',
          '`enchase eject` congela os comandos, as opções e o formato do `enchase.eject.json`.'
        ]
      },
      { kind: 'mudou', items: ['Os caminhos `enchase/experimental/*` continuam funcionando, com aviso de depreciação no editor, até a 1.0.'] }
    ],
    migration: {
      text: 'Troque o caminho do import. O hook é o mesmo.',
      blocks: [
        { label: 'Antes', language: 'tsx', code: "import { useTabs } from 'enchase/experimental/tabs'" },
        { label: 'Depois', language: 'tsx', code: "import { useTabs } from 'enchase/headless/tabs'" }
      ]
    }
  }
]

export const currentVersion = releases[0]?.version ?? ''

export const oldestVersion = releases[releases.length - 1]?.version ?? ''
