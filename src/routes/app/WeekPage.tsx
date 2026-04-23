import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { Lesson, Profile } from '../../lib/types'
import { SUBJECTS, subjectColor } from '../../lib/types'
import { useAuth } from '../../contexts/AuthContext'
import { toDateStr, getWeekMonday, addDays, formatShort } from '../../lib/dates'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

interface AssignmentRow {
  id: string
  lesson_id: string
  scheduled_date: string
  lesson: Lesson
  completed: boolean
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
      .select('assignment_id')
      .in('assignment_id', ids)

    const doneSet = new Set((cData ?? []).map((c: { assignment_id: string }) => c.assignment_id))

    setAssignments(
      aData.map((a: { id: string; lesson_id: string; scheduled_date: string; lesson: Lesson }) => ({
        id: a.id,
        lesson_id: a.lesson_id,
        scheduled_date: a.scheduled_date,
        lesson: a.lesson,
        completed: doneSet.has(a.id),
      }))
    )
  }, [selectedProfile, weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadAssignments() }, [loadAssignments])

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

  if (profilesLoading) return <p className="text-adult-muted">Loading…</p>

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-black text-adult-ink tracking-tight">
            This Week
          </h2>
          <p className="text-adult-muted mt-1">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {profiles.length > 1 && (
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
        <div className="grid grid-cols-5 gap-3">
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
                    className="rounded-lg px-3 py-2 text-white text-sm relative group"
                    style={{ backgroundColor: subjectColor(a.lesson.subject) }}
                  >
                    <div className="font-semibold leading-tight pr-4 line-clamp-2">
                      {a.lesson.title}
                    </div>
                    {a.completed && (
                      <div className="text-xs opacity-80 mt-0.5">✓ Done</div>
                    )}
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
                    const group = lessons.filter(l => l.subject === subject.value && !alreadyAssigned.has(l.id))
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
    </div>
  )
}
