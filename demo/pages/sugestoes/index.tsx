import { Alert, Container, VisuallyHidden, useToast } from 'enchase'
import { useCallback, useEffect, useMemo, useState } from 'react'

import PageHeader from '../../components/PageHeader/index.tsx'
import SuggestionPanel from './subcomponentes/SuggestionPanel/index.tsx'
import SuggestDialog from './subcomponentes/SuggestDialog/index.tsx'
import LoginDialog from './subcomponentes/LoginDialog/index.tsx'
import MoveDialog from './subcomponentes/MoveDialog/index.tsx'
import HowItWorks from './subcomponentes/HowItWorks/index.tsx'
import SitePage from '../../components/SitePage/index.tsx'
import Failure from './subcomponentes/Failure/index.tsx'
import Account from './subcomponentes/Account/index.tsx'
import Loading from './subcomponentes/Loading/index.tsx'
import Toolbar from './subcomponentes/Toolbar/index.tsx'
import { useSuggestions } from './useSuggestions.ts'
import { useLoginFailure } from './useLoginFailure.ts'
import Empty from './subcomponentes/Empty/index.tsx'
import Board from './subcomponentes/Board/index.tsx'
import { defaultFilters, issueParameter } from './defaultData.ts'
import { setSearch, useSearch } from '../../router.ts'
import { takeIntent } from './intent.ts'
import { VotingContext } from './voting.ts'
import { useAccount } from './useAccount.ts'
import { useMoves } from './useMoves.ts'
import { columnsOf, totalOf } from './columns.ts'
import styles from './styles.module.css'

const Sugestoes = () => {
  const { state, reload, add, refreshed } = useSuggestions()
  const search = useSearch()
  const openId = Number(new URLSearchParams(search).get(issueParameter)) || null
  const open = useCallback((id: number) => setSearch(`?${issueParameter}=${id}`), [])
  const close = useCallback(() => setSearch(''), [])
  const { account, voting, asking, ask, dismiss, expire, leave, settle } = useAccount(open)

  useEffect(() => {
    if (refreshed > 0) settle()
  }, [refreshed, settle])
  const [composing, setComposing] = useState(false)
  const loginFailed = useLoginFailure()
  const toast = useToast()
  const signed = account.status === 'signed'
  const moves = useMoves({ onMoved: add, onSignedOut: expire })
  const [filters, setFilters] = useState(defaultFilters)
  const items = state.status === 'ready' ? state.items : undefined
  const columns = useMemo(() => columnsOf((items ?? []).map((item) => ({ ...item, status: moves.placed[item.id] ?? item.status })), filters), [items, filters, moves.placed])

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
    <SitePage title="Sugestões" actions={account.status === 'unavailable' ? undefined : <Account account={account} onLeave={leave} />}>
      <section aria-labelledby="sugestoes-title">
        <PageHeader id="sugestoes-title" eyebrow="Sugestões" title="O que você quer ver na Enchase?" lead="Sugira um componente ou uma melhoria, vote no que já foi pedido e acompanhe o andamento de cada ideia. Tudo fica registrado no GitHub." />

        <HowItWorks />

        <div className={styles.band}>
          <Container maxWidth="full" className={styles.board}>
          <VisuallyHidden>
            <h2>Quadro de sugestões</h2>
          </VisuallyHidden>
          {loginFailed && (
            <Alert variant="error" title="Não foi possível entrar com o GitHub">
              Nada foi alterado na sua conta. Tente entrar de novo.
            </Alert>
          )}
          {state.status === 'loading' && <Loading />}
          {state.status === 'error' && <Failure limited={state.limited} onRetry={reload} />}
          {items && (
            <VotingContext.Provider value={voting}>
              {items.length > 0 && <Toolbar filters={filters} total={totalOf(columns)} onFiltersChange={setFilters} onSuggest={account.status === 'unavailable' ? undefined : suggest} />}
              {items.length === 0 && <Empty onSuggest={account.status === 'unavailable' ? undefined : suggest} />}
              <Board columns={columns} canMove={account.status === 'signed' && account.canMove} onMove={moves.request} />
            </VotingContext.Provider>
          )}
          <LoginDialog request={asking} onClose={dismiss} />
          <MoveDialog request={moves.asking} onConfirm={moves.confirm} onClose={moves.cancel} />
          <VotingContext.Provider value={voting}>
            <SuggestionPanel id={account.status === 'unavailable' ? null : openId} suggestion={items?.find(({ id }) => id === openId)} account={account} onClose={close} onCommented={add} onSignedOut={expire} />
          </VotingContext.Provider>
          <SuggestDialog isOpen={composing} items={items ?? []} onClose={() => setComposing(false)} onSent={sent} onSignedOut={expire} />
          </Container>
        </div>
      </section>
    </SitePage>
  )
}

export default Sugestoes
