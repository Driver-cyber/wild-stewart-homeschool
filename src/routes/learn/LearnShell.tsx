import { Routes, Route } from 'react-router-dom'
import ProfilePickerPage from './ProfilePickerPage'
import WeekViewPage from './WeekViewPage'
import LessonPage from './LessonPage'

export default function LearnShell() {
  return (
    <Routes>
      <Route index element={<ProfilePickerPage />} />
      <Route path=":profileId" element={<WeekViewPage />} />
      <Route path=":profileId/:assignmentId" element={<LessonPage />} />
    </Routes>
  )
}
