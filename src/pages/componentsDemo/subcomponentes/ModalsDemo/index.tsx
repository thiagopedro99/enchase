import { useState } from 'react'

import { Button, ConfirmModal, Flex, Modal } from '@components/common/index.ts'
import { codeExamples } from '@utils/codeExamples.ts'
import { useToast } from '@components/toast/index.ts'
import SectionBlock from '../SectionBlock/index.tsx'

import type { DemoSectionProps } from '../../types.ts'

export const ModalsDemo = ({ onShowCode }: DemoSectionProps) => {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirm = () => {
    setModalOpen(false)
    toast.success('Ação confirmada!')
  }

  return (
    <SectionBlock id="modais" title="Modais" description="Diálogos com foco preso, página inerte, Esc para fechar e saída animada." onShowCode={() => onShowCode(codeExamples.modal, 'Modal')}>
      <Flex gap="1rem" wrap>
        <Button onClick={() => setModalOpen(true)}>Abrir Modal</Button>
        <Button onClick={() => setConfirmOpen(true)}>Modal de Confirmação</Button>
      </Flex>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Exemplo de Modal"
        footer={
          <Flex justify="end" gap="0.5rem">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>Confirmar</Button>
          </Flex>
        }
      >
        <p>Este é um exemplo de modal customizável.</p>
        <p>Você pode colocar qualquer conteúdo aqui!</p>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => toast.info('Você confirmou a ação!')}
        title="Confirmar ação"
        message="Tem certeza que deseja realizar esta ação?"
      />
    </SectionBlock>
  )
}

export default ModalsDemo
