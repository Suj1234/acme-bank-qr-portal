import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage              from './pages/LoginPage'
import DashboardPage          from './pages/DashboardPage'
import ApplicationDetailPage  from './pages/ApplicationDetailPage'
import InitiateQR             from './pages/InitiateQR'
import SuccessPage            from './pages/SuccessPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function BranchOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'branch') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<RootRedirect />} />
          <Route path="/login"     element={<LoginPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />

          <Route path="/application/new" element={
            <BranchOnlyRoute><InitiateQR /></BranchOnlyRoute>
          } />

          <Route path="/application/:id" element={
            <ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>
          } />

          <Route path="/success" element={
            <ProtectedRoute><SuccessPage /></ProtectedRoute>
          } />

          {/* legacy redirect */}
          <Route path="/initiate-qr" element={<Navigate to="/application/new" replace />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
