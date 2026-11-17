export interface Deploy {
  id: string
  name: string
  branch: string
  status: 'live' | 'building' | 'failed'
  author: string
}
