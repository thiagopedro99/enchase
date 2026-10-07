import { Button, Flex } from '@components/common/index.ts'
import { codeExamples } from '@utils/codeExamples.ts'
import { useToast } from '@components/toast/index.ts'
import SectionBlock from '../SectionBlock/index.tsx'

import type { DemoSectionProps } from '../../types.ts'

export const ToastsDemo = ({ onShowCode }: DemoSectionProps) => {
  const toast = useToast()

  return (
    <SectionBlock id="toasts" title="Toasts (Notificações)" description="Notificações tonais por tipo; pausam no hover e no foco e fecham com Esc." onShowCode={() => onShowCode(codeExamples.toast, 'Toast')}>
      <Flex $gap="1rem" $wrap>
        <Button onClick={() => toast.success('Sucesso!')}>Success</Button>
        <Button onClick={() => toast.error('Erro!')}>Error</Button>
        <Button onClick={() => toast.warning('Atenção!')}>Warning</Button>
        <Button onClick={() => toast.info('Informação!')}>Info</Button>
      </Flex>
    </SectionBlock>
  )
}

export default ToastsDemo
