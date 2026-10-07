import { Navigate } from 'react-router-dom'

import ComponentsDemo from '@pages/componentsDemo/index.tsx'
import GettingStarted from '@pages/gettingStarted/index.tsx'
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
      ['/getting-started', <GettingStarted />],
      ['/components', <ComponentsDemo />],
    ],
  },
]

export default routes