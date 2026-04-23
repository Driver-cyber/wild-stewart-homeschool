import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LibraryPage from './LibraryPage'
import WeekPage from './WeekPage'
import ProfilesPage from './ProfilesPage'

export default function AppShell() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-adult-bg font-sans">
      <nav className="bg-white border-b border-adult-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-display text-xl font-black text-adult-ink tracking-tight">
          wild stewart homeschool
        </h1>
        <div className="flex items-center gap-6">
          {[
            { to: '/app/week',     label: 'This Week' },
            { to: '/app/library',  label: 'Library'   },
            { to: '/app/profiles', label: 'Profiles'  },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-adult-accent' : 'text-adult-muted hover:text-adult-ink'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            onClick={signOut}
            className="text-sm text-adult-muted hover:text-adult-ink transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Routes>
          <Route index element={<Navigate to="week" replace />} />
          <Route path="week"     element={<WeekPage />}     />
          <Route path="library"  element={<LibraryPage />}  />
          <Route path="profiles" element={<ProfilesPage />} />
        </Routes>
      </main>
    </div>
  )
}
