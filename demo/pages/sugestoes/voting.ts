import { createContext, useContext } from 'react'

import type { Voting } from './types.ts'

export const noVoting: Voting = { mode: 'off', voted: [], deltas: {}, pending: [], onVote: () => undefined }

export const VotingContext = createContext<Voting>(noVoting)

export const useVoting = () => useContext(VotingContext)
