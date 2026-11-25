import { ThumbsUpIcon } from '../../../../components/icons.tsx'
import styles from './styles.module.css'

import type { VoteButtonProps } from './types.ts'

const count = (votes: number) => `${votes} ${votes === 1 ? 'voto' : 'votos'}`

const VoteButton = ({ title, votes, voted, signed, pending, onVote }: VoteButtonProps) => (
  <button
    type="button"
    className={styles.vote}
    aria-label={`${voted ? 'Tirar o voto de' : 'Votar em'} ${title}, ${count(votes)}`}
    {...(signed ? { 'aria-pressed': voted } : { 'aria-haspopup': 'dialog' })}
    {...(pending ? { 'aria-busy': true } : {})}
    onClick={onVote}
  >
    <ThumbsUpIcon size={14} />
    {votes}
  </button>
)

export default VoteButton
