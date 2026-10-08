interface CodeBlock {
  title: string
  code: string
}

export const codeExamples: Record<string, CodeBlock[]> = {
  button: [
    {
      title: 'Importar o componente',
      code: `import { Button } from '@components/common';`
    },
    {
      title: 'Uso básico',
      code: `<Button>Clique aqui</Button>`
    },
    {
      title: 'Variações',
      code: `<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>`
    },
    {
      title: 'Tamanhos',
      code: `<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>`
    },
    {
      title: 'Largura total',
      code: `<Button fullWidth>Largura Total</Button>`
    },
    {
      title: 'Desabilitado',
      code: `<Button disabled>Desabilitado</Button>`
    },
    {
      title: 'Com evento',
      code: `<Button onClick={() => console.log('Clicou!')}>
  Com Evento
</Button>`
    }
  ],

  input: [
    {
      title: 'Importar o componente',
      code: `import { Input } from '@components/common';
import { useState } from 'react';`
    },
    {
      title: 'Input básico',
      code: `const [value, setValue] = useState('');

<Input
  label="Nome"
  placeholder="Digite seu nome"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>`
    },
    {
      title: 'Com helper text',
      code: `<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  helperText="Nunca compartilharemos seu email"
/>`
    },
    {
      title: 'Com erro',
      code: `<Input
  label="Campo obrigatório"
  error="Este campo é obrigatório"
  placeholder="Digite algo"
/>`
    },
    {
      title: 'Desabilitado',
      code: `<Input
  label="Desabilitado"
  disabled
  placeholder="Campo desabilitado"
/>`
    },
    {
      title: 'Largura total',
      code: `<Input
  label="Full Width"
  fullWidth
  placeholder="Campo de largura total"
/>`
    }
  ],

  select: [
    {
      title: 'Importar o componente',
      code: `import { Select } from '@components/common';
import { useState } from 'react';`
    },
    {
      title: 'Select básico',
      code: `const [value, setValue] = useState('');

<Select
  label="Escolha uma opção"
  placeholder="Selecione..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  options={[
    { value: '1', label: 'Opção 1' },
    { value: '2', label: 'Opção 2' },
    { value: '3', label: 'Opção 3' },
    { value: '4', label: 'Desabilitada', disabled: true },
  ]}
/>`
    },
    {
      title: 'Com erro',
      code: `<Select
  label="Com erro"
  error="Selecione uma opção"
  options={[
    { value: 'a', label: 'Opção A' },
    { value: 'b', label: 'Opção B' },
  ]}
/>`
    },
    {
      title: 'Largura total',
      code: `<Select
  label="Opções"
  fullWidth
  options={[...]}
/>`
    }
  ],

  checkbox: [
    {
      title: 'Importar o componente',
      code: `import { Checkbox } from '@components/common';
import { useState } from 'react';`
    },
    {
      title: 'Checkbox básico',
      code: `const [checked, setChecked] = useState(false);

<Checkbox
  label="Aceito os termos e condições"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>`
    },
    {
      title: 'Sem label',
      code: `<Checkbox
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>`
    },
    {
      title: 'Desabilitado',
      code: `<Checkbox label="Desabilitado" disabled />`
    },
    {
      title: 'Marcado e desabilitado',
      code: `<Checkbox label="Marcado e desabilitado" checked disabled />`
    }
  ],

  modal: [
    {
      title: 'Importar o componente',
      code: `import { Modal, Button } from '@components/common';
import { useState } from 'react';`
    },
    {
      title: 'Modal básico',
      code: `const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>
    Abrir Modal
  </Button>

  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Título do Modal"
    footer={
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancelar
        </Button>
        <Button onClick={() => setIsOpen(false)}>
          Confirmar
        </Button>
      </div>
    }
  >
    <p>Conteúdo do modal aqui...</p>
  </Modal>
</>`
    },
    {
      title: 'Modal de confirmação',
      code: `import { ConfirmModal } from '@components/common';

<ConfirmModal
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  onConfirm={() => {
    console.log('Confirmado!');
  }}
  title="Confirmar ação"
  message="Tem certeza que deseja realizar esta ação?"
  confirmText="Sim"
  cancelText="Não"
/>`
    }
  ],

  loading: [
    {
      title: 'Importar o componente',
      code: `import { Loading, InlineLoading } from '@components/common';`
    },
    {
      title: 'Loading básico',
      code: `<Loading size="md" />`
    },
    {
      title: 'Com texto',
      code: `<Loading size="md" text="Carregando..." />`
    },
    {
      title: 'Tamanhos diferentes',
      code: `<Loading size="xs" />
<Loading size="sm" />
<Loading size="md" />
<Loading size="lg" />`
    },
    {
      title: 'Loading com overlay',
      code: `const [loading, setLoading] = useState(false);

<Button onClick={() => setLoading(true)}>
  Carregar
</Button>

{loading && <Loading overlay text="Processando..." />}`
    },
    {
      title: 'Loading inline',
      code: `<Button>
  Carregando <InlineLoading />
</Button>`
    }
  ],

  card: [
    {
      title: 'Importar o componente',
      code: `import { Card } from '@components/common';`
    },
    {
      title: 'Card básico',
      code: `<Card>
  <h3>Título do Card</h3>
  <p>Conteúdo do card aqui...</p>
</Card>`
    },
    {
      title: 'Card padrão',
      code: `<Card variant="default">
  <h3>Card Padrão</h3>
  <p>Sombra média com hover</p>
</Card>`
    },
    {
      title: 'Card elevado',
      code: `<Card variant="elevated">
  <h3>Card Elevado</h3>
  <p>Sombra maior com animação</p>
</Card>`
    },
    {
      title: 'Card outlined',
      code: `<Card variant="outlined">
  <h3>Card Outlined</h3>
  <p>Apenas borda</p>
</Card>`
    },
    {
      title: 'Com padding customizado',
      code: `<Card padding="2rem">
  Conteúdo com padding maior
</Card>`
    }
  ],

  toast: [
    {
      title: 'Importar o hook',
      code: `import { useToast } from '@components/toast';`
    },
    {
      title: 'Usar no componente',
      code: `const toast = useToast();`
    },
    {
      title: 'Toast de sucesso',
      code: `<Button onClick={() => toast.success('Sucesso!')}>
  Success Toast
</Button>`
    },
    {
      title: 'Toast de erro',
      code: `<Button onClick={() => toast.error('Erro!')}>
  Error Toast
</Button>`
    },
    {
      title: 'Toast de aviso',
      code: `<Button onClick={() => toast.warning('Atenção!')}>
  Warning Toast
</Button>`
    },
    {
      title: 'Toast de informação',
      code: `<Button onClick={() => toast.info('Informação!')}>
  Info Toast
</Button>`
    },
    {
      title: 'Com duração customizada',
      code: `toast.success('Mensagem de sucesso', 5000);`
    }
  ],

  skeleton: [
    {
      title: 'Importar o componente',
      code: `import { Skeleton } from '@components/common';`
    },
    {
      title: 'Skeleton de texto',
      code: `<Skeleton variant="text" width="100%" />
<Skeleton variant="text" width="80%" />
<Skeleton variant="text" width="60%" />`
    },
    {
      title: 'Skeleton circular',
      code: `<Skeleton variant="circular" width="40px" />
<Skeleton variant="circular" width="60px" />
<Skeleton variant="circular" width="80px" />`
    },
    {
      title: 'Skeleton retangular',
      code: `<Skeleton variant="rectangular" height="200px" />
<Skeleton variant="rectangular" width="100%" height="300px" />`
    },
    {
      title: 'Exemplo em um card',
      code: `<Card>
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
    <Skeleton variant="circular" width="48px" />
    <div style={{ flex: 1 }}>
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="60%" />
    </div>
  </div>
  <Skeleton variant="rectangular" height="200px" style={{ marginTop: '1rem' }} />
</Card>`
    }
  ],

  breadcrumbs: [
    {
      title: 'Importar o componente',
      code: `import { Breadcrumbs } from '@components/common/index.ts'`
    },
    {
      title: 'Uso básico',
      code: `<Breadcrumbs
  items={[
    { id: 'home', label: 'Início', to: '/' },
    { id: 'docs', label: 'Docs', to: '/docs' },
    { id: 'api', label: 'API' }
  ]}
/>`
    },
    {
      title: 'Trilha longa',
      code: `<Breadcrumbs items={items} maxItems={4} />`
    },
    {
      title: 'No Layout',
      code: `<Layout breadcrumbs={items}>...</Layout>

<Layout>...</Layout>`
    }
  ],

  sidebar: [
    {
      title: 'Importar o componente',
      code: `import { Sidebar } from '@components/common/index.ts'`
    },
    {
      title: 'Seções e itens',
      code: `const sections = [
  {
    id: 'app',
    title: 'Navegação',
    items: [
      { id: 'home', label: 'Início', icon: Home, to: '/' },
      { id: 'docs', label: 'Docs', icon: BookOpen, href: '#docs' },
      { id: 'logout', label: 'Sair', icon: LogOut, onClick: handleLogout }
    ]
  }
]`
    },
    {
      title: 'Permanente e recolhível',
      code: `const [collapsed, setCollapsed] = useState(false)

<Sidebar
  sections={sections}
  header={<Brand />}
  collapsed={collapsed}
  onToggleCollapsed={() => setCollapsed((current) => !current)}
/>`
    },
    {
      title: 'Drawer modal (mobile)',
      code: `<Sidebar
  variant="modal"
  open={open}
  onClose={() => setOpen(false)}
  sections={sections}
/>`
    },
    {
      title: 'No Layout',
      code: `<Layout
  navigation="sidebar"
  pageSections={pageSections}
  activePageSectionId={activeId}
>
  ...
</Layout>

<Layout navigation="navbar">...</Layout>`
    }
  ],

  flex: [
    {
      title: 'Importar o componente',
      code: `import { Flex } from '@components/common';`
    },
    {
      title: 'Flex básico',
      code: `<Flex>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Flex>`
    },
    {
      title: 'Direção vertical',
      code: `<Flex direction="column">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Flex>`
    },
    {
      title: 'Alinhamento',
      code: `<Flex align="center">...</Flex>
<Flex align="start">...</Flex>
<Flex align="end">...</Flex>`
    },
    {
      title: 'Justificação',
      code: `<Flex justify="center">...</Flex>
<Flex justify="between">...</Flex>
<Flex justify="around">...</Flex>`
    },
    {
      title: 'Gap customizado',
      code: `<Flex gap="2rem">...</Flex>`
    },
    {
      title: 'Com wrap',
      code: `<Flex wrap>...</Flex>`
    },
    {
      title: 'Combinações',
      code: `<Flex direction="column" align="center" gap="1rem">
  <div>Centralizado</div>
  <div>Verticalmente</div>
</Flex>`
    }
  ],

  grid: [
    {
      title: 'Importar o componente',
      code: `import { Grid } from '@components/common';`
    },
    {
      title: 'Grid básico',
      code: `<Grid>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>`
    },
    {
      title: '2 colunas',
      code: `<Grid columns={2}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</Grid>`
    },
    {
      title: '3 colunas',
      code: `<Grid columns={3}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>`
    },
    {
      title: 'Com largura mínima',
      code: `<Grid minColumnWidth="250px">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</Grid>`
    },
    {
      title: 'Gap customizado',
      code: `<Grid columns={3} gap="2rem">...</Grid>`
    }
  ]
}