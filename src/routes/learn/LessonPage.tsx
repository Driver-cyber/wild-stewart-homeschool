import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
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

function fireConfetti(color: string) {
  const burst = (origin: { x: number; y: number }) =>
    confetti({
      particleCount: 80,
      spread: 70,
      origin,
      colors: [color, '#ffffff', '#FFD700', '#FF69B4', color + 'aa'],
      ticks: 300,
      gravity: 0.8,
      scalar: 1.2,
    })

  burst({ x: 0.5, y: 0.55 })
  setTimeout(() => burst({ x: 0.3, y: 0.6 }), 150)
  setTimeout(() => burst({ x: 0.7, y: 0.6 }), 300)
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
      fireConfetti(subjectColor(assignment.lesson.subject))
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
        <div className="text-8xl mb-2 animate-bounce" style={{ animationDuration: '0.6s' }}>
          ⭐
        </div>
        <div className="flex gap-4 mb-6 text-5xl">
          <span className="animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.7s' }}>🌟</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.5s' }}>⭐</span>
          <span className="animate-bounce" style={{ animationDelay: '0.05s', animationDuration: '0.8s' }}>🌟</span>
        </div>
        <h1 className="font-display text-5xl font-black mb-3 drop-shadow-lg">
          Amazing, {assignment.profile.name}!
        </h1>
        <p className="text-2xl font-bold opacity-90 mb-2">
          You finished
        </p>
        <p className="text-3xl font-black mb-14 drop-shadow">
          {assignment.lesson.title}!
        </p>
        <button
          onClick={() => navigate(`/learn/${profileId}`)}
          className="bg-white/25 hover:bg-white/35 active:bg-white/45 active:scale-95 text-white font-black text-xl px-12 py-5 rounded-3xl transition-all shadow-lg"
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
          className="text-white/70 hover:text-white text-3xl mb-8 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
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
            className="block bg-white rounded-2xl p-5 mb-4 shadow-sm transition-transform active:scale-[0.98]"
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
              className="w-full text-white font-black text-2xl py-6 rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
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
