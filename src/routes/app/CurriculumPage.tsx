import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Lesson, LessonState, Profile } from '../../lib/types'
import { LESSON_STATE_LABELS, LESSON_STATE_COLORS, latestStateByKey } from '../../lib/types'
import { useAuth } from '../../contexts/AuthContext'
import { CURRICULUM } from '../../data/curriculum'
import type { CurriculumWeek, CurriculumKind } from '../../data/curriculum-types'
import { curriculumLessonRow } from '../../lib/curriculum-mapping'
import { lessonSnapshot } from '../../lib/snapshot'
import StatusCircle from '../../components/StatusCircle'

// Joelle's prototype reconciliation: per-track subject colors.
const TRACK_ACCENT: Record<CurriculumKind, { fg: string; soft: string; label: string }> = {
  reading:  { fg: '#D94F4F', soft: '#FBE7E5', label: 'Reading' },
  spelling: { fg: '#2AADAD', soft: '#DEF2F1', label: 'Spelling' },
}

const STATES: LessonState[] = ['todo', 'progress', 'review', 'mastered']

interface CellLesson {
  lesson: Lesson
  state: LessonState
}

export default function CurriculumPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [stateByLessonId, setStateByLessonId] = useState<Map<string, LessonState>>(new Map())
  const [seeding, setSeeding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openCell, setOpenCell] = useState<{ week: number; kind: CurriculumKind } | null>(null)

  useEffect(() => { void boot() }, [])

  async function boot() {
    const [{ data: pData }, { data: lData }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('lessons').select('*').in('track', ['reading', 'spelling']).order('week_number'),
    ])
    const ps = (pData ?? []) as Profile[]
    setProfiles(ps)
    if (ps.length > 0) setProfile(ps[0])
    setLessons((lData ?? []) as Lesson[])
    setLoading(false)
  }

  useEffect(() => {
    if (!profile || lessons.length === 0) { setStateByLessonId(new Map()); return }
    void loadStates(profile.id)
  }, [profile, lessons])

  async function loadStates(profileId: string) {
    const ids = lessons.map(l => l.id)
    const { data } = await supabase
      .from('completions')
      .select('lesson_id, state, created_at:completed_at')
      .eq('profile_id', profileId)
      .in('lesson_id', ids)
    const events = (data ?? []) as { lesson_id: string; state: LessonState; created_at: string }[]
    const latest = latestStateByKey(events, e => e.lesson_id)
    const out = new Map<string, LessonState>()
    for (const [k, v] of latest) out.set(k, v.state)
    setStateByLessonId(out)
  }

  // Index lessons by (track, week_number) for cell lookup.
  const byKey = useMemo(() => {
    const m = new Map<string, Lesson>()
    for (const l of lessons) {
      if (l.track && l.week_number != null) m.set(`${l.track}:${l.week_number}`, l)
    }
    return m
  }, [lessons])

  const seeded = byKey.size > 0

  async function seedCurriculum() {
    if (!user || seeding || seeded) return
    setSeeding(true)
    const rows = CURRICULUM.flatMap(week => [
      curriculumLessonRow(week, 'reading', user.id),
      curriculumLessonRow(week, 'spelling', user.id),
    ])
    const { error } = await supabase.from('lessons').insert(rows)
    if (error) {
      alert(`Seed failed: ${error.message}`)
    } else {
      await boot()
    }
    setSeeding(false)
  }

  async function setLessonState(lesson: Lesson, next: LessonState) {
    if (!user || !profile) return
    setStateByLessonId(prev => {
      const m = new Map(prev)
      m.set(lesson.id, next)
      return m
    })
    const snapshot = next === 'mastered' ? lessonSnapshot(lesson) : null
    const { error } = await supabase.from('completions').insert({
      user_id: user.id,
      profile_id: profile.id,
      lesson_id: lesson.id,
      assignment_id: null,
      state: next,
      lesson_snapshot: snapshot,
    })
    if (error && profile) loadStates(profile.id)
  }

  function cellFor(week: number, kind: CurriculumKind): CellLesson | null {
    const lesson = byKey.get(`${kind}:${week}`)
    if (!lesson) return null
    return { lesson, state: stateByLessonId.get(lesson.id) ?? 'todo' }
  }

  // Group weeks by unit so we can render unit dividers.
  const unitGroups = useMemo(() => {
    const groups: { unit: string; weeks: CurriculumWeek[] }[] = []
    for (const w of CURRICULUM) {
      const last = groups[groups.length - 1]
      if (last && last.unit === w.unit) last.weeks.push(w)
      else groups.push({ unit: w.unit, weeks: [w] })
    }
    return groups
  }, [])

  if (loading) return <p className="text-adult-muted">Loading curriculum…</p>

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-3xl font-black text-adult-ink tracking-tight">
            Reading & Spelling Curriculum
          </h2>
          <p className="text-adult-muted mt-1">
            32-week structured-phonics scope and sequence. Tap a cell for the lesson detail.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {profiles.length > 0 && (
            <select
              value={profile?.id ?? ''}
              onChange={e => setProfile(profiles.find(p => p.id === e.target.value) ?? null)}
              className="px-3 py-2 rounded-lg border border-adult-border bg-white text-adult-ink text-sm font-medium focus:outline-none"
            >
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          {!seeded && (
            <button
              onClick={seedCurriculum}
              disabled={seeding}
              className="bg-adult-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {seeding ? 'Seeding…' : 'Seed 32-week curriculum'}
            </button>
          )}
        </div>
      </div>

      {!seeded ? (
        <div className="bg-white border border-adult-border rounded-2xl p-12 text-center">
          <p className="text-adult-muted text-lg font-medium mb-2">Curriculum not yet seeded.</p>
          <p className="text-adult-muted text-sm">
            Click <strong>Seed 32-week curriculum</strong> to insert all 64 lessons (32 weeks × Reading + Spelling)
            into your library. Idempotent — runs once per household.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-adult-border rounded-2xl overflow-hidden">
          {/* Track header */}
          <div className="grid grid-cols-[80px_1fr_1fr] border-b border-adult-border bg-adult-bg/40 sticky top-[60px] z-[1]">
            <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-adult-muted">Week</div>
            <div className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: TRACK_ACCENT.reading.fg }}>
              {TRACK_ACCENT.reading.label}
            </div>
            <div className="px-5 py-3 text-xs font-bold uppercase tracking-wider border-l border-adult-border" style={{ color: TRACK_ACCENT.spelling.fg }}>
              {TRACK_ACCENT.spelling.label}
            </div>
          </div>

          {unitGroups.map(group => (
            <div key={group.unit}>
              <div className="px-5 py-2 bg-adult-bg/30 border-b border-adult-border text-xs font-bold uppercase tracking-widest text-adult-muted">
                Unit · {group.unit}
              </div>
              {group.weeks.map(weekData => {
                const reading = cellFor(weekData.week, 'reading')
                const spelling = cellFor(weekData.week, 'spelling')
                const openReading = openCell?.week === weekData.week && openCell.kind === 'reading'
                const openSpelling = openCell?.week === weekData.week && openCell.kind === 'spelling'
                const open = openReading || openSpelling
                return (
                  <div key={weekData.week} className="border-b border-adult-border/60 last:border-b-0">
                    <div className="grid grid-cols-[80px_1fr_1fr] items-stretch min-h-[88px]">
                      <div className="px-4 py-4 flex flex-col justify-center">
                        <div className="font-display text-2xl font-black text-adult-ink leading-none">
                          {weekData.week}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-adult-muted mt-1 italic">
                          Week
                        </div>
                      </div>
                      {reading ? (
                        <CellButton
                          lesson={reading.lesson}
                          state={reading.state}
                          accent={TRACK_ACCENT.reading.fg}
                          accentSoft={TRACK_ACCENT.reading.soft}
                          weekData={weekData}
                          kind="reading"
                          onCycle={next => setLessonState(reading.lesson, next)}
                          onToggle={() => setOpenCell(openReading ? null : { week: weekData.week, kind: 'reading' })}
                          isOpen={openReading}
                        />
                      ) : <div />}
                      {spelling ? (
                        <CellButton
                          lesson={spelling.lesson}
                          state={spelling.state}
                          accent={TRACK_ACCENT.spelling.fg}
                          accentSoft={TRACK_ACCENT.spelling.soft}
                          weekData={weekData}
                          kind="spelling"
                          onCycle={next => setLessonState(spelling.lesson, next)}
                          onToggle={() => setOpenCell(openSpelling ? null : { week: weekData.week, kind: 'spelling' })}
                          isOpen={openSpelling}
                        />
                      ) : <div />}
                    </div>
                    {open && (
                      <div className="border-t border-adult-border bg-adult-bg/30 p-6">
                        {openReading && reading && (
                          <DetailPanel
                            lesson={reading.lesson}
                            state={reading.state}
                            kind="reading"
                            weekData={weekData}
                            onSetState={next => setLessonState(reading.lesson, next)}
                          />
                        )}
                        {openSpelling && spelling && (
                          <DetailPanel
                            lesson={spelling.lesson}
                            state={spelling.state}
                            kind="spelling"
                            weekData={weekData}
                            onSetState={next => setLessonState(spelling.lesson, next)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CellButton({
  lesson, state, accent, accentSoft, weekData, kind, onCycle, onToggle, isOpen,
}: {
  lesson: Lesson
  state: LessonState
  accent: string
  accentSoft: string
  weekData: CurriculumWeek
  kind: CurriculumKind
  onCycle: (next: LessonState) => void
  onToggle: () => void
  isOpen: boolean
}) {
  const data = kind === 'reading' ? weekData.reading : weekData.spelling
  const sightWords = kind === 'reading' ? weekData.reading.sightWords : weekData.spelling.sightWords
  const exampleWords = data.words.slice(0, 4)
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative text-left px-5 py-4 hover:bg-white transition-colors flex items-start gap-3 ${kind === 'spelling' ? 'border-l border-adult-border' : ''} ${isOpen ? 'bg-white' : ''}`}
      style={{ boxShadow: isOpen ? `inset 4px 0 0 ${accent}` : undefined }}
    >
      <div className="pt-0.5">
        <StatusCircle
          state={state}
          size={22}
          onChange={next => onCycle(next)}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: accent }}>
          {data.focus}
        </div>
        <div className="font-display text-lg font-bold text-adult-ink leading-snug">
          {kind === 'reading' ? weekData.reading.title : weekData.spelling.focus}
        </div>
        {kind === 'reading' && weekData.reading.summary && (
          <div className="text-xs text-adult-muted mt-0.5 italic line-clamp-1">
            {weekData.reading.summary}
          </div>
        )}
        {kind === 'spelling' && sightWords && sightWords.length > 0 && (
          <div className="text-xs text-adult-muted mt-0.5 italic">
            sight: {sightWords.join(', ')}
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {exampleWords.map((w, i) => (
            <span
              key={i}
              className="font-mono text-[11px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: accentSoft, color: accent }}
            >{w}</span>
          ))}
        </div>
      </div>
      <div className="text-adult-muted text-lg flex-shrink-0 self-center">
        {isOpen ? '▴' : '▸'}
      </div>
    </button>
  )
}

function DetailPanel({
  lesson, state, kind, weekData, onSetState,
}: {
  lesson: Lesson
  state: LessonState
  kind: CurriculumKind
  weekData: CurriculumWeek
  onSetState: (s: LessonState) => void
}) {
  const accent = kind === 'reading' ? TRACK_ACCENT.reading.fg : TRACK_ACCENT.spelling.fg
  const data = kind === 'reading' ? weekData.reading : weekData.spelling
  const isReading = kind === 'reading'

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-6">
      {/* Left: lesson detail */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: accent }}>
          {TRACK_ACCENT[kind].label} · Week {weekData.week} · {data.focus}
        </div>
        <h3 className="font-display text-3xl font-black text-adult-ink leading-tight mb-2">
          {isReading ? weekData.reading.title : weekData.spelling.focus}
        </h3>
        <p className="font-display italic text-adult-muted text-lg leading-snug mb-4">
          {isReading ? weekData.reading.summary : weekData.spelling.pattern}
        </p>

        {!isReading && (
          <div className="bg-white border border-adult-border rounded-xl p-4 mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Spelling rule</div>
            <p className="text-adult-ink text-sm">{weekData.spelling.pattern}</p>
          </div>
        )}

        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-2">
            Example words
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.words.map((w, i) => (
              <span
                key={i}
                className="font-mono text-sm px-2 py-1 rounded bg-white border border-adult-border text-adult-ink"
              >{w}</span>
            ))}
          </div>
        </div>

        {(isReading ? weekData.reading.sightWords : weekData.spelling.sightWords)?.length ? (
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-2">
              Sight words this week
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(isReading ? weekData.reading.sightWords! : weekData.spelling.sightWords).map((w, i) => (
                <span
                  key={i}
                  className="text-sm px-2.5 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: TRACK_ACCENT[kind].soft, color: accent }}
                >{w}</span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mb-4 pl-4 py-2" style={{ borderLeft: `2px solid ${accent}` }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">
            Practice sentence
          </div>
          <p className="font-display italic text-2xl text-adult-ink leading-snug">
            {data.sentence}
          </p>
        </div>

        <div className="bg-white border border-adult-border rounded-xl p-4 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">
            {data.activity.kind} · {data.activity.name}
          </div>
          <p className="text-adult-ink text-sm leading-relaxed">{data.activity.body}</p>
        </div>

        {isReading && weekData.reading.song && (
          <div className="bg-white border border-adult-border rounded-xl p-4 mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">
              Song / chant
            </div>
            <p className="text-adult-ink text-sm leading-relaxed">{weekData.reading.song}</p>
          </div>
        )}

        {isReading && weekData.reading.prereqs.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Prerequisites</div>
            <ul className="text-sm text-adult-ink list-disc pl-5 space-y-0.5">
              {weekData.reading.prereqs.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        )}

        <div className="mb-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Common mistakes</div>
          <ul className="text-sm text-adult-ink list-disc pl-5 space-y-0.5">
            {data.mistakes.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>

        <div className="bg-white border border-adult-border rounded-xl p-4 mb-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Quick check</div>
          <p className="text-adult-ink text-sm leading-relaxed">{data.check}</p>
        </div>

        <div className="border-t border-adult-border pt-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-2">Status</div>
          <div className="flex flex-wrap gap-2">
            {STATES.map(s => {
              const colors = LESSON_STATE_COLORS[s]
              const active = state === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSetState(s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${active ? 'shadow-sm' : 'opacity-70 hover:opacity-100'}`}
                  style={{
                    backgroundColor: active ? colors.fill !== 'transparent' ? colors.fill : '#fff' : '#fff',
                    border: `1.5px solid ${colors.ring}`,
                    color: active ? (colors.fill !== 'transparent' ? colors.ink : colors.ring) : colors.ring,
                  }}
                >
                  {LESSON_STATE_LABELS[s]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right: how to teach (spelling) or related (reading) */}
      <aside className="bg-white border border-adult-border rounded-xl p-5 self-start">
        {!isReading ? (
          <SpellingTeacherPanel weekData={weekData} accent={accent} />
        ) : (
          <ReadingTeacherPanel weekData={weekData} accent={accent} />
        )}
      </aside>
    </div>
  )
}

function SpellingTeacherPanel({ weekData, accent }: { weekData: CurriculumWeek; accent: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>How to teach spelling</div>
      <ol className="text-sm text-adult-ink space-y-2 list-decimal pl-5 mb-4">
        <li><strong>Say slowly.</strong> Stretch the word out — "shhhh-i-p."</li>
        <li><strong>Tap the sounds.</strong> One finger per phoneme.</li>
        <li><strong>Match each sound to letters.</strong> Multiple letters can be one sound (sh, ch, th).</li>
        <li><strong>Read it back.</strong> Blend the letters back to confirm.</li>
      </ol>
      <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Spelling list</div>
      <div className="font-mono text-sm mb-4 text-adult-ink">{weekData.spelling.words.join(' · ')}</div>
      {weekData.spelling.sightWords.length > 0 && (
        <>
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Sight word tips</div>
          <p className="text-sm text-adult-ink leading-relaxed mb-3">
            For sight words, tap the regular sounds and mark the "heart part" — the bit you have to remember by heart.
            E.g., for "the", tap /th/ + /uh/ and circle the "e" as the heart letter.
          </p>
        </>
      )}
      <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">If stuck</div>
      <ul className="text-sm text-adult-ink list-disc pl-5 space-y-0.5">
        <li>Drop to writing letter-by-letter from a model.</li>
        <li>Trace in the air, then on paper.</li>
        <li>Use letter tiles before pencil.</li>
      </ul>
    </div>
  )
}

function ReadingTeacherPanel({ weekData, accent }: { weekData: CurriculumWeek; accent: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>How to teach decoding</div>
      <ol className="text-sm text-adult-ink space-y-2 list-decimal pl-5 mb-4">
        <li><strong>Introduce the focus sound.</strong> Say it together a few times.</li>
        <li><strong>Show two example words.</strong> Slide a finger under the letters as you blend.</li>
        <li><strong>Hand it off.</strong> Lyle reads the rest of the example list.</li>
        <li><strong>Read the practice sentence.</strong> Out loud, slowly, then naturally.</li>
      </ol>
      <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Practice list</div>
      <div className="font-mono text-sm mb-4 text-adult-ink">{weekData.reading.words.join(' · ')}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">If stuck</div>
      <ul className="text-sm text-adult-ink list-disc pl-5 space-y-0.5">
        <li>Cover all but the focus sound, sound it alone, then build out.</li>
        <li>Drop to letter-by-letter blending.</li>
        <li>Move to a known word first, then return.</li>
      </ul>
    </div>
  )
}
