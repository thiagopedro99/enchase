import { AccessibilityIcon, BrushIcon, CodeIcon, FeatherIcon, LayersIcon, PuzzleIcon } from '../../icons.tsx'

export const features = [
  {
    id: 'accessibility',
    icon: <AccessibilityIcon />,
    title: 'Acessível desde o primeiro render',
    text: (
      <>
        Todo componente passa pelo axe, e foco, <code>inert</code>, trava de rolagem e Esc empilhado rodam em Chromium, Firefox e WebKit de verdade. Alvos de 24 px ou mais e movimento reduzido respeitado.
      </>
    )
  },
  {
    id: 'theme',
    icon: <BrushIcon />,
    title: 'Tema inteiro por tokens',
    text: (
      <>
        Uma cor de marca gera as paletas clara e escura. <code>createTheme</code> recusa cor inválida e <code>validateTheme</code> lista os pares abaixo do contraste mínimo.
      </>
    )
  },
  {
    id: 'styles',
    icon: <LayersIcon />,
    title: 'Três estilos, uma API',
    text: (
      <>
        <code>enchase</code> segue o Material Design 3, <code>shadcn</code> é neutro e com bordas, <code>workbench</code> é denso para telas de trabalho. Trocar de estilo não muda uma linha dos seus componentes.
      </>
    )
  },
  {
    id: 'cascade',
    icon: <CodeIcon />,
    title: 'O seu CSS vence',
    text: (
      <>
        Uma classe sua vence o estilo da biblioteca em qualquer ordem de carregamento, em CSS comum, CSS Modules ou styled-components. Cada parte tem <code>data-slot</code> e variáveis <code>--enchase-*</code>.
      </>
    )
  },
  {
    id: 'headless',
    icon: <PuzzleIcon />,
    title: 'Sem visual, quando precisar',
    text: (
      <>
        Os hooks de Tabs, Accordion, Slider, Pagination e SegmentedControl entregam estado, teclado e ARIA para o seu HTML. E <code>enchase eject</code> copia o código de um componente para o seu projeto.
      </>
    )
  },
  {
    id: 'weight',
    icon: <FeatherIcon />,
    title: 'Leve e pronto para o servidor',
    text: (
      <>
        Nenhuma dependência além do React. O CSS vem inteiro ou por componente, e cada entrada do pacote funciona com Server Components do Next.
      </>
    )
  }
]
