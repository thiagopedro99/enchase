import { Container } from 'enchase'

import KeyboardDemo from './subcomponentes/KeyboardDemo/index.tsx'
import HeadlessDemo from './subcomponentes/HeadlessDemo/index.tsx'
import CascadeDemo from './subcomponentes/CascadeDemo/index.tsx'
import WeightDemo from './subcomponentes/WeightDemo/index.tsx'
import StylesDemo from './subcomponentes/StylesDemo/index.tsx'
import MotionDemo from './subcomponentes/MotionDemo/index.tsx'
import ModeDemo from './subcomponentes/ModeDemo/index.tsx'
import SectionHeading from '../SectionHeading/index.tsx'
import Cell from './subcomponentes/Cell/index.tsx'
import Reveal from '../Reveal/index.tsx'
import styles from './styles.module.css'

import type { BentoProps } from './types.ts'
import type { PointerEvent } from 'react'

const shine = ({ currentTarget, clientX, clientY, pointerType }: PointerEvent<HTMLUListElement>) => {
  if (pointerType !== 'mouse') return

  currentTarget.querySelectorAll<HTMLElement>('[data-shine]').forEach((element) => {
    const { left, top } = element.getBoundingClientRect()

    element.style.setProperty('--landing-shine-x', `${clientX - left}px`)
    element.style.setProperty('--landing-shine-y', `${clientY - top}px`)
  })
}

const Bento = ({ look, onLookChange }: BentoProps) => (
  <section id="recursos" className={styles.section} aria-labelledby="recursos-title">
    <Container maxWidth="xl" className={styles.content}>
      <Reveal>
        <SectionHeading id="recursos-title" eyebrow="Recursos" title="O trabalho chato já vem feito" lead="Foco, teclado, contraste, tema escuro e movimento são da biblioteca. Cada bloco abaixo é o componente de verdade: pode mexer." />
      </Reveal>

      <Reveal>
        <ul className={styles.grid} onPointerMove={shine}>
          <Cell span="wide" title="Feito para o teclado" text="Combobox, calendário e menu com foco gerenciado, setas, Home, End e Esc empilhado. Cada componente passa pelo axe em Chromium, Firefox e WebKit de verdade.">
            <KeyboardDemo />
          </Cell>
          <Cell title="Leve de verdade" text="Todo o CSS com gzip, ou só o do componente que você usa. Nenhuma dependência além do React.">
            <WeightDemo />
          </Cell>
          <Cell title="Quatro estilos, uma API" text="Troque o estilo e veja esta página inteira mudar. Nos seus componentes, nenhuma linha muda.">
            <StylesDemo look={look} onLookChange={onLookChange} />
          </Cell>
          <Cell title="Molas em CSS puro" text="Movimento por tokens, com linear() no lugar de uma biblioteca de animação. Quem pede movimento reduzido é respeitado.">
            <MotionDemo />
          </Cell>
          <Cell title="Claro e escuro inclusos" text="Uma cor de marca gera as duas paletas, e validateTheme lista os pares abaixo do contraste AA.">
            <ModeDemo />
          </Cell>
          <Cell span="half" title="O seu CSS vence" text="Uma classe sua vence o estilo da biblioteca em qualquer ordem de carregamento, sem !important.">
            <CascadeDemo />
          </Cell>
          <Cell span="half" title="Só o comportamento, se preferir" text="Hooks sem visual entregam estado, teclado e ARIA para o seu HTML. E o eject copia o código de um componente para o seu projeto.">
            <HeadlessDemo />
          </Cell>
        </ul>
      </Reveal>
    </Container>
  </section>
)

export default Bento
