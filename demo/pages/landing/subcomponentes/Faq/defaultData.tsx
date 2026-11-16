import type { AccordionProps } from 'enchase'

export const defaultOpen = ['stable']

export const questions: AccordionProps['items'] = [
  {
    value: 'stable',
    title: 'Já posso usar em produção?',
    content: (
      <>
        A biblioteca está na série 0.x: uma versão minor pode trazer quebra, sempre declarada na primeira linha das notas e com uma página de migração. A cada build, a API é comparada com a última versão publicada.
      </>
    )
  },
  {
    value: 'next',
    title: 'Funciona com Next.js e Server Components?',
    content: (
      <>
        Sim. Cada entrada do pacote começa com <code>'use client'</code>, e um app Next 15 de teste importa os componentes em um Server Component a cada versão publicada.
      </>
    )
  },
  {
    value: 'css',
    title: 'E com Tailwind, styled-components ou CSS Modules?',
    content: (
      <>
        Sim. Desde a 0.23, uma classe sua vence o estilo da biblioteca em qualquer ordem de carregamento. Com Tailwind 4, importe <code>enchase/styles.layer.css</code> e declare a ordem das camadas.
      </>
    )
  },
  {
    value: 'weight',
    title: 'Preciso carregar o CSS de todos os componentes?',
    content: (
      <>
        Não. <code>enchase/styles.css</code> traz tudo em cerca de 28 kB com gzip, e <code>enchase/css/button.css</code> e os outros arquivos por componente trazem só o que você usa.
      </>
    )
  },
  {
    value: 'eject',
    title: 'Posso copiar o código para o meu projeto?',
    content: (
      <>
        Pode. <code>npx enchase eject Button Tabs</code> copia os componentes com o CSS deles para a sua pasta, e dali em diante o código é seu.
      </>
    )
  },
  {
    value: 'browsers',
    title: 'Quais navegadores são atendidos?',
    content: <>Chrome e Edge 120, Firefox 129 e Safari 17.5 em diante, no computador e no iOS.</>
  }
]
