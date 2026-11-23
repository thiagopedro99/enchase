import { Button, Tooltip, useToast } from 'enchase'

import { CopyIcon } from '../icons.tsx'

import type { CopyButtonProps } from './types.ts'

const CopyButton = ({ text, label, done }: CopyButtonProps) => {
  const toast = useToast()

  const copy = () => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(done, 3000),
      () => toast.error('Não foi possível copiar. Selecione o texto e copie.', 5000)
    )
  }

  return (
    <Tooltip text={label} describe={false}>
      <Button variant="ghost" size="sm" iconOnly aria-label={label} onClick={copy}>
        <CopyIcon size={18} />
      </Button>
    </Tooltip>
  )
}

export default CopyButton
