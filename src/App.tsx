import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { WheelPage } from './pages/public/WheelPage'
import { AuthProvider } from './features/auth/AuthProvider'
import { ProtectedAdmin } from './features/auth/ProtectedAdmin'
import { reconcilePendingSpins } from './services/api'

const LoginPage = lazy(() => import('./pages/admin/LoginPage').then((module) => ({ default: module.LoginPage })))
const AdminLayout = lazy(() => import('./layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const PrizesPage = lazy(() => import('./pages/admin/PrizesPage').then((module) => ({ default: module.PrizesPage })))
const AppearancePage = lazy(() => import('./pages/admin/AppearancePage').then((module) => ({ default: module.AppearancePage })))
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const HistoryPage = lazy(() => import('./pages/admin/HistoryPage').then((module) => ({ default: module.HistoryPage })))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })

function OfflineReconciler() {
  useEffect(() => {
    const reconcile = async () => {
      const result = await reconcilePendingSpins()
      if (result.synced > 0) toast.success(`${result.synced} giro(s) offline sincronizado(s).`)
      if (result.conflicts > 0) toast.warning('Há giros offline que precisam de conferência.')
    }
    window.addEventListener('online', reconcile)
    if (navigator.onLine) void reconcile()
    return () => window.removeEventListener('online', reconcile)
  }, [])
  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <OfflineReconciler />
          <Suspense fallback={<main className="admin-loading"><div className="spinner" /><p>Carregando…</p></main>}>
          <Routes>
            <Route path="/" element={<WheelPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route element={<ProtectedAdmin />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="premios" element={<PrizesPage />} />
                <Route path="aparencia" element={<AppearancePage />} />
                <Route path="configuracoes" element={<SettingsPage />} />
                <Route path="historico" element={<HistoryPage />} />
              </Route>
            </Route>
            <Route path="*" element={<WheelPage />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  )
}

export default App
