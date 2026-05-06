import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Lesson, LessonState, Profile } from '../../lib/types'
import { LESSON_STATE_COLORS, LESSON_STATE_LABELS, latestStateByKey } from '../../lib/types'
import { useAuth } from '../../contexts/AuthContext'
import { MATH_CURRICULUM } from '../../data/math-curriculum'
import type { MathWeek, MathKind, MathConcept, MathPractice } from '../../data/math-curriculum-types'
import { mathLessonRow } from '../../lib/math-curriculum-mapping'
import { lessonSnapshot } from '../../lib/snapshot'
import StatusCircle from '../../components/StatusCircle'
import CurriculumNav from '../../components/CurriculumNav'

// Math curriculum is one subject (math) split into two pedagogical tracks:
// Concept (introduce the idea) and Practice (drill it). First-draft hypothesis.
const TRACK_ACCENT: Record<MathKind, { fg: string; soft: string; label: string }> = {
  concept:  { fg: '#E8970A', soft: '#FAEBC8', label: 'Concept'  },
  practice: { fg: '#B05A2A', soft: '#F4DDC8', label: 'Practice' },
}

const STATES: LessonState[] = ['todo', 'progress', 'review', 'mastered']

interface CellLesson {
  lesson: Lesson
  state: LessonState
}

export default function MathCurriculumPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [stateByLessonId, setStateByLessonId] = useState<Map<string, LessonState>>(new Map())
  const [seeding, setSeeding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openCell, setOpenCell] = useState<{ week: number; kind: MathKind } | null>(null)

  useEffect(() => { void boot() }, [])

  async function boot() {
    const [{ data: pData }, { data: lData }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('lessons').select('*').in('track', ['math:concept', 'math:practice']).order('week_number'),
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
    const rows = MATH_CURRICULUM.flatMap(week => [
      mathLessonRow(week, 'concept', user.id),
      mathLessonRow(week, 'practice', user.id),
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

  function cellFor(week: number, kind: MathKind): CellLesson | null {
    const trackKey: 'math:concept' | 'math:practice' = kind === 'concept' ? 'math:concept' : 'math:practice'
    const lesson = byKey.get(`${trackKey}:${week}`)
    if (!lesson) return null
    return { lesson, state: stateByLessonId.get(lesson.id) ?? 'todo' }
  }

  const unitGroups = useMemo(() => {
    const groups: { unit: string; weeks: MathWeek[] }[] = []
    for (const w of MATH_CURRICULUM) {
      const last = groups[groups.length - 1]
      if (last && last.unit === w.unit) last.weeks.push(w)
      else groups.push({ unit: w.unit, weeks: [w] })
    }
    return groups
  }, [])

  if (loading) return <p className="text-adult-muted">Loading curriculum…</p>

  return (
    <div>
      <CurriculumNav />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-3xl font-black text-adult-ink tracking-tight">
            Math Curriculum
          </h2>
          <p className="text-adult-muted mt-1">
            32-week kindergarten math. Concept introduces the idea; Practice drills it. Tap a cell for the lesson detail.
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
              {seeding ? 'Seeding…' : 'Seed 32-week math curriculum'}
            </button>
          )}
        </div>
      </div>

      {!seeded ? (
        <div className="bg-white border border-adult-border rounded-2xl p-12 text-center">
          <p className="text-adult-muted text-lg font-medium mb-2">Math curriculum not yet seeded.</p>
          <p className="text-adult-muted text-sm">
            Click <strong>Seed 32-week math curriculum</strong> to insert all 64 math lessons (32 weeks × Concept + Practice)
            into your library. Idempotent — runs once per household. First-draft content; reshape after Joelle uses it.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-adult-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_1fr] border-b border-adult-border bg-adult-bg/40 sticky top-[60px] z-[1]">
            <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-adult-muted">Week</div>
            <div className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: TRACK_ACCENT.concept.fg }}>
              {TRACK_ACCENT.concept.label}
            </div>
            <div className="px-5 py-3 text-xs font-bold uppercase tracking-wider border-l border-adult-border" style={{ color: TRACK_ACCENT.practice.fg }}>
              {TRACK_ACCENT.practice.label}
            </div>
          </div>

          {unitGroups.map(group => (
            <div key={group.unit}>
              <div className="px-5 py-2 bg-adult-bg/30 border-b border-adult-border text-xs font-bold uppercase tracking-widest text-adult-muted">
                Unit · {group.unit}
              </div>
              {group.weeks.map(weekData => {
                const concept = cellFor(weekData.week, 'concept')
                const practice = cellFor(weekData.week, 'practice')
                const openConcept = openCell?.week === weekData.week && openCell.kind === 'concept'
                const openPractice = openCell?.week === weekData.week && openCell.kind === 'practice'
                const open = openConcept || openPractice
                return (
                  <div key={weekData.week} className="border-b border-adult-border/60 last:border-b-0">
                    <div className="grid grid-cols-[80px_1fr_1fr] items-stretch min-h-[88px]">
                      <div className="px-4 py-4 flex flex-col justify-center">
                        <div className="font-display text-2xl font-black text-adult-ink leading-none">{weekData.week}</div>
                        <div className="text-[10px] uppercase tracking-wider text-adult-muted mt-1 italic">Week</div>
                      </div>
                      {concept ? (
                        <CellButton
                          lesson={concept.lesson}
                          state={concept.state}
                          accent={TRACK_ACCENT.concept.fg}
                          accentSoft={TRACK_ACCENT.concept.soft}
                          weekData={weekData}
                          kind="concept"
                          onCycle={next => setLessonState(concept.lesson, next)}
                          onToggle={() => setOpenCell(openConcept ? null : { week: weekData.week, kind: 'concept' })}
                          isOpen={openConcept}
                        />
                      ) : <div />}
                      {practice ? (
                        <CellButton
                          lesson={practice.lesson}
                          state={practice.state}
                          accent={TRACK_ACCENT.practice.fg}
                          accentSoft={TRACK_ACCENT.practice.soft}
                          weekData={weekData}
                          kind="practice"
                          onCycle={next => setLessonState(practice.lesson, next)}
                          onToggle={() => setOpenCell(openPractice ? null : { week: weekData.week, kind: 'practice' })}
                          isOpen={openPractice}
                        />
                      ) : <div />}
                    </div>
                    {open && (
                      <div className="border-t border-adult-border bg-adult-bg/30 p-6">
                        {openConcept && concept && (
                          <DetailPanel
                            state={concept.state}
                            kind="concept"
                            weekData={weekData}
                            onSetState={next => setLessonState(concept.lesson, next)}
                          />
                        )}
                        {openPractice && practice && (
                          <DetailPanel
                            state={practice.state}
                            kind="practice"
                            weekData={weekData}
                            onSetState={next => setLessonState(practice.lesson, next)}
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
  state, accent, accentSoft, weekData, kind, onCycle, onToggle, isOpen,
}: {
  lesson: Lesson
  state: LessonState
  accent: string
  accentSoft: string
  weekData: MathWeek
  kind: MathKind
  onCycle: (next: LessonState) => void
  onToggle: () => void
  isOpen: boolean
}) {
  const data: MathConcept | MathPractice = kind === 'concept' ? weekData.concept : weekData.practice
  const examples = kind === 'concept'
    ? (weekData.concept.examples ?? []).slice(0, 3)
    : (weekData.practice.problems ?? []).slice(0, 3)
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative text-left px-5 py-4 hover:bg-white transition-colors flex items-start gap-3 ${kind === 'practice' ? 'border-l border-adult-border' : ''} ${isOpen ? 'bg-white' : ''}`}
      style={{ boxShadow: isOpen ? `inset 4px 0 0 ${accent}` : undefined }}
    >
      <div className="pt-0.5">
        <StatusCircle state={state} size={22} onChange={next => onCycle(next)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: accent }}>
          {data.focus}
        </div>
        <div className="font-display text-lg font-bold text-adult-ink leading-snug">
          {kind === 'concept' ? weekData.concept.title : `${weekData.practice.focus}`}
        </div>
        {kind === 'concept' && weekData.concept.summary && (
          <div className="text-xs text-adult-muted mt-0.5 italic line-clamp-1">{weekData.concept.summary}</div>
        )}
        {kind === 'practice' && (
          <div className="text-xs text-adult-muted mt-0.5 italic">
            drill: {weekData.practice.drillType}
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {examples.map((w, i) => (
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
  state, kind, weekData, onSetState,
}: {
  state: LessonState
  kind: MathKind
  weekData: MathWeek
  onSetState: (s: LessonState) => void
}) {
  const accent = TRACK_ACCENT[kind].fg
  const isConcept = kind === 'concept'
  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-6">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: accent }}>
          {TRACK_ACCENT[kind].label} · Week {weekData.week} · {isConcept ? weekData.concept.focus : weekData.practice.focus}
        </div>
        <h3 className="font-display text-3xl font-black text-adult-ink leading-tight mb-2">
          {isConcept ? weekData.concept.title : weekData.practice.focus}
        </h3>
        <p className="font-display italic text-adult-muted text-lg leading-snug mb-4">
          {isConcept ? weekData.concept.summary : weekData.practice.bigIdea}
        </p>

        {!isConcept && (
          <div className="bg-white border border-adult-border rounded-xl p-4 mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Drill type</div>
            <p className="text-adult-ink text-sm">{weekData.practice.drillType}</p>
          </div>
        )}

        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-2">
            {isConcept ? 'Examples' : 'Problems'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(isConcept ? weekData.concept.examples : weekData.practice.problems).map((w, i) => (
              <span key={i} className="font-mono text-sm px-2 py-1 rounded bg-white border border-adult-border text-adult-ink">{w}</span>
            ))}
          </div>
        </div>

        {isConcept && weekData.concept.manipulatives.length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-2">Manipulatives</div>
            <div className="flex flex-wrap gap-1.5">
              {weekData.concept.manipulatives.map((m, i) => (
                <span
                  key={i}
                  className="text-sm px-2.5 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: TRACK_ACCENT.concept.soft, color: accent }}
                >{m}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 pl-4 py-2" style={{ borderLeft: `2px solid ${accent}` }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">
            {isConcept ? 'Big idea' : 'Goal of the drill'}
          </div>
          <p className="font-display italic text-2xl text-adult-ink leading-snug">
            {isConcept ? weekData.concept.bigIdea : weekData.practice.bigIdea}
          </p>
        </div>

        <div className="bg-white border border-adult-border rounded-xl p-4 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">
            {(isConcept ? weekData.concept.activity.kind : weekData.practice.activity.kind)} ·{' '}
            {(isConcept ? weekData.concept.activity.name : weekData.practice.activity.name)}
          </div>
          <p className="text-adult-ink text-sm leading-relaxed">
            {isConcept ? weekData.concept.activity.body : weekData.practice.activity.body}
          </p>
        </div>

        {isConcept && weekData.concept.song && (
          <div className="bg-white border border-adult-border rounded-xl p-4 mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Song / chant</div>
            <p className="text-adult-ink text-sm leading-relaxed">{weekData.concept.song}</p>
          </div>
        )}

        {isConcept && weekData.concept.prereqs.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Prerequisites</div>
            <ul className="text-sm text-adult-ink list-disc pl-5 space-y-0.5">
              {weekData.concept.prereqs.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        )}

        <div className="mb-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Common mistakes</div>
          <ul className="text-sm text-adult-ink list-disc pl-5 space-y-0.5">
            {(isConcept ? weekData.concept.mistakes : weekData.practice.mistakes).map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>

        <div className="bg-white border border-adult-border rounded-xl p-4 mb-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Quick check</div>
          <p className="text-adult-ink text-sm leading-relaxed">
            {isConcept ? weekData.concept.check : weekData.practice.check}
          </p>
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

      <aside className="bg-white border border-adult-border rounded-xl p-5 self-start">
        {isConcept ? <ConceptTeacherPanel weekData={weekData} accent={accent} /> : <PracticeTeacherPanel weekData={weekData} accent={accent} />}
      </aside>
    </div>
  )
}

function ConceptTeacherPanel({ weekData, accent }: { weekData: MathWeek; accent: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>How to teach the concept</div>
      <ol className="text-sm text-adult-ink space-y-2 list-decimal pl-5 mb-4">
        <li><strong>Show before tell.</strong> Use the manipulative first. Build the example with your hands.</li>
        <li><strong>Name it.</strong> Say the big idea once, simply. Repeat it during the activity.</li>
        <li><strong>Hand it off.</strong> Lyle does the next example with you watching, not leading.</li>
        <li><strong>Check.</strong> Ask the quick-check question; if he hesitates, do one more together.</li>
      </ol>
      <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Manipulatives ready</div>
      <ul className="text-sm text-adult-ink list-disc pl-5 space-y-0.5 mb-4">
        {weekData.concept.manipulatives.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
      <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">If stuck</div>
      <ul className="text-sm text-adult-ink list-disc pl-5 space-y-0.5">
        <li>Drop to a smaller number; rebuild from there.</li>
        <li>Switch manipulative — sometimes a new one breaks a stuck idea.</li>
        <li>Step back, model the example yourself, hand it back.</li>
      </ul>
    </div>
  )
}

function PracticeTeacherPanel({ weekData, accent }: { weekData: MathWeek; accent: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>How to run practice</div>
      <ol className="text-sm text-adult-ink space-y-2 list-decimal pl-5 mb-4">
        <li><strong>Warm up.</strong> Two easy problems first to build confidence.</li>
        <li><strong>Set a goal.</strong> "Five in a row" or "all of these in 60 seconds" — a clear finish.</li>
        <li><strong>Run the drill.</strong> Quick reps. Don't over-explain mid-drill.</li>
        <li><strong>Celebrate completion.</strong> Practice is about reps; finishing the goal is the win.</li>
      </ol>
      <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">Today's problem set</div>
      <div className="font-mono text-sm mb-4 text-adult-ink">{weekData.practice.problems.join(' · ')}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-adult-muted mb-1">If stuck</div>
      <ul className="text-sm text-adult-ink list-disc pl-5 space-y-0.5">
        <li>Slow down. Practice is reps, not speed.</li>
        <li>Pull the matching manipulative back out for one problem; then put it away.</li>
        <li>If 3+ in a row are wrong, stop. Re-teach the concept tomorrow.</li>
      </ul>
    </div>
  )
}
