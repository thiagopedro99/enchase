export interface VoteButtonProps {
  title: string
  votes: number
  voted: boolean
  signed: boolean
  pending: boolean
  onVote: () => void
}
