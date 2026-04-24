export interface Profile {
  id: string
  user_id: string
  name: string
  color: string
  avatar_emoji: string
  created_at: string
}

export interface QuizQuestion {
  type: 'multiple_choice' | 'word_order'
  question: string
  options?: string[]
  answer_index?: number
  sentence?: string
}

export interface Lesson {
  id: string
  user_id: string
  title: string
  subject: Subject
  description: string | null
  resource_url: string | null
  resource_url_2: string | null
  pdf_path: string | null
  content_image_path: string | null
  quiz_questions: QuizQuestion[] | null
  lesson_type: 'general'
  created_at: string
}

export interface Assignment {
  id: string
  user_id: string
  lesson_id: string
  profile_id: string
  scheduled_date: string
  created_at: string
}

export interface Completion {
  id: string
  user_id: string
  assignment_id: string
  profile_id: string
  completed_at: string
}

export type Subject = 'reading' | 'writing' | 'math' | 'science' | 'social_studies'

export const SUBJECTS: { value: Subject; label: string; color: string }[] = [
  { value: 'reading',        label: 'Reading',       color: '#D94F4F' },
  { value: 'writing',        label: 'Writing',       color: '#2AADAD' },
  { value: 'math',           label: 'Math',          color: '#E8970A' },
  { value: 'science',        label: 'Science',       color: '#3E9E3E' },
  { value: 'social_studies', label: 'Social Studies', color: '#7B4FCC' },
]

export function subjectColor(s: Subject): string {
  return SUBJECTS.find(x => x.value === s)?.color ?? '#888'
}

export function subjectLabel(s: Subject): string {
  return SUBJECTS.find(x => x.value === s)?.label ?? s
}
