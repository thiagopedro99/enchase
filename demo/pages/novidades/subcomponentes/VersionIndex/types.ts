import type { ReleaseNote } from '../../types.ts'

export interface VersionIndexProps {
  releases: ReleaseNote[]
  activeId: string | undefined
  onlyBehavior: boolean
  onOnlyBehaviorChange: (onlyBehavior: boolean) => void
}
