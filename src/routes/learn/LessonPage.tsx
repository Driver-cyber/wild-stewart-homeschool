import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Lesson, Profile } from '../../lib/types'
import { SUBJECTS, subjectColor } from '../../lib/types'
import { useAuth } from '../../contexts/AuthContext'

interface AssignmentFull {
  id: string
  profile_id: string
  lesson: Lesson
  profile: Profile
}

export default function LessonPage() {
  const { profileId, assignmentId } = useParams<{ profileId: string; assignmentId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [assignment, setAssignment] = useState<AssignmentFull | null>(null)
  const [completed, setCompleted] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!assignmentId || !profileId) return
    async function load() {
      const { data } = await supabase
        .from('assignments')
        .select('id, profile_id, lesson:lessons(*), profile:profiles(*)')
        .eq('id', assignmentId!)
        .eq('profile_id', profileId!)
        .single()

      if (data) {
        setAssignment(data as unknown as AssignmentFull)
        const { data: comp } = await supabase
          .from('completions')
          .select('id')
          .eq('assignment_id', assignmentId!)
          .eq('profile_id', profileId!)
          .maybeSingle()
        setCompleted(!!comp)
      }
      setLoading(false)
    }
    load()
  }, [assignmentId, profileId])

  async function markDone() {
    if (!user || !assignment || completed) return
    const { error } = await supabase.from('completions').insert({
      user_id: user.id,
      assignment_id: assignment.id,
      profile_id: assignment.profile_id,
    })
    if (!error) {
      setCompleted(true)
      setCelebrating(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-learner-bg flex items-center justify-center font-rounded">
        <div className="text-learner-muted text-xl">Loading…</div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-learner-bg flex items-center justify-center font-rounded">
        <div className="text-learner-muted text-xl">Lesson not found.</div>
      </div>
    )
  }

  const color = subjectColor(assignment.lesson.subject)
  const subjectName = SUBJECTS.find(s => s.value === assignment.lesson.subject)?.label ?? ''

  if (celebrating) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center font-rounded text-white p-8 text-center"
        style={{ backgroundColor: color }}
      >
        <div className="text-9xl mb-6 animate-bounce">⭐</div>
        <h1 className="font-display text-5xl font-black mb-4">
          Amazing, {assignment.profile.name}!
        </h1>
        <p className="text-2xl font-semibold opacity-80 mb-14">
          You finished {assignment.lesson.title}!
        </p>
        <button
          onClick={() => navigate(`/learn/${profileId}`)}
          className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-bold text-xl px-10 py-5 rounded-2xl transition-colors active:scale-95"
        >
          Back to my week →
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-learner-bg font-rounded">
      {/* Color header band */}
      <div className="text-white px-6 pt-8 pb-12" style={{ backgroundColor: color }}>
        <button
          onClick={() => navigate(`/learn/${profileId}`)}
          className="text-white/70 hover:text-white text-3xl mb-8 block w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          ←
        </button>
        <div className="text-white/70 text-sm font-bold uppercase tracking-widest mb-3">
          {subjectName}
        </div>
        <h1 className="font-display text-4xl font-black leading-tight">
          {assignment.lesson.title}
        </h1>
      </div>

      {/* Content */}
      <div className="px-5 -mt-6 max-w-lg mx-auto pb-12">
        {assignment.lesson.description && (
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <p className="text-learner-ink font-medium text-lg leading-relaxed">
              {assignment.lesson.description}
            </p>
          </div>
        )}

        {assignment.lesson.resource_url && (
          <a
            href={assignment.lesson.resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-2xl p-5 mb-4 shadow-sm active:scale-98 transition-transform"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            <div
              className="text-xs font-bold uppercase tracking-wider mb-1"
              style={{ color }}
            >
              Open resource ↗
            </div>
            <div className="text-learner-muted text-sm font-medium truncate">
              {assignment.lesson.resource_url}
            </div>
          </a>
        )}

        <div className="mt-6">
          {completed ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-3">✅</div>
              <p className="font-bold text-green-700 text-xl">You finished this one!</p>
            </div>
          ) : (
            <button
              onClick={markDone}
              className="w-full text-white font-bold text-2xl py-6 rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: color }}
            >
              I'm done! ⭐
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
