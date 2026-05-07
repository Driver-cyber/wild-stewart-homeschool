import type { Lesson, CurriculumContent, QuizQuestion } from './types'

// What gets frozen onto a completion row at mastery time.
// Captures the lesson as Lyle (or Joelle) saw it when the state event fired,
// so later edits to the lesson don't retroactively change history.
//
// Includes every field that affects what was rendered: title, description,
// resource URLs, file paths, quiz questions, and personalized content.
export interface LessonSnapshot {
  lesson_id: string
  title: string
  subject: Lesson['subject']
  description: string | null
  resource_url: string | null
  resource_url_2: string | null
  pdf_path: string | null
  content_image_path: string | null
  quiz_questions: QuizQuestion[] | null
  is_offline: boolean
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
    resource_url: lesson.resource_url,
    resource_url_2: lesson.resource_url_2,
    pdf_path: lesson.pdf_path,
    content_image_path: lesson.content_image_path,
    quiz_questions: lesson.quiz_questions,
    is_offline: lesson.is_offline,
    track: lesson.track,
    week_number: lesson.week_number,
    content: adapted ?? lesson.content,
    taken_at: new Date().toISOString(),
  }
}
