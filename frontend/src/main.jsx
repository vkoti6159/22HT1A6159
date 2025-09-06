import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import ShortenerPage from './pages/ShortenerPage'
import StatsPage from './pages/StatsPage'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <ShortenerPage /> },
    { path: 'stats', element: <StatsPage /> },
  ]}
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
