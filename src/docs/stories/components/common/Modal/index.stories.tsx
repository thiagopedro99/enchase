import { useState } from 'react'
import { Button, Modal } from 'enchase'

import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

type ModalDemoProps = ComponentProps<typeof Modal> & { label: string }

const ModalDemo = ({ label, ...args }: ModalDemoProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}

const meta = {
  title: 'Componentes/Modal',
  component: Modal,
  args: {
    isOpen: false,
    onClose: () => undefined,
    title: 'Editar perfil',
    children: 'O foco fica preso no painel, a página atrás fica inerte e Esc devolve o foco ao botão.',
    size: 'md',
    showCloseButton: true,
    closeOnOverlayClick: true,
    closeOnEsc: true
  },
  parameters: {
    docs: {
      description: {
        component: 'Diálogo modal renderizado em um portal: o foco fica preso no painel, a página atrás fica inerte, e Esc ou o clique no fundo fecham. Entra e sai com animação. É sempre controlado por `isOpen` e `onClose`.'
      }
    }
  },
  argTypes: {
    isOpen: {
      description: 'Abre e fecha o modal. Ele é sempre controlado: quem usa guarda o estado e o muda em onClose. Renderiza em um portal no body, só depois de montar, e continua montado até a animação de saída terminar.',
      control: false
    },
    onClose: {
      description: 'Chamado quando o usuário pede para fechar: botão de fechar, clique no fundo ou Esc, conforme showCloseButton, closeOnOverlayClick e closeOnEsc. O modal não se fecha sozinho.',
      control: false
    },
    title: { description: 'Título do diálogo (h2), que dá o nome acessível. Sem ele, use ariaLabel.', control: 'text' },
    ariaLabel: { description: 'Nome acessível do diálogo quando não há title.', control: 'text' },
    role: {
      description: 'dialog é o padrão. alertdialog é para confirmações que exigem uma resposta: o corpo passa a ser a descrição acessível (aria-describedby).',
      control: 'inline-radio',
      options: ['dialog', 'alertdialog'],
      table: { defaultValue: { summary: 'dialog' } }
    },
    size: {
      description: 'Largura máxima do painel.',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      table: { defaultValue: { summary: 'md' } }
    },
    showCloseButton: { description: 'Mostra o botão de fechar no cabeçalho.', control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    closeOnOverlayClick: { description: 'Fecha ao clicar no fundo.', control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    closeOnEsc: { description: 'Fecha com Esc. Com modais empilhados, só o de cima fecha.', control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    className: { description: 'Classe do painel. Vence a da biblioteca sem !important.', control: false },
    style: { description: 'Estilo do painel, mesclado com o da biblioteca (o seu vence).', control: false },
    animation: { description: 'false desliga o movimento; { recipe, tuning } ajusta a duração, a distância e a escala.', control: false },
    children: { description: 'Conteúdo do corpo do modal.', control: 'text' },
    footer: { description: 'Conteúdo fixo abaixo do corpo, como os botões de ação.', control: false }
  }
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => <ModalDemo {...args} label="Abrir modal" footer={<Button>Salvar</Button>} />
}

export const WithoutMotion: Story = {
  render: (args) => <ModalDemo {...args} label="Abrir sem animação" animation={false} />
}
