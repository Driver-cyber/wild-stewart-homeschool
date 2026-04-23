import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SUBJECTS } from '../lib/types'

const LEARN_URL = 'learn.chadstewartcpa.com'

const slides = [
  'vision',
  'library',
  'week',
  'lyle',
  'status',
] as const

function SlideVision() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center max-w-3xl mx-auto">
      <p className="text-amber-400 text-sm font-bold uppercase tracking-[0.2em] mb-6">
        Introducing
      </p>
      <h1
        className="font-display font-black text-6xl md:text-7xl text-amber-100 tracking-tight mb-6 leading-none"
      >
        wild stewart<br />homeschool
      </h1>
      <p className="text-amber-200/70 text-xl font-medium mb-12 max-w-xl leading-relaxed">
        Your family's homeschool operating system — built for how you actually work.
      </p>
      <div className="grid grid-cols-2 gap-6 w-full max-w-2xl text-left">
        <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <div className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-3">
            Joelle's side
          </div>
          <p className="text-amber-100/80 leading-relaxed">
            A planning tool that makes Sunday prep feel like craft, not drudgery. Library, week calendar, progress at a glance.
          </p>
        </div>
        <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <div className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-3">
            Lyle's side
          </div>
          <p className="text-amber-100/80 leading-relaxed">
            Colorful lesson tiles, his name on the screen, a celebration every time he finishes something. Learning feels like play.
          </p>
        </div>
      </div>
    </div>
  )
}

function SlideLibrary() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 max-w-3xl mx-auto">
      <p className="text-amber-400 text-sm font-bold uppercase tracking-[0.2em] mb-4 text-center">
        Step 1
      </p>
      <h2 className="font-display font-black text-5xl text-amber-100 tracking-tight mb-4 text-center">
        Build your Library
      </h2>
      <p className="text-amber-200/70 text-lg mb-8 text-center max-w-xl">
        Every lesson lives here before it goes on the calendar. Add a title, subject, instructions — and attach a YouTube video or PDF worksheet.
      </p>

      <div className="w-full max-w-xl rounded-2xl p-5 mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '📝', label: 'Instructions', sub: 'what Lyle should do' },
            { icon: '▶', label: 'YouTube link', sub: 'auto-embeds in the lesson' },
            { icon: '📄', label: 'PDF worksheet', sub: 'upload from Canva or Slides' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg mb-0.5"
                style={{ backgroundColor: '#F2A24A', color: '#2C1A0E' }}
              >
                {item.icon}
              </div>
              <div className="text-amber-100 font-bold text-sm">{item.label}</div>
              <div className="text-amber-200/50 text-xs">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 justify-center">
        {SUBJECTS.map(s => (
          <div
            key={s.value}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full font-bold text-white text-xs"
            style={{ backgroundColor: s.color }}
          >
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideWeek() {
  const sampleDays = [
    [{ title: 'SH words', subject: 'reading' }, { title: 'Adding to 20', subject: 'math' }],
    [{ title: 'Journal entry', subject: 'writing' }],
    [{ title: 'Plants unit', subject: 'science' }, { title: 'Bob Books ch.2', subject: 'reading' }],
    [{ title: 'Counting coins', subject: 'math' }],
    [{ title: 'Map skills', subject: 'social_studies' }, { title: 'Rhyming words', subject: 'reading' }],
  ]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto w-full">
      <p className="text-amber-400 text-sm font-bold uppercase tracking-[0.2em] mb-4 text-center">
        Step 2
      </p>
      <h2 className="font-display font-black text-5xl text-amber-100 tracking-tight mb-4 text-center">
        Plan Sunday Night
      </h2>
      <p className="text-amber-200/70 text-lg mb-8 text-center max-w-xl">
        Open "This Week," navigate to April 28, and click <strong className="text-amber-300">+ Add</strong> on each day to pull lessons from your library.
      </p>

      {/* Mini week grid */}
      <div className="grid grid-cols-5 gap-2 w-full">
        {days.map((day, i) => (
          <div key={day} className="rounded-xl p-3 flex flex-col gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
            <div className="text-amber-400/80 text-xs font-bold uppercase tracking-wider">{day}</div>
            {sampleDays[i].map((lesson, j) => {
              const color = SUBJECTS.find(s => s.value === lesson.subject)?.color ?? '#888'
              return (
                <div
                  key={j}
                  className="rounded-lg px-2 py-1.5 text-white text-xs font-semibold leading-tight"
                  style={{ backgroundColor: color }}
                >
                  {lesson.title}
                </div>
              )
            })}
            <div className="text-amber-200/30 text-xs text-center border border-dashed border-amber-200/20 rounded-lg py-1 mt-auto">
              + Add
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideLyle() {
  const tiles = [
    { subject: 'reading', title: 'SH words', done: true },
    { subject: 'math', title: 'Adding to 20', done: false },
    { subject: 'science', title: 'Plants unit', done: true },
    { subject: 'writing', title: 'Journal entry', done: false },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 max-w-3xl mx-auto text-center">
      <p className="text-amber-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">
        Lyle's experience
      </p>
      <h2 className="font-display font-black text-5xl text-amber-100 tracking-tight mb-4">
        Lyle's World
      </h2>
      <p className="text-amber-200/70 text-lg mb-3 max-w-lg">
        He opens the iPad, taps his name, and sees his week as colorful tiles.
      </p>
      <p className="text-amber-400 font-mono text-sm mb-8">
        {LEARN_URL}
      </p>

      {/* Tile preview */}
      <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-sm">
        {tiles.map((t, i) => {
          const color = SUBJECTS.find(s => s.value === t.subject)?.color ?? '#888'
          const label = SUBJECTS.find(s => s.value === t.subject)?.label ?? ''
          return (
            <div
              key={i}
              className="relative rounded-2xl p-4 text-left min-h-[90px] flex flex-col justify-between"
              style={{ backgroundColor: color, opacity: t.done ? 0.75 : 1 }}
            >
              {t.done && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">✓</div>
              )}
              <div className="text-white/70 text-xs font-bold uppercase tracking-wider">{label}</div>
              <div className="text-white font-bold text-sm leading-snug">{t.title}</div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-2 text-sm text-left w-full max-w-sm">
        {[
          { icon: '👀', text: 'Reads the instructions' },
          { icon: '▶', text: 'Watches the video — right in the app' },
          { icon: '📄', text: 'Opens the worksheet with one tap' },
          { icon: '⭐', text: 'Hits "I\'m done!" → confetti flies' },
        ].map(step => (
          <div key={step.icon} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
            <span className="text-xl w-7 text-center flex-shrink-0">{step.icon}</span>
            <span className="text-amber-100/80 font-medium">{step.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideStatus({ onFinish }: { onFinish: () => void }) {
  const ready = [
    'Lesson library — titles, subjects, instructions',
    'PDF worksheet upload (Canva → export → done)',
    'YouTube auto-embed — video plays in the lesson',
    'Weekly calendar planning view',
    "Lyle's learner view with colorful tiles",
    'Mark done + confetti celebration',
    'Progress indicators in your week view',
    'Learner profiles (add Lyle, add future siblings)',
  ]
  const coming = [
    'Richer lesson types (reading flows, spelling)',
    'Star / reward tracking',
    'Calendar drag-and-drop',
    'Month view',
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 max-w-3xl mx-auto w-full">
      <h2 className="font-display font-black text-5xl text-amber-100 tracking-tight mb-8 text-center">
        Where we are
      </h2>

      <div className="grid grid-cols-2 gap-6 w-full mb-10">
        <div>
          <div className="text-green-400 font-bold text-sm uppercase tracking-wider mb-4">
            ✅ Ready now
          </div>
          <ul className="space-y-2.5">
            {ready.map(item => (
              <li key={item} className="flex items-start gap-2.5 text-amber-100/80 text-sm">
                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-amber-400/60 font-bold text-sm uppercase tracking-wider mb-4">
            ◦ Coming next
          </div>
          <ul className="space-y-2.5">
            {coming.map(item => (
              <li key={item} className="flex items-start gap-2.5 text-amber-100/40 text-sm">
                <span className="flex-shrink-0 mt-0.5">◦</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={onFinish}
        className="px-8 py-4 rounded-2xl font-black text-lg transition-all hover:opacity-90 active:scale-95"
        style={{ backgroundColor: '#F2A24A', color: '#2C1A0E' }}
      >
        Open the app →
      </button>
    </div>
  )
}

export default function WelcomePage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const total = slides.length

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrent(prev => Math.min(prev + 1, total - 1))
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrent(prev => Math.max(prev - 1, 0))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [total])

  const goTo = (i: number) => setCurrent(Math.max(0, Math.min(i, total - 1)))

  const slideContent: React.ReactNode[] = [
    <SlideVision key="vision" />,
    <SlideLibrary key="library" />,
    <SlideWeek key="week" />,
    <SlideLyle key="lyle" />,
    <SlideStatus key="status" onFinish={() => navigate('/app')} />,
  ]

  return (
    <div
      className="min-h-screen flex flex-col font-sans select-none"
      style={{ backgroundColor: '#2C1A0E', color: '#F5DEB3' }}
    >
      {/* Slide area */}
      <div className="flex-1 flex flex-col justify-center" style={{ minHeight: 0 }}>
        <div className="transition-opacity duration-300" key={current}>
          {slideContent[current]}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-8 py-6">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all disabled:opacity-20 hover:bg-white/10"
          style={{ color: '#F2A24A' }}
        >
          ←
        </button>

        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all"
              style={{
                width: i === current ? '1.5rem' : '0.5rem',
                height: '0.5rem',
                backgroundColor: i === current ? '#F2A24A' : 'rgba(242,162,74,0.3)',
              }}
            />
          ))}
        </div>

        {current < total - 1 ? (
          <button
            onClick={() => goTo(current + 1)}
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all hover:bg-white/10"
            style={{ color: '#F2A24A' }}
          >
            →
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Slide counter */}
      <div
        className="absolute top-6 right-8 text-sm font-semibold tabular-nums"
        style={{ color: 'rgba(242,162,74,0.4)' }}
      >
        {current + 1} / {total}
      </div>
    </div>
  )
}
