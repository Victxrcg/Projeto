import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import AppContent from './components/App.jsx'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </StrictMode>,
)
