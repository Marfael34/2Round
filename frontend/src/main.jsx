import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRouter from './router/AppRouter'
import { ConfirmProvider } from './contexts/ConfirmContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfirmProvider>
      <AppRouter />
    </ConfirmProvider>
  </StrictMode>,
)
