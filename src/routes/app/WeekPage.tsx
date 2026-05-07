import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { Lesson, Profile, LessonState } from '../../lib/types'
import { SUBJECTS, subjectColor, latestStateByKey } from '../../lib/types'
import { useAuth } from '../../contexts/AuthContext'
import { toDateStr, getWeekMonday, addDays, formatShort } from '../../lib/dates'
import { lessonSnapshot } from '../../lib/snapshot'
import StatusCircle from '../../components/StatusCircle'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

interface AssignmentRow {
  id: string
  lesson_id: string
  scheduled_date: string
  lesson: Lesson
  state: LessonState
}

export default function WeekPage() {
  const { user } = useAuth()
  const [weekStart, setWeekStart] = useState(() => getWeekMonday(new Date()))
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [pickDay, setPickDay] = useState<string | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false)

  const weekDates = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))
  const weekEnd = weekDates[4]

  useEffect(() => {
    async function boot() {
      const [{ data: pData }, { data: lData }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at'),
        supabase.from('lessons').select('*').order('subject').order('title'),
      ])
      const p = (pData ?? []) as Profile[]
      setProfiles(p)
      setLessons((lData ?? []) as Lesson[])
      if (p.length > 0) setSelectedProfile(p[0])
      setProfilesLoading(false)
    }
    boot()
  }, [])

  const loadAssignments = useCallback(async () => {
    if (!selectedProfile) return
    const start = toDateStr(weekStart)
    const end = toDateStr(weekEnd)

    const { data: aData } = await supabase
      .from('assignments')
      .select('id, lesson_id, scheduled_date, lesson:lessons(*)')
      .eq('profile_id', selectedProfile.id)
      .gte('scheduled_date', start)
      .lte('scheduled_date', end)
      .order('created_at')

    if (!aData || aData.length === 0) { setAssignments([]); return }

    const ids = aData.map((a: { id: string }) => a.id)
    const { data: cData } = await supabase
      .from('completions')
      .select('assignment_id, state, created_at:completed_at')
      .eq('profile_id', selectedProfile.id)
      .in('assignment_id', ids)

    const events = (cData ?? []) as { assignment_id: string; state: LessonState; created_at: string }[]
    const latest = latestStateByKey(events, e => e.assignment_id)

    setAssignments(
      aData.map((a: { id: string; lesson_id: string; scheduled_date: string; lesson: Lesson }) => ({
        id: a.id,
        lesson_id: a.lesson_id,
        scheduled_date: a.scheduled_date,
        lesson: a.lesson,
        state: latest.get(a.id)?.state ?? 'todo',
      }))
    )
  }, [selectedProfile, weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadAssignments() }, [loadAssignments])

  async function cycleState(a: AssignmentRow, next: LessonState) {
    if (!user || !selectedProfile) return
    const snapshot = next === 'mastered' ? lessonSnapshot(a.lesson) : null
    setAssignments(prev => prev.map(x => x.id === a.id ? { ...x, state: next } : x))
    const { error } = await supabase.from('completions').insert({
      user_id: user.id,
      assignment_id: a.id,
      lesson_id: a.lesson.id,
      profile_id: selectedProfile.id,
      state: next,
      lesson_snapshot: snapshot,
    })
    if (error) loadAssignments() // revert via refetch on failure
  }

  async function assign(lessonId: string, date: string) {
    if (!user || !selectedProfile) return
    const { error } = await supabase.from('assignments').insert({
      user_id: user.id,
      lesson_id: lessonId,
      profile_id: selectedProfile.id,
      scheduled_date: date,
    })
    if (!error) { setPickDay(null); loadAssignments() }
  }

  async function unassign(id: string) {
    await supabase.from('assignments').delete().eq('id', id)
    setAssignments(prev => prev.filter(a => a.id !== id))
  }

  const forDay = (dateStr: string) =>
    assignments.filter(a => a.scheduled_date === dateStr)

  const today = toDateStr(new Date())
  const weekLabel = `${formatShort(weekStart)} – ${formatShort(weekEnd)}, ${weekStart.getFullYear()}`
  const totalDone = assignments.filter(a => a.state === 'mastered').length

  if (profilesLoading) return <p className="text-adult-muted">Loading…</p>

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0 justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-black text-adult-ink tracking-tight">
            This Week
          </h2>
          <p className="text-adult-muted mt-1">
            {weekLabel}
            {assignments.length > 0 && (
              <span className="ml-2 text-adult-ink font-semibold">
                · {totalDone} of {assignments.length} done
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
          {profiles.length > 0 && (
            <select
              value={selectedProfile?.id ?? ''}
              onChange={e =>
                setSelectedProfile(profiles.find(p => p.id === e.target.value) ?? null)
              }
              className="px-3 py-2 rounded-lg border border-adult-border bg-white text-adult-ink text-sm font-medium focus:outline-none"
            >
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button
            onClick={() => setWeekStart(prev => addDays(prev, -7))}
            className="px-3 py-2 rounded-lg border border-adult-border text-adult-muted hover:text-adult-ink font-bold transition-colors"
          >←</button>
          <button
            onClick={() => setWeekStart(getWeekMonday(new Date()))}
            className="px-3 py-2 rounded-lg border border-adult-border text-sm font-semibold text-adult-muted hover:text-adult-ink transition-colors"
          >Today</button>
          <button
            onClick={() => setWeekStart(prev => addDays(prev, 7))}
            className="px-3 py-2 rounded-lg border border-adult-border text-adult-muted hover:text-adult-ink font-bold transition-colors"
          >→</button>
          <button
            onClick={() => setBulkOpen(true)}
            disabled={!selectedProfile}
            className="px-3 py-2 rounded-lg bg-adult-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            Bulk schedule
          </button>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white border border-adult-border rounded-2xl p-12 text-center">
          <p className="text-adult-muted text-lg font-medium mb-1">No learner profiles yet.</p>
          <p className="text-adult-muted text-sm">
            Go to <strong>Profiles</strong> to add Lyle.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="grid grid-cols-5 gap-3" style={{ minWidth: '560px' }}>
          {weekDates.map((date, i) => {
            const dateStr = toDateStr(date)
            const dayRows = forDay(dateStr)
            const isToday = dateStr === today

            return (
              <div
                key={dateStr}
                className={`bg-white border rounded-2xl p-4 flex flex-col gap-2 min-h-[240px] ${
                  isToday ? 'border-adult-accent' : 'border-adult-border'
                }`}
              >
                <div className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-adult-accent' : 'text-adult-muted'}`}>
                  {DAY_LABELS[i]}
                </div>
                <div className={`font-display text-2xl font-black leading-none mb-1 ${isToday ? 'text-adult-accent' : 'text-adult-ink'}`}>
                  {date.getDate()}
                </div>

                {dayRows.map(a => (
                  <div
                    key={a.id}
                    className="rounded-lg pl-2 pr-3 py-2 text-white text-sm relative group flex items-start gap-2"
                    style={{
                      backgroundColor: subjectColor(a.lesson.subject),
                      opacity: a.state === 'mastered' ? 0.65 : 1,
                    }}
                  >
                    <div className="pt-0.5">
                      <StatusCircle
                        state={a.state}
                        size={20}
                        onChange={next => cycleState(a, next)}
                      />
                    </div>
                    <div className="flex-1 font-semibold leading-tight pr-4 line-clamp-2">
                      {a.lesson.title}
                      {a.lesson.is_offline && (
                        <span className="ml-1 inline-block text-[10px] uppercase tracking-wider bg-white/25 rounded px-1 py-0.5 align-middle">offline</span>
                      )}
                    </div>
                    <button
                      onClick={() => unassign(a.id)}
                      className="absolute top-1.5 right-2 opacity-0 group-hover:opacity-100 text-white/60 hover:text-white transition-opacity text-xs"
                    >✕</button>
                  </div>
                ))}

                <button
                  onClick={() => setPickDay(dateStr)}
                  className="mt-auto text-xs text-adult-muted hover:text-adult-accent font-semibold py-1.5 border border-dashed border-adult-border hover:border-adult-accent rounded-lg transition-colors"
                >
                  + Add
                </button>
              </div>
            )
          })}
        </div>
        </div>
      )}

      {/* Lesson picker modal */}
      {pickDay !== null && (
        <div
          className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center p-4 z-50"
          onClick={e => { if (e.target === e.currentTarget) setPickDay(null) }}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col shadow-xl">
            <div className="p-5 border-b border-adult-border flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-adult-ink">
                Add to{' '}
                {new Date(pickDay + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric',
                })}
              </h3>
              <button
                onClick={() => setPickDay(null)}
                className="text-adult-muted hover:text-adult-ink text-xl leading-none"
              >✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-3">
              {lessons.length === 0 ? (
                <p className="text-adult-muted text-sm p-4 text-center">
                  No lessons in library yet. Add some first.
                </p>
              ) : (
                <div className="space-y-1">
                  {SUBJECTS.map(subject => {
                    const alreadyAssigned = new Set(pickDay ? forDay(pickDay).map(a => a.lesson_id) : [])
                    const group = lessons.filter(l =>
                      l.subject === subject.value
                      && !alreadyAssigned.has(l.id)
                      && !l.track // curriculum lessons go through bulk schedule
                    )
                    if (group.length === 0) return null
                    return (
                      <div key={subject.value}>
                        <div
                          className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
                          style={{ color: subject.color }}
                        >
                          {subject.label}
                        </div>
                        {group.map(lesson => (
                          <button
                            key={lesson.id}
                            onClick={() => assign(lesson.id, pickDay)}
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-adult-bg transition-colors flex items-center gap-3"
                          >
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: subjectColor(lesson.subject) }}
                            />
                            <div>
                              <div className="font-semibold text-adult-ink text-sm">
                                {lesson.title}
                              </div>
                              {lesson.description && (
                                <div className="text-xs text-adult-muted line-clamp-1 mt-0.5">
                                  {lesson.description}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {bulkOpen && selectedProfile && user && (
        <BulkScheduleModal
          userId={user.id}
          profile={selectedProfile}
          defaultMonday={weekStart}
          existingAssignments={assignments}
          onClose={() => setBulkOpen(false)}
          onScheduled={() => { setBulkOpen(false); loadAssignments() }}
        />
      )}
    </div>
  )
}

// ─── Bulk schedule modal ─────────────────────────────────────────────────────
// Writes Reading→Mon and Spelling→Wed for N weeks at a time, starting from the
// given Monday and curriculum week. Per Joelle's prototype cadence.

function BulkScheduleModal({
  userId, profile, defaultMonday, existingAssignments, onClose, onScheduled,
}: {
  userId: string
  profile: Profile
  defaultMonday: Date
  existingAssignments: AssignmentRow[]
  onClose: () => void
  onScheduled: () => void
}) {
  const [startMonday, setStartMonday] = useState(toDateStr(defaultMonday))
  // Default start week: first curriculum week not yet scheduled for this profile.
  const scheduledWeeks = new Set(
    existingAssignments
      .map(a => a.lesson.week_number)
      .filter((w): w is number => w != null),
  )
  const defaultStartWeek = (() => {
    for (let w = 1; w <= 32; w++) if (!scheduledWeeks.has(w)) return w
    return 1
  })()
  const [startWeek, setStartWeek] = useState(defaultStartWeek)
  const [runLength, setRunLength] = useState(4)
  const [curriculumLessons, setCurriculumLessons] = useState<Lesson[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCurriculum() {
      const { data } = await supabase
        .from('lessons')
        .select('*')
        .in('track', ['reading', 'spelling'])
        .order('week_number')
      setCurriculumLessons((data ?? []) as Lesson[])
    }
    void loadCurriculum()
  }, [])

  const endWeek = Math.min(startWeek + runLength - 1, 32)
  const planned = endWeek - startWeek + 1
  const readingCount = curriculumLessons.filter(l => l.track === 'reading' && l.week_number != null && l.week_number >= startWeek && l.week_number <= endWeek).length
  const spellingCount = curriculumLessons.filter(l => l.track === 'spelling' && l.week_number != null && l.week_number >= startWeek && l.week_number <= endWeek).length

  async function submit() {
    if (saving) return
    setError(null)
    setSaving(true)
    const monday = new Date(startMonday + 'T12:00:00')
    const rows: { user_id: string; profile_id: string; lesson_id: string; scheduled_date: string }[] = []
    for (let i = 0; i < planned; i++) {
      const weekN = startWeek + i
      const reading = curriculumLessons.find(l => l.track === 'reading' && l.week_number === weekN)
      const spelling = curriculumLessons.find(l => l.track === 'spelling' && l.week_number === weekN)
      const mondayN = addDays(monday, i * 7)
      const wednesdayN = addDays(mondayN, 2)
      if (reading) rows.push({
        user_id: userId,
        profile_id: profile.id,
        lesson_id: reading.id,
        scheduled_date: toDateStr(mondayN),
      })
      if (spelling) rows.push({
        user_id: userId,
        profile_id: profile.id,
        lesson_id: spelling.id,
        scheduled_date: toDateStr(wednesdayN),
      })
    }
    if (rows.length === 0) {
      setError('Nothing to schedule. Have you seeded the curriculum?')
      setSaving(false)
      return
    }
    const { error: e } = await supabase.from('assignments').insert(rows)
    if (e) {
      setError(e.message)
      setSaving(false)
      return
    }
    setSaving(false)
    onScheduled()
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center p-4 z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="p-5 border-b border-adult-border flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-adult-ink">
            Bulk schedule for {profile.name}
          </h3>
          <button onClick={onClose} className="text-adult-muted hover:text-adult-ink text-xl leading-none">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-adult-ink mb-1.5">Start Monday</label>
            <input
              type="date"
              value={startMonday}
              onChange={e => setStartMonday(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent"
            />
            <p className="text-xs text-adult-muted mt-1">Reading lands on this date; Spelling lands two days later.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-adult-ink mb-1.5">Start week</label>
              <input
                type="number"
                min={1}
                max={32}
                value={startWeek}
                onChange={e => setStartWeek(Math.max(1, Math.min(32, parseInt(e.target.value || '1', 10))))}
                className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent"
              />
              <p className="text-xs text-adult-muted mt-1">Curriculum week #</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-adult-ink mb-1.5">Run length</label>
              <input
                type="number"
                min={1}
                max={8}
                value={runLength}
                onChange={e => setRunLength(Math.max(1, Math.min(8, parseInt(e.target.value || '1', 10))))}
                className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent"
              />
              <p className="text-xs text-adult-muted mt-1">How many weeks to plan</p>
            </div>
          </div>

          <div className="bg-adult-bg/60 border border-adult-border rounded-xl p-3">
            <p className="text-sm text-adult-ink">
              This will schedule{' '}
              <strong>{readingCount} Reading</strong> {readingCount === 1 ? 'lesson on the Monday' : 'lessons on Mondays'}
              {' '}and{' '}
              <strong>{spellingCount} Spelling</strong> {spellingCount === 1 ? 'lesson on the Wednesday' : 'lessons on Wednesdays'}
              {' '}covering curriculum weeks <strong>{startWeek}–{endWeek}</strong>.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
        <div className="p-5 border-t border-adult-border flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-adult-muted hover:text-adult-ink transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving || readingCount + spellingCount === 0}
            className="bg-adult-accent text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? 'Scheduling…' : `Schedule ${readingCount + spellingCount} lessons`}
          </button>
        </div>
      </div>
    </div>
  )
}
