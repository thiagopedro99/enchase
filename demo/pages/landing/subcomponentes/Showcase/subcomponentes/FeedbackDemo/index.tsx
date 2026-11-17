import { Alert, Button, Modal, Progress, Tooltip, useToast } from 'enchase'
import { useState } from 'react'

import styles from './styles.module.css'

const FeedbackDemo = () => {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const publish = () => {
    close()
    toast.success('Versão 2.4 publicada', 4000)
  }

  return (
    <div className={styles.feedback}>
      <Alert variant="success" title="Backup concluído">
        Os dados de ontem estão guardados e prontos para restaurar.
      </Alert>
      <Alert variant="warning" title="Plano perto do limite">
        Você usou 46 das 50 vagas da equipe.
      </Alert>

      <div className={styles.sync}>
        <span id="feedback-sync">Sincronizando arquivos</span>
        <Progress aria-labelledby="feedback-sync" />
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => toast.info('Três pessoas estão vendo este projeto', 4000)}>
          Mostrar notificação
        </Button>
        <Tooltip text="Abre um diálogo com foco preso e Esc para fechar" arrow>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Abrir diálogo
          </Button>
        </Tooltip>
      </div>

      <Modal
        isOpen={open}
        onClose={close}
        title="Publicar a versão 2.4?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Agora não
            </Button>
            <Button onClick={publish}>Publicar</Button>
          </>
        }
      >
        A versão fica disponível para todas as contas em alguns minutos. Você pode voltar à anterior quando quiser.
      </Modal>
    </div>
  )
}

export default FeedbackDemo
