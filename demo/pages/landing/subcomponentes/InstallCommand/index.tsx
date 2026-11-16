import { Button, Tooltip, useToast } from 'enchase'

import { installCommand } from '../../defaultData.ts'
import { CopyIcon } from '../../icons.tsx'
import styles from './styles.module.css'

const InstallCommand = () => {
  const toast = useToast()

  const copy = () => {
    navigator.clipboard.writeText(installCommand).then(
      () => toast.success('Comando copiado', 3000),
      () => toast.error('Não foi possível copiar. Selecione o texto e copie.', 5000)
    )
  }

  return (
    <div className={styles.command}>
      <span className={styles.prompt} aria-hidden="true">
        $
      </span>
      <code className={styles.text}>{installCommand}</code>
      <Tooltip text="Copiar comando" describe={false}>
        <Button variant="ghost" size="sm" iconOnly aria-label="Copiar comando" onClick={copy}>
          <CopyIcon size={18} />
        </Button>
      </Tooltip>
    </div>
  )
}

export default InstallCommand
