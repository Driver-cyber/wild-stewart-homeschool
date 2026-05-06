import type { CurriculumWeek, CurriculumKind } from '../data/curriculum-types'
import type { CurriculumContent, Lesson } from './types'

// Convert a CurriculumWeek + kind into the row we insert into lessons.
// Subject is fixed: reading-track lessons → 'reading'; spelling-track → 'writing'.
export function curriculumLessonRow(
  week: CurriculumWeek,
  kind: CurriculumKind,
  userId: string,
): {
  user_id: string
  title: string
  subject: Lesson['subject']
  description: string
  lesson_type: 'general'
  is_offline: boolean
  week_number: number
  track: CurriculumKind
  content: CurriculumContent
} {
  if (kind === 'reading') {
    const r = week.reading
    return {
      user_id: userId,
      title: r.title,
      subject: 'reading',
      description: r.summary,
      lesson_type: 'general',
      is_offline: false,
      week_number: week.week,
      track: 'reading',
      content: {
        focus: r.focus,
        skill: r.focus,
        summary: r.summary,
        exampleWords: r.words,
        sightWords: r.sightWords ?? [],
        sentence: r.sentence,
        activity: { title: `${r.activity.kind}: ${r.activity.name}`, body: r.activity.body },
        song: { title: 'Song / chant', body: r.song },
        prerequisites: r.prereqs,
        commonMistakes: r.mistakes,
        quickCheck: r.check,
      },
    }
  }
  const s = week.spelling
  return {
    user_id: userId,
    title: s.focus,
    subject: 'writing',
    description: s.pattern,
    lesson_type: 'general',
    is_offline: false,
    week_number: week.week,
    track: 'spelling',
    content: {
      focus: s.focus,
      skill: s.focus,
      summary: s.pattern,
      spellingRule: s.pattern,
      exampleWords: s.words,
      sightWords: s.sightWords,
      sentence: s.sentence,
      activity: { title: `${s.activity.kind}: ${s.activity.name}`, body: s.activity.body },
      prerequisites: [],
      commonMistakes: s.mistakes,
      quickCheck: s.check,
    },
  }
}
