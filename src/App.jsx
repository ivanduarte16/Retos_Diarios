import React, { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import BottomNav from './components/BottomNav'
import Onboarding, { hasSeenOnboarding } from './components/Onboarding'
import PageTransition from './components/ui/PageTransition'
import FloatingParticles from './components/ui/FloatingParticles'
import PageLoader from './components/ui/PageLoader'

// Code splitting: lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const HistorialPage = lazy(() => import('./pages/HistorialPage'))
const AnadirRetoPage = lazy(() => import('./pages/AnadirRetoPage'))
const PerfilPage = lazy(() => import('./pages/PerfilPage'))

function ProtectedRoute() {
  const { currentUser } = useAuth()
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />
}

function AnimatedOutlet() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  )
}

function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-cream md:bg-cream-dark">
      <FloatingParticles />
      <div className="hidden md:block w-72 h-full flex-shrink-0 bg-surface shadow-paper-lg z-10">
        <div className="p-8 pb-4">
          <div className="text-3xl mb-2 font-display">RD</div>
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Retos Diarios</h1>
          <p className="font-body text-ink/40 text-xs">Para ti y para mi</p>
        </div>
        <div className="mt-8 px-4">
          <BottomNav isSidebar />
        </div>
      </div>

      <div className="flex-1 h-full relative flex justify-center overflow-hidden">
        <div className="w-full max-w-lg h-full bg-cream relative flex flex-col shadow-2xl md:rounded-3xl md:my-10 md:h-[calc(100%-5rem)] md:border border-cream-dark overflow-hidden transition-all">
          <main className="flex-1 overflow-y-auto pb-20 md:pb-6 md:px-6">
            <div className="max-w-md mx-auto h-full"><AnimatedOutlet /></div>
          </main>
          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding())

  return (
    <>
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="historial" element={<HistorialPage />} />
              <Route path="anadir" element={<AnadirRetoPage />} />
              <Route path="perfil" element={<PerfilPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
