import { Alert, ButtonLink, VisuallyHidden } from 'enchase'
import { useMemo, useState } from 'react'

import PageHeader from '../../components/PageHeader/index.tsx'
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
import { VotingContext } from './voting.ts'
import { useAccount } from './useAccount.ts'
import { columnsOf, totalOf } from './columns.ts'
import styles from './styles.module.css'

const Sugestoes = () => {
  const { state, reload } = useSuggestions()
  const { account, voting, asking, dismiss, leave } = useAccount()
  const loginFailed = useLoginFailure()
  const [filters, setFilters] = useState(defaultFilters)
  const items = state.status === 'ready' ? state.items : undefined
  const columns = useMemo(() => columnsOf(items ?? [], filters), [items, filters])

  return (
    <SitePage title="Sugestões">
      <section aria-labelledby="sugestoes-title">
        <PageHeader id="sugestoes-title" eyebrow="Sugestões" title="O que você quer ver na Enchase?" lead="Sugira um componente ou uma melhoria, vote no que já foi pedido e acompanhe o andamento de cada ideia. Tudo fica registrado no GitHub.">
          <ButtonLink href={suggestUrl} target="_blank" size="lg">
            Sugerir no GitHub
          </ButtonLink>
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
          {items?.length === 0 && <Empty />}
          {items && items.length > 0 && (
            <VotingContext.Provider value={voting}>
              <Toolbar filters={filters} total={totalOf(columns)} onFiltersChange={setFilters} />
              <Board columns={columns} />
            </VotingContext.Provider>
          )}
          <LoginDialog suggestion={asking} onClose={dismiss} />
        </div>
      </section>
    </SitePage>
  )
}

export default Sugestoes
