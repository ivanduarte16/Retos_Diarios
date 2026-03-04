import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import HistorialPage from './pages/HistorialPage'
import AnadirRetoPage from './pages/AnadirRetoPage'
import PerfilPage from './pages/PerfilPage'
import BottomNav from './components/BottomNav'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" replace />
}

function AppLayout({ children }) {
  return (
    <div className="flex h-screen w-full bg-cream md:bg-cream-dark">
      {/* Desktop/Tablet Sidebar nav */}
      <div className="hidden md:block w-72 h-full flex-shrink-0 bg-surface shadow-paper-lg z-10">
        <div className="p-8 pb-4">
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Retos Diarios</h1>
          <p className="font-body text-ink/40 text-xs">Para ti y para mí</p>
        </div>
        <div className="mt-8 px-4">
          <BottomNav isSidebar />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full relative flex justify-center overflow-hidden">
        {/* Mobile wrapper (max-w-md restricts width on desktop so it looks like a phone app in the center) */}
        <div className="w-full max-w-lg h-full bg-cream relative flex flex-col shadow-2xl md:rounded-3xl md:my-10 md:h-[calc(100%-5rem)] md:border border-cream-dark overflow-hidden transition-all">
          <main className="flex-1 overflow-y-auto pb-20 md:pb-6 md:px-6">
            <div className="max-w-md mx-auto h-full">
              {children}
            </div>
          </main>
          {/* Mobile bottom nav */}
          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout><HomePage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/historial" element={
            <ProtectedRoute>
              <AppLayout><HistorialPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/anadir" element={
            <ProtectedRoute>
              <AppLayout><AnadirRetoPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <AppLayout><PerfilPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
