import { useState } from 'react'

import { Button, Checkbox, Input, Modal, Select } from '@components/common/index.ts'
import { countryOptions } from './defaultData.ts'
import styles from './styles.module.css'

export const LiveStrip = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
      </div>

      <div className={styles.row} data-align="flex-start">
        <Input label="Email" helperText="Nunca compartilhamos seu email" />
        <Input label="Senha" type="password" />
        <Select label="País" placeholder="Selecione..." options={countryOptions} defaultValue="" />
        <Checkbox label="Aceito os termos" />
      </div>

      <div className={styles.row}>
        <Button variant="secondary" onClick={() => setModalOpen(true)} aria-haspopup="dialog">
          Abrir modal
        </Button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Editar perfil"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setModalOpen(false)}>Salvar</Button>
          </>
        }
      >
        <Input label="Nome" fullWidth />
      </Modal>
    </div>
  )
}

export default LiveStrip
