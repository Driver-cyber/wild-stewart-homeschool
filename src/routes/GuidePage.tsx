import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

interface Step {
  n: number
  eyebrow: string
  title: string
  color: string
  body: string
  cta?: { label: string; to: string }
  shape: 'circle' | 'square' | 'diamond' | 'blob'
}

const STEPS: Step[] = [
  {
    n: 1,
    eyebrow: 'Step one',
    title: 'Sign in as Joelle',
    color: '#9C5034',
    body: 'Open the app on a laptop or iPad. One household login — your email and password. The iPad can stay signed in essentially forever after the first time.',
    cta: { label: 'Open sign-in', to: '/login' },
    shape: 'circle',
  },
  {
    n: 2,
    eyebrow: 'Step two',
    title: 'Seed the sight words',
    color: '#D94F4F',
    body: 'About 80 Dolch words land in the inventory in todo state. This is the vocabulary that powers reading-and-spelling personalization — without it, lessons render their original example sentences.',
    cta: { label: 'Sight Words', to: '/app/sight-words' },
    shape: 'square',
  },
  {
    n: 3,
    eyebrow: 'Step three',
    title: 'Mark a few as mastered',
    color: '#C4611A',
    body: 'Tap a handful of words Lyle already knows — "the", "a", "and", "is", "to". The status circle cycles to a sage check. Now the personalization engine has substitution candidates to weave into reading lessons.',
    cta: { label: 'Sight Words', to: '/app/sight-words' },
    shape: 'diamond',
  },
  {
    n: 4,
    eyebrow: 'Step four',
    title: 'Seed Reading & Spelling',
    color: '#D94F4F',
    body: '32 weeks of curriculum lands as 64 lessons — Reading on red, Spelling on teal. Week 1 should show the ✦ Adapted badge if any sight words are mastered, with the swap summary visible underneath.',
    cta: { label: 'Curriculum', to: '/app/curriculum/reading-spelling' },
    shape: 'blob',
  },
  {
    n: 5,
    eyebrow: 'Step five',
    title: 'Seed Math',
    color: '#E8970A',
    body: '32 weeks × Concept + Practice = 64 more lessons covering counting, place value, addition, subtraction, geometry, measurement, and money. First-draft content — preview as you go.',
    cta: { label: 'Math', to: '/app/curriculum/math' },
    shape: 'circle',
  },
  {
    n: 6,
    eyebrow: 'Step six (optional)',
    title: 'Add the in-real-life lessons',
    color: '#3E9E3E',
    body: 'Library books, field trips, piano practice, science experiments. Flip the Offline toggle and Lyle just checks it off when done. The Library has search and subject filters now — type a few letters and the long list shrinks.',
    cta: { label: 'Library', to: '/app/library' },
    shape: 'square',
  },
  {
    n: 7,
    eyebrow: 'Step seven',
    title: 'Schedule the week',
    color: '#7B4FCC',
    body: 'Two ways. Bulk schedule fills four subjects across N weeks in lockstep — pick the day-of-week per subject. Or tap + Add on a day, search the library, and drop the lesson in. Either creates assignments tied to Lyle\'s profile.',
    cta: { label: 'This Week', to: '/app/week' },
    shape: 'diamond',
  },
  {
    n: 8,
    eyebrow: 'Step eight — the handoff',
    title: 'Lyle takes it from here',
    color: '#2AADAD',
    body: 'Switch to the iPad, tap his profile, choose Galaxy mode or the day list. He taps a lesson, reads or does it, hits "I\'m done!" The completion logs back to Joelle\'s side and the status circle flips to sage with a check. That\'s the loop.',
    cta: { label: 'Open learner side', to: '/learn' },
    shape: 'blob',
  },
]

function Shape({ kind, color }: { kind: Step['shape']; color: string }) {
  const common = { fill: color, opacity: 0.18 }
  switch (kind) {
    case 'circle':
      return <circle cx="200" cy="200" r="160" {...common} />
    case 'square':
      return <rect x="60" y="60" width="280" height="280" rx="40" {...common} />
    case 'diamond':
      return <polygon points="200,30 370,200 200,370 30,200" {...common} />
    case 'blob':
      return <path d="M 200 40 C 320 60 380 140 360 240 C 340 340 240 380 140 360 C 40 340 20 240 60 140 C 100 60 140 30 200 40 Z" {...common} />
  }
}

export default function GuidePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const sections = root.querySelectorAll('[data-step]')
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt((entry.target as HTMLElement).dataset.step ?? '0', 10)
            setActiveStep(idx)
          }
        }
      },
      { root, threshold: 0.55 },
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  function scrollToStep(idx: number) {
    const root = containerRef.current
    if (!root) return
    const target = root.querySelector(`[data-step="${idx}"]`) as HTMLElement | null
    if (target) target.scrollIntoView({ behavior: 'smooth' })
  }

  const activeColor = activeStep === 0 ? '#C4611A' : STEPS[activeStep - 1]?.color ?? '#C4611A'

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-adult-bg font-sans relative"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Parallax background — fixed, hue-shifts gently with active step */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 20% 30%, ${activeColor}11 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${activeColor}0a 0%, transparent 50%), #F7F3EE`,
        }}
      />

      {/* Side progress dots */}
      <nav className="fixed right-5 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {[0, ...STEPS.map(s => s.n)].map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToStep(i)}
            aria-label={i === 0 ? 'Intro' : `Step ${i}`}
            className="w-2.5 h-2.5 rounded-full transition-all"
            style={{
              backgroundColor: i === activeStep ? activeColor : '#E0D8CF',
              transform: i === activeStep ? 'scale(1.6)' : 'scale(1)',
            }}
          />
        ))}
      </nav>

      {/* Top-left back to app */}
      <Link
        to="/app/week"
        className="fixed left-5 sm:left-8 top-5 sm:top-8 z-20 text-xs sm:text-sm font-semibold text-adult-muted hover:text-adult-ink transition-colors bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border border-adult-border"
      >
        ← Back to app
      </Link>

      {/* Hero / intro slide */}
      <section
        data-step={0}
        className="h-screen snap-start snap-always flex items-center justify-center px-6 relative z-10"
      >
        <div className="max-w-3xl text-center">
          <p className="font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-adult-muted mb-6">
            Wild Stewart Homeschool · Setup Guide
          </p>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black text-adult-ink tracking-tight leading-[0.95] mb-6">
            From empty to <span className="italic" style={{ color: '#C4611A' }}>ready for school</span> in eight steps.
          </h1>
          <p className="text-lg sm:text-xl text-adult-muted leading-relaxed mb-10 max-w-2xl mx-auto">
            A walkthrough of the full prep-to-handoff cycle. Scroll, or tap the dots on the right. Each step links to the page you'll be on.
          </p>
          <button
            type="button"
            onClick={() => scrollToStep(1)}
            className="inline-flex items-center gap-2 bg-adult-ink text-white px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Begin <span className="text-lg leading-none">↓</span>
          </button>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-adult-muted text-xs uppercase tracking-widest font-bold">
          scroll
        </div>
      </section>

      {/* Numbered steps */}
      {STEPS.map(step => (
        <section
          key={step.n}
          data-step={step.n}
          className="h-screen snap-start snap-always flex items-center px-6 sm:px-12 lg:px-24 relative z-10"
        >
          {/* Decorative shape — soft, fixed-ish via section bounds */}
          <svg
            className="absolute -right-20 sm:right-0 top-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[600px] sm:h-[600px] pointer-events-none"
            viewBox="0 0 400 400"
            aria-hidden
          >
            <Shape kind={step.shape} color={step.color} />
          </svg>

          <div className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 sm:gap-16 items-center relative z-10">
            <div
              className="font-display font-black leading-none select-none"
              style={{
                color: step.color,
                fontSize: 'clamp(8rem, 18vw, 18rem)',
              }}
            >
              {step.n}
            </div>
            <div>
              <p
                className="font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.25em] mb-3"
                style={{ color: step.color }}
              >
                {step.eyebrow}
              </p>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-adult-ink tracking-tight leading-[1.05] mb-5">
                {step.title}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-adult-muted leading-relaxed mb-7 max-w-xl">
                {step.body}
              </p>
              {step.cta && (
                <Link
                  to={step.cta.to}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-opacity hover:opacity-90 text-white"
                  style={{ backgroundColor: step.color }}
                >
                  {step.cta.label} <span className="text-base leading-none">→</span>
                </Link>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* Closing slide */}
      <section
        data-step={STEPS.length + 1}
        className="h-screen snap-start snap-always flex items-center justify-center px-6 relative z-10"
      >
        <div className="max-w-2xl text-center">
          <p className="font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-adult-muted mb-6">
            And that's the loop
          </p>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-adult-ink tracking-tight leading-[1.05] mb-6">
            Plan on Sunday, run the week, watch it close.
          </h2>
          <p className="text-base sm:text-lg text-adult-muted leading-relaxed mb-8">
            Every Sunday you'll come back to <em className="font-display">This Week</em>, schedule the next run, and hand off again. Save this page as a bookmark — open it any time the rhythm needs a refresher.
          </p>
          <Link
            to="/app/week"
            className="inline-flex items-center gap-2 bg-adult-accent text-white px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Go to This Week <span className="text-base leading-none">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
