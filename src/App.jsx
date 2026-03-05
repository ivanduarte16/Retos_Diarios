import React, { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import BottomNav from './components/BottomNav'
import Onboarding, { hasSeenOnboarding } from './components/Onboarding'
import SplashScreen from './components/SplashScreen'
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
    <div className="relative min-h-screen w-full bg-background">
      <FloatingParticles />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px]">
        <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-primary/10 bg-surface/80 backdrop-blur-xl">
          <div className="px-8 pb-4 pt-10">
            <p className="font-display text-3xl text-primary mb-1">RD</p>
            <h1 className="font-display text-2xl font-bold text-ink mb-1">Retos Diarios</h1>
            <p className="font-body text-ink/50 text-xs">Para ti y para mi</p>
          </div>
          <div className="mt-8 px-4">
            <BottomNav isSidebar />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 justify-center px-0 md:px-8 md:py-8">
          <div className="relative flex w-full flex-col md:max-w-2xl md:rounded-[28px] md:border md:border-primary/15 md:bg-surface/75 md:shadow-paper-lg md:backdrop-blur-sm">
            <main className="relative flex-1 overflow-y-auto px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6 md:px-8 md:pb-8 md:pt-8">
              <div className="mx-auto w-full max-w-2xl">
                <AnimatedOutlet />
              </div>
            </main>
            <div className="md:hidden">
              <BottomNav />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding())
  const [showSplash, setShowSplash] = useState(() => {
    try { return !sessionStorage.getItem('retos_splash_seen') } catch { return false }
  })

  function handleSplashDone() {
    setShowSplash(false)
    try { sessionStorage.setItem('retos_splash_seen', '1') } catch {}
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={handleSplashDone} />}
      </AnimatePresence>
      {!showSplash && showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
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
