import { BrowserRouter, Routes, Route } from 'react-router-dom'

import routesPaths from '@routes/routes.tsx'

const Router = () => {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default Router