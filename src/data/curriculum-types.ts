// Shape of Joelle's structured Reading & Spelling curriculum.
// Mirrors reference/curriculum-inbox/curriculum-data.js so a near-verbatim
// copy compiles. Field names match the prototype so personalize.js can be
// ported with minimal renames.

export interface CurriculumActivity {
  kind: string
  name: string
  body: string
}

export interface CurriculumReading {
  focus: string
  title: string
  summary: string
  words: string[]
  sightWords?: string[]
  sentence: string
  activity: CurriculumActivity
  song: string
  prereqs: string[]
  mistakes: string[]
  check: string
}

export interface CurriculumSpelling {
  focus: string
  pattern: string
  words: string[]
  sightWords: string[]
  sentence: string
  activity: CurriculumActivity
  mistakes: string[]
  check: string
}

export interface CurriculumWeek {
  week: number
  unit: string
  reading: CurriculumReading
  spelling: CurriculumSpelling
}

export type CurriculumKind = 'reading' | 'spelling'
