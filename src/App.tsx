import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './routes/app/AppShell'
import LearnShell from './routes/learn/LearnShell'

export default function App() {
  return (
    <Routes>
      <Route path="/app/*" element={<AppShell />} />
      <Route path="/learn/*" element={<LearnShell />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
