export const defaultOrientation = 'vertical'

export const topics = [
  { value: 'news', label: 'Product news' },
  { value: 'offers', label: 'Offers and discounts' },
  { value: 'events', label: 'Events near me' }
]

export const topicsWithLockedEvents = topics.map((topic) => (topic.value === 'events' ? { ...topic, disabled: true } : topic))
