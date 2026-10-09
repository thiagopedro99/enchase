import { Routes, Route } from 'react-router-dom'

import routesPaths from '@routes/routes.tsx'

const Router = () => {
  return (
    <Routes>
      {routesPaths.map(({ path, routes }) =>
        routes.map(([itemPath, element]) => (
          <Route
            key={path + itemPath}
            path={path + itemPath}
            element={element}
          />
        ))
      )}
    </Routes>
  )
}

export default Router
