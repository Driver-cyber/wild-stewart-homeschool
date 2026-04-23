import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Lesson, Profile } from '../../lib/types'
import { SUBJECTS, subjectColor } from '../../lib/types'
import { toDateStr, getWeekMonday, addDays } from '../../lib/dates'

interface AssignmentRow {
  id: string
  scheduled_date: string
  lesson: Lesson
  completed: boolean
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function WeekViewPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(true)

  const weekStart = getWeekMonday(new Date())
  const weekDates = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))
  const today = toDateStr(new Date())

  useEffect(() => {
    if (!profileId) return
    async function load() {
      const [{ data: pData }, { data: aData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', profileId!).single(),
        supabase
          .from('assignments')
          .select('id, scheduled_date, lesson:lessons(*)')
          .eq('profile_id', profileId!)
          .gte('scheduled_date', toDateStr(weekDates[0]))
          .lte('scheduled_date', toDateStr(weekDates[4]))
          .order('created_at'),
      ])

      setProfile(pData as Profile)

      if (aData && aData.length > 0) {
        const ids = (aData as { id: string }[]).map(a => a.id)
        const { data: cData } = await supabase
          .from('completions')
          .select('assignment_id')
          .in('assignment_id', ids)
        const done = new Set(
          (cData ?? []).map((c: { assignment_id: string }) => c.assignment_id)
        )
        setAssignments(
          (aData as { id: string; scheduled_date: string; lesson: Lesson }[]).map(a => ({
            id: a.id,
            scheduled_date: a.scheduled_date,
            lesson: a.lesson,
            completed: done.has(a.id),
          }))
        )
      }

      setLoading(false)
    }
    load()
  }, [profileId]) // eslint-disable-line react-hooks/exhaustive-deps

  const forDay = (dateStr: string) =>
    assignments.filter(a => a.scheduled_date === dateStr)

  const totalDone = assignments.filter(a => a.completed).length

  if (loading) {
    return (
      <div className="min-h-screen bg-learner-bg flex items-center justify-center font-rounded">
        <div className="text-learner-muted text-xl">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-learner-bg font-rounded pb-12">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/learn')}
          className="text-learner-muted hover:text-learner-ink text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
        >
          ←
        </button>
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-2xl shadow-sm flex-shrink-0"
          style={{ backgroundColor: profile?.color ?? '#E8970A' }}
        >
          {profile?.avatar_emoji}
        </div>
        <div>
          <h1 className="font-display text-2xl font-black text-learner-ink leading-tight">
            {profile?.name}'s Week
          </h1>
          {assignments.length > 0 && (
            <p className="text-learner-muted text-sm font-semibold">
              {totalDone} of {assignments.length} done
            </p>
          )}
        </div>
      </div>

      {/* Day sections */}
      <div className="px-4 mt-2 space-y-7">
        {weekDates.map((date, i) => {
          const dateStr = toDateStr(date)
          const dayRows = forDay(dateStr)
          if (dayRows.length === 0) return null

          const isToday = dateStr === today
          return (
            <div key={dateStr}>
              <div className="flex items-baseline gap-2 mb-3 px-1">
                <h2
                  className={`text-base font-bold ${
                    isToday ? 'text-subject-math' : 'text-learner-muted'
                  }`}
                >
                  {isToday ? 'Today' : DAY_NAMES[i]}
                </h2>
                <span className="text-learner-muted text-sm font-medium">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {dayRows.map(a => {
                  const subj = SUBJECTS.find(s => s.value === a.lesson.subject)
                  return (
                    <button
                      key={a.id}
                      onClick={() => navigate(`/learn/${profileId}/${a.id}`)}
                      className="relative rounded-3xl p-5 text-left shadow-sm active:scale-95 transition-transform min-h-[100px] flex flex-col justify-between"
                      style={{ backgroundColor: subjectColor(a.lesson.subject) }}
                    >
                      {a.completed && (
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white text-lg font-bold">
                          ✓
                        </div>
                      )}
                      <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2">
                        {subj?.label}
                      </div>
                      <div className="text-white font-bold text-base leading-snug pr-8">
                        {a.lesson.title}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {assignments.length === 0 && (
          <div className="text-center py-24">
            <p className="text-learner-muted text-2xl font-bold">No lessons this week!</p>
            <p className="text-learner-muted mt-2">Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
