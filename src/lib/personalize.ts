// Personalization layer — rewrites lesson sight words and practice sentences
// based on which sight words a learner has marked Mastered.
//
// Ported near-verbatim from reference/curriculum-inbox/personalize.js (Joelle's
// design). The function is **pure**: no Supabase, no React, no globals. Callers
// resolve the masteredSet from a profile_id-scoped query and pass it in.
//
// Key invariants (per HANDOFF.md):
//   1. Deterministic by (week, kind) — same lesson always picks the same swap.
//   2. Tier-aware substitution — prefer the original lesson's median tier.
//   3. Phonics target words (`words` array) are NEVER substituted.
//      Only `sightWords` and tokens in `sentence` matching known sight words.
//   4. Preserves capitalization of replaced tokens in the sentence.

import { SIGHT_WORDS } from '../data/sight-words'
import type { CurriculumWeek, CurriculumKind, CurriculumReading, CurriculumSpelling } from '../data/curriculum-types'

interface SwEntry {
  word: string
  tier: number   // index into SIGHT_WORDS
  idx: number    // position within tier
}

const ALL_SW: SwEntry[] = SIGHT_WORDS.flatMap((g, gi) =>
  g.words.map((w, wi) => ({ word: w, tier: gi, idx: wi })),
)

const TIER_OF: Record<string, number> = (() => {
  const m: Record<string, number> = {}
  for (const e of ALL_SW) m[e.word.toLowerCase()] = e.tier
  return m
})()

export function isSightWord(w: string): boolean {
  return Object.prototype.hasOwnProperty.call(TIER_OF, w.toLowerCase())
}

// FNV-1a-ish 32-bit hash. Stable across renders so the same (week, kind)
// always produces the same replacement choices.
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

interface PickArgs {
  originalWords: string[]
  mastered: Set<string>
  exclude: string[]
  count: number
  seed: number
}

function pickReplacements({ originalWords, mastered, exclude, count, seed }: PickArgs): string[] {
  const used = new Set<string>()
  for (const w of exclude) used.add(w.toLowerCase())
  for (const w of originalWords) used.add(w.toLowerCase())

  const candidates = ALL_SW.filter(({ word }) => {
    const w = word.toLowerCase()
    return !mastered.has(w) && !used.has(w)
  })
  if (candidates.length === 0) return []

  const origTiers = originalWords
    .map(w => TIER_OF[w.toLowerCase()])
    .filter((t): t is number => t !== undefined)
  const targetTier = origTiers.length
    ? Math.round(origTiers.reduce((a, b) => a + b, 0) / origTiers.length)
    : 0

  candidates.sort((a, b) => {
    const da = Math.abs(a.tier - targetTier)
    const db = Math.abs(b.tier - targetTier)
    if (da !== db) return da - db
    return a.idx - b.idx
  })

  const closestDist = Math.abs(candidates[0].tier - targetTier)
  const closest = candidates.filter(c => Math.abs(c.tier - targetTier) === closestDist)
  const rest    = candidates.filter(c => Math.abs(c.tier - targetTier) !== closestDist)
  const offset = closest.length > 0 ? seed % closest.length : 0
  const rotated = closest.slice(offset).concat(closest.slice(0, offset))
  return rotated.concat(rest).slice(0, count).map(c => c.word)
}

function rewriteSentence(
  sentence: string | undefined,
  mastered: Set<string>,
  subMap: Record<string, string>,
): string | undefined {
  if (!sentence) return sentence
  return sentence.replace(/([A-Za-z']+)/g, (match) => {
    const lower = match.toLowerCase()
    if (!mastered.has(lower)) return match
    const sub = subMap[lower]
    if (!sub) return match
    if (match[0] === match[0].toUpperCase()) {
      return sub[0].toUpperCase() + sub.slice(1)
    }
    return sub
  })
}

export interface PersonalizationTrace {
  original: {
    sightWords: string[]
    sentence: string
  }
  swaps: Record<string, string> // mastered_lowercase -> replacement
}

export type PersonalizableLesson<T extends CurriculumReading | CurriculumSpelling> = T & {
  _personalized?: PersonalizationTrace
}

export function personalizeLesson<T extends CurriculumReading | CurriculumSpelling>(
  lesson: T,
  mastered: Set<string>,
  week: number,
  kind: CurriculumKind,
): PersonalizableLesson<T> {
  const original = lesson.sightWords ?? []
  if (original.length === 0 && !lesson.sentence) return lesson

  const masteredHere = original.filter(w => mastered.has(w.toLowerCase()))
  if (masteredHere.length === 0) return lesson

  const kept = original.filter(w => !mastered.has(w.toLowerCase()))
  const needed = original.length - kept.length
  const replacements = pickReplacements({
    originalWords: original,
    mastered,
    exclude: kept,
    count: needed,
    seed: hash(`${week}_${kind}`),
  })

  const subMap: Record<string, string> = {}
  masteredHere.forEach((w, i) => {
    if (replacements[i]) subMap[w.toLowerCase()] = replacements[i]
  })

  const newSightWords = original.map(w => subMap[w.toLowerCase()] ?? w)
  const newSentence = rewriteSentence(lesson.sentence, mastered, subMap) ?? lesson.sentence

  return {
    ...lesson,
    sightWords: newSightWords,
    sentence: newSentence,
    _personalized: {
      original: { sightWords: original, sentence: lesson.sentence },
      swaps: subMap,
    },
  } as PersonalizableLesson<T>
}

export function personalizeEntry(entry: CurriculumWeek, mastered: Set<string>): CurriculumWeek & {
  reading: PersonalizableLesson<CurriculumReading>
  spelling: PersonalizableLesson<CurriculumSpelling>
} {
  const reading = personalizeLesson(entry.reading, mastered, entry.week, 'reading')
  const spelling = personalizeLesson(entry.spelling, mastered, entry.week, 'spelling')
  // Reference-equality short-circuit: if neither track was adapted, return the
  // entry unchanged so downstream memoization can dedupe by reference. Matches
  // the JS original's behavior.
  if (reading === entry.reading && spelling === entry.spelling) {
    return entry as CurriculumWeek & {
      reading: PersonalizableLesson<CurriculumReading>
      spelling: PersonalizableLesson<CurriculumSpelling>
    }
  }
  return { ...entry, reading, spelling }
}
