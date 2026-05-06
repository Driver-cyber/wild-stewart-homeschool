import type { Lesson, CurriculumContent } from './types'

// What gets frozen onto a completion row at mastery time.
// Captures the lesson as Lyle (or Joelle) saw it when the state event fired,
// so later edits to the lesson don't retroactively change history.
export interface LessonSnapshot {
  lesson_id: string
  title: string
  subject: Lesson['subject']
  description: string | null
  track: Lesson['track']
  week_number: number | null
  content: CurriculumContent | null
  taken_at: string
}

export function lessonSnapshot(lesson: Lesson, adapted?: CurriculumContent | null): LessonSnapshot {
  return {
    lesson_id: lesson.id,
    title: lesson.title,
    subject: lesson.subject,
    description: lesson.description,
    track: lesson.track,
    week_number: lesson.week_number,
    content: adapted ?? lesson.content,
    taken_at: new Date().toISOString(),
  }
}
