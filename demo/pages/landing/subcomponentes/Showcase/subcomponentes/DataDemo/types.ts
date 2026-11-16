export interface Project {
  id: string
  name: string
  status: 'live' | 'review' | 'late'
  progress: number
  owner: string
}
