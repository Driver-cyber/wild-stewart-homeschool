import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './routes/LoginPage'
import WelcomePage from './routes/WelcomePage'
import AppShell from './routes/app/AppShell'
import LearnShell from './routes/learn/LearnShell'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route
          path="/app/*"
          element={<ProtectedRoute><AppShell /></ProtectedRoute>}
        />
        <Route
          path="/learn/*"
          element={<ProtectedRoute><LearnShell /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </AuthProvider>
  )
}
