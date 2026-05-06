import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { supabase } from '../../lib/supabase'
import type { Lesson, Profile, QuizQuestion, LessonState } from '../../lib/types'
import { SUBJECTS, subjectColor, latestStateByKey } from '../../lib/types'
import { getYouTubeId } from '../../lib/youtube'
import { lessonSnapshot } from '../../lib/snapshot'
import { useAuth } from '../../contexts/AuthContext'

function getStorageUrl(path: string): string {
  return supabase.storage.from('resources').getPublicUrl(path).data.publicUrl
}

function isImagePath(path: string): boolean {
  return /\.(jpe?g|png|gif|webp|svg|avif|bmp)$/i.test(path.split('/').pop() ?? '')
}

// Renders text with URLs turned into tappable links
function LinkifiedText({ text, linkColor }: { text: string; linkColor: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('http://') || part.startsWith('https://') ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold break-all"
            style={{ color: linkColor }}
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

function LinkCard({ url, color }: { url: string; color: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl p-5 mb-4 shadow-sm transition-transform active:scale-[0.98]"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>
        Open link ↗
      </div>
      <div className="text-learner-muted text-sm font-medium truncate">{url}</div>
    </a>
  )
}

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

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function LessonPage() {
  const { profileId, assignmentId } = useParams<{ profileId: string; assignmentId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [assignment, setAssignment] = useState<AssignmentFull | null>(null)
  const [completed, setCompleted] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Quiz state
  const [quizPhase, setQuizPhase] = useState<'content' | 'quiz'>('content')
  const [quizIndex, setQuizIndex] = useState(0)
  const [mcSelected, setMcSelected] = useState<number | null>(null)
  const [mcCorrect, setMcCorrect] = useState(false)
  const [woBank, setWoBank] = useState<string[]>([])
  const [woBuilt, setWoBuilt] = useState<string[]>([])
  const [woResult, setWoResult] = useState<'none' | 'correct' | 'wrong'>('none')
  const shuffledRef = useRef<Record<number, string[]>>({})
  const wrongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
          .select('state, created_at:completed_at')
          .eq('assignment_id', assignmentId!)
          .eq('profile_id', profileId!)
        const events = (comp ?? []) as { state: LessonState; created_at: string }[]
        const latest = latestStateByKey(events, () => 'a').get('a')
        setCompleted(latest?.state === 'mastered')
      }
      setLoading(false)
    }
    load()

    return () => {
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current)
    }
  }, [assignmentId, profileId])

  async function markDone() {
    if (!user || !assignment || completed || saving) return
    setSaving(true)
    const { error } = await supabase.from('completions').insert({
      user_id: user.id,
      assignment_id: assignment.id,
      lesson_id: assignment.lesson.id,
      profile_id: assignment.profile_id,
      state: 'mastered',
      lesson_snapshot: lessonSnapshot(assignment.lesson),
    })
    if (!error) {
      setCompleted(true)
      setCelebrating(true)
      fireConfetti(subjectColor(assignment.lesson.subject))
    }
    setSaving(false)
  }

  // ── Quiz handlers ─────────────────────────────────────────────────────────

  function startQuiz() {
    const questions = assignment!.lesson.quiz_questions
    if (!questions || questions.length === 0) return

    // Pre-shuffle all word-order questions
    const shuffled: Record<number, string[]> = {}
    questions.forEach((q, i) => {
      if (q.type === 'word_order' && q.sentence) {
        shuffled[i] = shuffle(q.sentence.trim().split(/\s+/))
      }
    })
    shuffledRef.current = shuffled

    loadQuestion(0, questions)
    setQuizIndex(0)
    setQuizPhase('quiz')
  }

  function loadQuestion(idx: number, questions: QuizQuestion[]) {
    setMcSelected(null)
    setMcCorrect(false)
    setWoResult('none')
    if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current)
    const q = questions[idx]
    if (q.type === 'word_order') {
      setWoBank(shuffledRef.current[idx] ?? [])
      setWoBuilt([])
    } else {
      setWoBank([])
      setWoBuilt([])
    }
  }

  function handleMcSelect(optIdx: number) {
    if (mcCorrect) return
    const q = assignment!.lesson.quiz_questions![quizIndex]
    setMcSelected(optIdx)
    if (optIdx === q.answer_index) {
      setMcCorrect(true)
    } else {
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current)
      wrongTimeoutRef.current = setTimeout(() => setMcSelected(null), 700)
    }
  }

  function tapBankWord(idx: number) {
    if (woResult === 'correct') return
    const word = woBank[idx]
    setWoBank(prev => prev.filter((_, i) => i !== idx))
    setWoBuilt(prev => [...prev, word])
    setWoResult('none')
  }

  function tapBuiltWord(idx: number) {
    if (woResult === 'correct') return
    const word = woBuilt[idx]
    setWoBuilt(prev => prev.filter((_, i) => i !== idx))
    setWoBank(prev => [...prev, word])
    setWoResult('none')
  }

  function checkWordOrder() {
    const q = assignment!.lesson.quiz_questions![quizIndex]
    const correct = woBuilt.join(' ').trim() === (q.sentence ?? '').trim()
    if (correct) {
      setWoResult('correct')
    } else {
      setWoResult('wrong')
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current)
      wrongTimeoutRef.current = setTimeout(() => setWoResult('none'), 800)
    }
  }

  function advanceQuiz() {
    const questions = assignment!.lesson.quiz_questions!
    const nextIdx = quizIndex + 1
    if (nextIdx >= questions.length) {
      markDone()
    } else {
      loadQuestion(nextIdx, questions)
      setQuizIndex(nextIdx)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

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

  // ── Celebration screen ────────────────────────────────────────────────────

  if (celebrating) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center font-rounded text-white p-8 text-center"
        style={{ backgroundColor: color }}
      >
        <div className="text-8xl mb-2 animate-bounce" style={{ animationDuration: '0.6s' }}>⭐</div>
        <div className="flex gap-4 mb-6 text-5xl">
          <span className="animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.7s' }}>🌟</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.5s' }}>⭐</span>
          <span className="animate-bounce" style={{ animationDelay: '0.05s', animationDuration: '0.8s' }}>🌟</span>
        </div>
        <h1 className="font-display text-5xl font-black mb-3 drop-shadow-lg">
          Amazing, {assignment.profile.name}!
        </h1>
        <p className="text-2xl font-bold opacity-90 mb-2">You finished</p>
        <p className="text-3xl font-black mb-14 drop-shadow">{assignment.lesson.title}!</p>
        <button
          onClick={() => navigate(`/learn/${profileId}`)}
          className="bg-white/25 hover:bg-white/35 active:bg-white/45 active:scale-95 text-white font-black text-xl px-12 py-5 rounded-3xl transition-all shadow-lg"
        >
          Back to my week →
        </button>
      </div>
    )
  }

  // ── Quiz screen ───────────────────────────────────────────────────────────

  if (quizPhase === 'quiz' && assignment.lesson.quiz_questions?.length) {
    const questions = assignment.lesson.quiz_questions
    const q = questions[quizIndex]
    const isLast = quizIndex === questions.length - 1
    const questionReady = mcCorrect || woResult === 'correct'

    return (
      <div className="min-h-screen bg-learner-bg font-rounded">
        {/* Header */}
        <div className="text-white px-6 pt-8 pb-12" style={{ backgroundColor: color }}>
          <div className="text-white/70 text-sm font-bold uppercase tracking-widest mb-3">{subjectName}</div>
          <h1 className="font-display text-3xl font-black leading-tight">Quiz Time! ✨</h1>
          {/* Progress dots */}
          <div className="flex gap-2 mt-4">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${i <= quizIndex ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="px-5 -mt-6 max-w-lg mx-auto pb-12">
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>
              Question {quizIndex + 1} of {questions.length}
            </div>

            <p className="text-learner-ink font-bold text-xl leading-snug mb-5">
              {q.type === 'multiple_choice'
                ? q.question
                : (q.question || 'Put the words in the right order!')}
            </p>

            {/* Multiple choice */}
            {q.type === 'multiple_choice' && (
              <div className="space-y-3">
                {(q.options ?? []).filter(o => o.trim()).map((option, oi) => {
                  const isSelected = mcSelected === oi
                  const isCorrect = oi === q.answer_index
                  let cls = 'bg-gray-50 border-2 border-gray-200 text-learner-ink'
                  if (isSelected && isCorrect) cls = 'bg-green-100 border-2 border-green-400 text-green-800'
                  else if (isSelected && !isCorrect) cls = 'bg-red-100 border-2 border-red-400 text-red-800'

                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => handleMcSelect(oi)}
                      disabled={mcCorrect}
                      className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 ${cls}`}
                    >
                      <span className="font-black mr-2">{String.fromCharCode(65 + oi)}.</span>
                      {option}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Word order */}
            {q.type === 'word_order' && (
              <>
                {/* Answer area */}
                <div className="mb-4">
                  <div className="text-xs font-bold text-adult-muted uppercase tracking-wider mb-2">Your answer:</div>
                  <div
                    className={`min-h-[60px] rounded-xl border-2 p-3 flex flex-wrap gap-2 transition-colors ${
                      woResult === 'correct'
                        ? 'border-green-400 bg-green-50'
                        : woResult === 'wrong'
                        ? 'border-red-400 bg-red-50'
                        : 'border-dashed border-adult-border bg-gray-50'
                    }`}
                  >
                    {woBuilt.length === 0 ? (
                      <span className="text-adult-muted text-sm italic self-center">Tap words below to build your answer</span>
                    ) : (
                      woBuilt.map((word, wi) => (
                        <button
                          key={wi}
                          type="button"
                          onClick={() => tapBuiltWord(wi)}
                          disabled={woResult === 'correct'}
                          className="bg-white border-2 font-bold px-3 py-1.5 rounded-xl text-sm shadow-sm active:scale-95 transition-transform text-learner-ink"
                          style={{ borderColor: color + '60' }}
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>
                  {woResult === 'correct' && (
                    <p className="text-green-600 font-bold text-sm mt-2">✓ That's right!</p>
                  )}
                  {woResult === 'wrong' && (
                    <p className="text-red-500 font-bold text-sm mt-2">Not quite — try again!</p>
                  )}
                </div>

                {/* Word bank */}
                <div>
                  <div className="text-xs font-bold text-adult-muted uppercase tracking-wider mb-2">Word bank:</div>
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {woBank.map((word, wi) => (
                      <button
                        key={wi}
                        type="button"
                        onClick={() => tapBankWord(wi)}
                        className="font-bold px-3 py-2 rounded-xl text-sm shadow-sm active:scale-95 transition-transform text-white"
                        style={{ backgroundColor: color }}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Check button — appears when all words placed */}
                {woBank.length === 0 && woBuilt.length > 0 && woResult !== 'correct' && (
                  <button
                    type="button"
                    onClick={checkWordOrder}
                    className="w-full mt-5 text-white font-black text-lg py-4 rounded-2xl shadow-md active:scale-95 transition-all"
                    style={{ backgroundColor: color }}
                  >
                    Check! ✓
                  </button>
                )}
              </>
            )}
          </div>

          {/* Advance button */}
          {questionReady && (
            <button
              type="button"
              onClick={advanceQuiz}
              className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-lg active:scale-95 transition-all"
              style={{ backgroundColor: color }}
            >
              {isLast ? 'Finish! ⭐' : 'Next question →'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Lesson content screen ─────────────────────────────────────────────────

  const hasQuiz = !!(assignment.lesson.quiz_questions?.length)
  const ytId = assignment.lesson.resource_url ? getYouTubeId(assignment.lesson.resource_url) : null
  const ytId2 = assignment.lesson.resource_url_2 ? getYouTubeId(assignment.lesson.resource_url_2) : null

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
        <div className="text-white/70 text-sm font-bold uppercase tracking-widest mb-3">{subjectName}</div>
        <h1 className="font-display text-4xl font-black leading-tight">{assignment.lesson.title}</h1>
      </div>

      {/* Content */}
      <div className="px-5 -mt-6 max-w-lg mx-auto pb-12">

        {/* Instructions with tappable links */}
        {assignment.lesson.description && (
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <p className="text-learner-ink font-medium text-lg leading-relaxed">
              <LinkifiedText text={assignment.lesson.description} linkColor={color} />
            </p>
          </div>
        )}

        {/* Inline reference image */}
        {assignment.lesson.content_image_path && (
          <div className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm">
            <img
              src={getStorageUrl(assignment.lesson.content_image_path)}
              alt="Lesson reference"
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Link 1 — YouTube embed or link card */}
        {ytId ? (
          <YouTubeEmbed videoId={ytId} title={assignment.lesson.title} />
        ) : assignment.lesson.resource_url ? (
          <LinkCard url={assignment.lesson.resource_url} color={color} />
        ) : null}

        {/* Link 2 */}
        {ytId2 ? (
          <YouTubeEmbed videoId={ytId2} title={`${assignment.lesson.title} — extra`} />
        ) : assignment.lesson.resource_url_2 ? (
          <LinkCard url={assignment.lesson.resource_url_2} color={color} />
        ) : null}

        {/* Worksheet / file */}
        {assignment.lesson.pdf_path && (
          isImagePath(assignment.lesson.pdf_path) ? (
            <div className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm">
              <img
                src={getStorageUrl(assignment.lesson.pdf_path)}
                alt="Lesson worksheet"
                className="w-full h-auto"
              />
            </div>
          ) : (
            <a
              href={getStorageUrl(assignment.lesson.pdf_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white rounded-2xl p-5 mb-4 shadow-sm transition-transform active:scale-[0.98]"
              style={{ borderLeft: `4px solid ${color}` }}
            >
              <span className="text-5xl">📄</span>
              <div>
                <div className="font-black text-learner-ink text-xl">Open my worksheet</div>
                <div className="text-learner-muted text-sm font-medium mt-0.5">Tap to open</div>
              </div>
              <span className="ml-auto text-3xl" style={{ color }}>↗</span>
            </a>
          )
        )}

        {/* Done / Quiz button */}
        <div className="mt-6">
          {completed ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-3">✅</div>
              <p className="font-bold text-green-700 text-xl">You finished this one!</p>
            </div>
          ) : hasQuiz ? (
            <button
              onClick={startQuiz}
              className="w-full text-white font-black text-2xl py-6 rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: color }}
            >
              Ready for the quiz? ✨
            </button>
          ) : (
            <button
              onClick={markDone}
              disabled={saving}
              className="w-full text-white font-black text-2xl py-6 rounded-2xl shadow-lg hover:opacity-90 active:scale-95 disabled:opacity-70 transition-all"
              style={{ backgroundColor: color }}
            >
              {saving ? '…' : "I'm done! ⭐"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
