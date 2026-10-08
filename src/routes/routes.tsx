import { Navigate } from 'react-router-dom'

import NotFound from '@pages/notFound/index.tsx'
import Home from '@pages/home/index.tsx'

const routes = [
  {
    path: '/',
    privateRoute: false,
    routes: [
      ['*', <Navigate to="/not-found" replace />],
      ['/not-found', <NotFound />],
      ['', <Home />],
    ],
  },
]

export default routes