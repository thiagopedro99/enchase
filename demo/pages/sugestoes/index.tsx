import { Alert, Button, ButtonLink, VisuallyHidden, useToast } from 'enchase'
import { useCallback, useEffect, useMemo, useState } from 'react'

import PageHeader from '../../components/PageHeader/index.tsx'
import SuggestDialog from './subcomponentes/SuggestDialog/index.tsx'
import LoginDialog from './subcomponentes/LoginDialog/index.tsx'
import HowItWorks from './subcomponentes/HowItWorks/index.tsx'
import { issuesUrl, suggestUrl } from '../../defaultData.ts'
import SitePage from '../../components/SitePage/index.tsx'
import Failure from './subcomponentes/Failure/index.tsx'
import Account from './subcomponentes/Account/index.tsx'
import Loading from './subcomponentes/Loading/index.tsx'
import Toolbar from './subcomponentes/Toolbar/index.tsx'
import { useSuggestions } from './useSuggestions.ts'
import { useLoginFailure } from './useLoginFailure.ts'
import Empty from './subcomponentes/Empty/index.tsx'
import Board from './subcomponentes/Board/index.tsx'
import { defaultFilters } from './defaultData.ts'
import { takeIntent } from './intent.ts'
import { VotingContext } from './voting.ts'
import { useAccount } from './useAccount.ts'
import { columnsOf, totalOf } from './columns.ts'
import styles from './styles.module.css'

const Sugestoes = () => {
  const { state, reload, add } = useSuggestions()
  const { account, voting, asking, ask, dismiss, expire, leave } = useAccount()
  const [composing, setComposing] = useState(false)
  const loginFailed = useLoginFailure()
  const toast = useToast()
  const signed = account.status === 'signed'
  const [filters, setFilters] = useState(defaultFilters)
  const items = state.status === 'ready' ? state.items : undefined
  const columns = useMemo(() => columnsOf(items ?? [], filters), [items, filters])

  useEffect(() => {
    if (signed && takeIntent()) setComposing(true)
  }, [signed])

  const suggest = useCallback(() => (signed ? setComposing(true) : ask('suggest')), [signed, ask])

  const sent = useCallback(
    (suggestion: Parameters<typeof add>[0], listed: boolean) => {
      setComposing(false)
      add(suggestion)
      toast.success(listed ? 'Sugestão enviada. Ela já está em Em análise.' : 'Sugestão enviada. Ela aparece para todos no quadro assim que for revisada.')
    },
    [add, toast]
  )

  return (
    <SitePage title="Sugestões">
      <section aria-labelledby="sugestoes-title">
        <PageHeader id="sugestoes-title" eyebrow="Sugestões" title="O que você quer ver na Enchase?" lead="Sugira um componente ou uma melhoria, vote no que já foi pedido e acompanhe o andamento de cada ideia. Tudo fica registrado no GitHub.">
          {account.status === 'unavailable' ? (
            <ButtonLink href={suggestUrl} target="_blank" size="lg">
              Sugerir no GitHub
            </ButtonLink>
          ) : (
            <Button size="lg" onClick={suggest}>
              Sugerir
            </Button>
          )}
          <ButtonLink href={issuesUrl} target="_blank" variant="outline" size="lg">
            Ver todas as issues
          </ButtonLink>
        </PageHeader>

        <HowItWorks />

        <div className={styles.board}>
          <VisuallyHidden>
            <h2>Quadro de sugestões</h2>
          </VisuallyHidden>
          {loginFailed && (
            <Alert variant="error" title="Não foi possível entrar com o GitHub">
              Nada foi alterado na sua conta. Tente entrar de novo.
            </Alert>
          )}
          <Account account={account} onLeave={leave} />
          {state.status === 'loading' && <Loading />}
          {state.status === 'error' && <Failure limited={state.limited} onRetry={reload} />}
          {items?.length === 0 && <Empty onSuggest={account.status === 'unavailable' ? undefined : suggest} />}
          {items && items.length > 0 && (
            <VotingContext.Provider value={voting}>
              <Toolbar filters={filters} total={totalOf(columns)} onFiltersChange={setFilters} />
              <Board columns={columns} />
            </VotingContext.Provider>
          )}
          <LoginDialog request={asking} onClose={dismiss} />
          <SuggestDialog isOpen={composing} items={items ?? []} onClose={() => setComposing(false)} onSent={sent} onSignedOut={expire} />
        </div>
      </section>
    </SitePage>
  )
}

export default Sugestoes
