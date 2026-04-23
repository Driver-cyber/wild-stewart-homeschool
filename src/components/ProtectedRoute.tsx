import { Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  const isLearnPath = location.pathname.startsWith('/learn')

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLearnPath ? 'bg-learner-bg font-rounded' : 'bg-adult-bg font-sans'}`}>
        <div className={isLearnPath ? 'text-learner-muted text-xl' : 'text-adult-muted'}>
          Loading…
        </div>
      </div>
    )
  }

  if (!session) {
    if (isLearnPath) {
      return (
        <div className="min-h-screen bg-learner-bg font-rounded flex flex-col items-center justify-center p-8 text-center">
          <div className="text-8xl mb-6">🔒</div>
          <h1 className="font-display text-3xl font-black text-learner-ink mb-3">
            Time to check in!
          </h1>
          <p className="text-learner-muted text-lg font-semibold mb-8">
            Ask a grown-up to sign in.
          </p>
          <Link
            to="/login"
            state={{ from: location.pathname }}
            className="bg-learner-accent text-white font-bold text-lg px-8 py-4 rounded-2xl"
          >
            Sign in →
          </Link>
        </div>
      )
    }
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
