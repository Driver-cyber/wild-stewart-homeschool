import type { MathWeek, MathKind } from '../data/math-curriculum-types'
import type { CurriculumContent, Lesson } from './types'

// Convert a MathWeek + kind into the row we insert into the lessons table.
// Subject is fixed: 'math'. Track is 'math:concept' or 'math:practice' so the
// math curriculum view can filter cleanly without colliding with reading/spelling.
//
// CurriculumContent (originally shaped for Reading/Spelling) reuses fields:
//   exampleWords ← examples / problems
//   sightWords ← manipulatives (concept) or drill kind (practice)
//   sentence ← bigIdea
//   spellingRule ← drill type label (practice only)
// Field names rendered in the math UI are remapped; the DB layer stays generic.
export function mathLessonRow(
  week: MathWeek,
  kind: MathKind,
  userId: string,
): {
  user_id: string
  title: string
  subject: Lesson['subject']
  description: string
  lesson_type: 'general'
  is_offline: boolean
  week_number: number
  track: 'math:concept' | 'math:practice'
  content: CurriculumContent
} {
  if (kind === 'concept') {
    const c = week.concept
    return {
      user_id: userId,
      title: c.title,
      subject: 'math',
      description: c.summary,
      lesson_type: 'general',
      is_offline: false,
      week_number: week.week,
      track: 'math:concept',
      content: {
        focus: c.focus,
        skill: c.focus,
        summary: c.summary,
        exampleWords: c.examples,
        sightWords: c.manipulatives,
        sentence: c.bigIdea,
        activity: { title: `${c.activity.kind}: ${c.activity.name}`, body: c.activity.body },
        song: c.song ? { title: 'Song / chant', body: c.song } : undefined,
        prerequisites: c.prereqs,
        commonMistakes: c.mistakes,
        quickCheck: c.check,
      },
    }
  }
  const p = week.practice
  return {
    user_id: userId,
    title: `${p.focus} (practice)`,
    subject: 'math',
    description: p.bigIdea,
    lesson_type: 'general',
    is_offline: false,
    week_number: week.week,
    track: 'math:practice',
    content: {
      focus: p.focus,
      skill: p.focus,
      summary: p.bigIdea,
      spellingRule: p.drillType,
      exampleWords: p.problems,
      sightWords: [],
      sentence: p.bigIdea,
      activity: { title: `${p.activity.kind}: ${p.activity.name}`, body: p.activity.body },
      prerequisites: [],
      commonMistakes: p.mistakes,
      quickCheck: p.check,
    },
  }
}
