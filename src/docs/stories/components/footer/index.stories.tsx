import { Footer } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Rodapé com o ano, o nome da empresa, um aviso e links. O ano padrão é o atual.'
      }
    }
  },
  args: {
    companyName: 'Enchase',
    notice: 'Licença MIT.'
  },
  argTypes: {
    companyName: { description: 'Nome exibido depois do ano. Sem valor padrão.', control: 'text' },
    notice: { description: 'Aviso depois do nome, como a licença. Sem valor padrão.', control: 'text' },
    year: { description: 'Ano exibido. O padrão é o ano atual.', control: 'number' },
    links: {
      description: 'Links exibidos antes do aviso, como [{ label, href }].',
      control: 'object'
    },
    className: { description: 'Classe da raiz (data-slot="footer").', control: 'text' },
    style: { control: false }
  }
} satisfies Meta<typeof Footer>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithLinks: Story = {
  args: {
    links: [
      { label: 'Documentação', href: '/docs' },
      { label: 'Repositório', href: 'https://github.com/thiagopedro99/enchase' }
    ]
  }
}

export const OnlyTheYear: Story = {
  args: { companyName: undefined, notice: undefined }
}
