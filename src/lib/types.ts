export interface SpaceshipConfig {
  hull: 'round' | 'classic' | 'angular'
  color: string
  engine: 'single' | 'double' | 'plasma'
  decal: 'none' | 'star' | 'lightning' | 'heart' | 'flame' | 'moon'
}

export interface Profile {
  id: string
  user_id: string
  name: string
  color: string
  avatar_emoji: string
  spaceship_config: SpaceshipConfig | null
  created_at: string
}

export const SHIP_COLORS: { value: string; label: string }[] = [
  { value: '#FF6B6B', label: 'Coral' },
  { value: '#FFA94D', label: 'Orange' },
  { value: '#FFD43B', label: 'Sunshine' },
  { value: '#51CF66', label: 'Lime' },
  { value: '#4DC4D9', label: 'Teal' },
  { value: '#4DABF7', label: 'Sky' },
  { value: '#B197FC', label: 'Lavender' },
  { value: '#FF87C2', label: 'Pink' },
]

export const DEFAULT_SHIP: SpaceshipConfig = {
  hull: 'classic',
  color: '#4DABF7',
  engine: 'single',
  decal: 'star',
}

export interface QuizQuestion {
  type: 'multiple_choice' | 'word_order'
  question: string
  options?: string[]
  answer_index?: number
  sentence?: string
}

export type LessonState = 'todo' | 'progress' | 'review' | 'mastered'

export type CurriculumTrack = 'reading' | 'spelling' | 'phonics' | null

export interface CurriculumContent {
  focus?: string
  skill?: string
  summary?: string
  spellingRule?: string
  exampleWords?: string[]
  sightWords?: string[]
  sentence?: string
  activity?: { title: string; body: string }
  song?: { title: string; body: string }
  prerequisites?: string[]
  commonMistakes?: string[]
  quickCheck?: string
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
  is_offline: boolean
  week_number: number | null
  track: CurriculumTrack
  content: CurriculumContent | null
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
  assignment_id: string | null
  profile_id: string
  state: LessonState
  lesson_snapshot: CurriculumContent | null
  completed_at: string
}

export interface SightWord {
  id: string
  user_id: string
  word: string
  tier: 'pre_primer' | 'primer' | 'kindergarten' | 'high_frequency'
  created_at: string
}

export interface SightWordStateRow {
  id: string
  user_id: string
  profile_id: string
  word: string
  state: LessonState
  created_at: string
}

export const LESSON_STATE_LABELS: Record<LessonState, string> = {
  todo: 'To do',
  progress: 'In progress',
  review: 'Needs review',
  mastered: 'Mastered',
}

export const LESSON_STATE_COLORS: Record<LessonState, { fill: string; ring: string; ink: string }> = {
  todo:     { fill: 'transparent', ring: '#A8A095', ink: '#5C5448' },
  progress: { fill: '#F2E3C2',     ring: '#C29347', ink: '#8B6A2A' },
  review:   { fill: 'transparent', ring: '#C56A4E', ink: '#C56A4E' },
  mastered: { fill: '#5A8C6B',     ring: '#5A8C6B', ink: '#FFFFFF' },
}

// Reduce an event log of state rows into the latest state per key.
// Pure helper used by both the assignment-state and sight-word-state queries.
export function latestStateByKey<T extends { created_at: string; state: LessonState }>(
  rows: T[],
  keyOf: (row: T) => string,
): Map<string, T> {
  const sorted = [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const out = new Map<string, T>()
  for (const r of sorted) {
    const k = keyOf(r)
    if (!out.has(k)) out.set(k, r)
  }
  return out
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
