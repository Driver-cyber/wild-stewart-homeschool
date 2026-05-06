// Math curriculum content shapes. Mirrors the structure of curriculum-types.ts
// (Reading & Spelling) but with math-shaped fields.
//
// The two-track split is **Concept + Practice** — introduce the new idea on the
// concept track, drill it on the practice track. This is a first-draft hypothesis
// based on Joelle's reading/spelling pattern; the right cut may change once she
// uses it for a real week.

export interface MathActivity {
  kind: string
  name: string
  body: string
}

export interface MathConcept {
  focus: string             // short skill label, e.g. "Counting to 5"
  title: string             // human-friendly title for the lesson
  summary: string           // what the new idea is, in plain words
  manipulatives: string[]   // suggested concrete tools (fingers, ten-frame, etc.)
  examples: string[]        // worked examples or representations
  bigIdea: string           // the "I can …" or "what to remember" sentence
  activity: MathActivity
  song?: string             // optional chant / song
  prereqs: string[]
  mistakes: string[]
  check: string             // what tells you the child has it
}

export interface MathPractice {
  focus: string             // short skill label
  drillType: string         // what kind of practice (flashcards, number-line, etc.)
  problems: string[]        // sample problems / prompts
  bigIdea: string           // single-line goal of the drill
  activity: MathActivity
  mistakes: string[]
  check: string
}

export interface MathWeek {
  week: number
  unit: string
  concept: MathConcept
  practice: MathPractice
}

export type MathKind = 'concept' | 'practice'
