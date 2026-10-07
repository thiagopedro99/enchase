import { useState } from 'react'

import { Button, Checkbox, Input, Modal, Select } from '@components/common/index.ts'
import { Panel, Row } from './styles.ts'
import { countryOptions } from './defaultData.ts'

export const LiveStrip = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Panel>
      <Row>
        <Button $variant="primary">Primary</Button>
        <Button $variant="secondary">Secondary</Button>
        <Button $variant="outline">Outline</Button>
        <Button $variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
      </Row>

      <Row $align="flex-start">
        <Input label="Email" helperText="Nunca compartilhamos seu email" />
        <Input label="Senha" type="password" />
        <Select label="País" placeholder="Selecione..." options={countryOptions} defaultValue="" />
        <Checkbox label="Aceito os termos" />
      </Row>

      <Row>
        <Button $variant="secondary" onClick={() => setModalOpen(true)} aria-haspopup="dialog">
          Abrir modal
        </Button>
      </Row>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Editar perfil"
        footer={
          <>
            <Button $variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setModalOpen(false)}>Salvar</Button>
          </>
        }
      >
        <Input label="Nome" $fullWidth />
      </Modal>
    </Panel>
  )
}

export default LiveStrip
