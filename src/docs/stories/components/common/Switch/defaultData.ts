export const settings = [
  { id: 'email', label: 'Email alerts', hint: 'One summary a day, no spam.', checked: true },
  { id: 'push', label: 'Mobile notifications', hint: 'Only for what needs a reply.', checked: false },
  { id: 'reports', label: 'Weekly report', hint: 'Arrives every Monday morning.', checked: true }
] as const
