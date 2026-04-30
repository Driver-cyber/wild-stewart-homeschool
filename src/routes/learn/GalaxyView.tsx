import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Profile, Lesson } from '../../lib/types'
import { SUBJECTS } from '../../lib/types'
import './galaxy.css'

interface AssignmentRow {
  id: string
  scheduled_date: string
  lesson: Lesson
  completed: boolean
}

interface Props {
  profile: Profile
  assignments: AssignmentRow[]
  onTapAssignment: (assignmentId: string) => void
  onBack: () => void
  onSwitchToList: () => void
}

const SUBJECT_PALETTE: Record<string, { core: string; glow: string }> = {
  reading: { core: '#E84545', glow: '#F8A8A8' },
  writing: { core: '#3FA9A3', glow: '#7BD2CD' },
  math: { core: '#E8970A', glow: '#F4C566' },
  science: { core: '#3FA34D', glow: '#7BD089' },
  social_studies: { core: '#7B6FB5', glow: '#B0A6E0' },
}
const DEFAULT_PALETTE = { core: '#888', glow: '#bbb' }
const paletteFor = (subject: string) =>
  SUBJECT_PALETTE[subject] ?? DEFAULT_PALETTE

interface Star {
  id: number
  left: string
  top: string
  className: string
  delay: string
  opacity: string
}

function generateStars(count: number): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    const tier = Math.random()
    const cls = tier < 0.55 ? 's1' : tier < 0.9 ? 's2' : 's3'
    const tw = Math.random() < 0.3 ? ' tw' : ''
    stars.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      className: `star ${cls}${tw}`,
      delay: `${Math.random() * 4}s`,
      opacity: (0.3 + Math.random() * 0.6).toFixed(2),
    })
  }
  return stars
}

export default function GalaxyView({
  profile,
  assignments,
  onTapAssignment,
  onBack,
  onSwitchToList,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 800, h: 540 })
  const [shipPos, setShipPos] = useState<{ px: number; py: number } | null>(null)
  const [warpTarget, setWarpTarget] = useState<{
    id: string
    originX: number
    originY: number
  } | null>(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const warpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect
      setSize({ w: r.width, h: r.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    return () => {
      if (warpTimerRef.current) clearTimeout(warpTimerRef.current)
    }
  }, [])

  const [stars] = useState(() => generateStars(150))

  function handlePlanetTap(id: string, px: number, py: number) {
    if (shipPos) return
    setShipPos({ px, py })
    warpTimerRef.current = setTimeout(() => {
      const originX = size.w > 0 ? (px / size.w) * 100 : 50
      const originY = size.h > 0 ? (py / size.h) * 100 : 50
      setWarpTarget({ id, originX, originY })
      warpTimerRef.current = setTimeout(() => onTapAssignment(id), 950)
    }, 400)
  }

  const layout = useMemo(() => {
    const { w, h } = size
    const cx = w / 2
    const cy = h / 2
    const a = Math.min(w * 0.4, 320)
    const b = Math.min(h * 0.34, 200)
    const ring1 = { a: a * 0.62, b: b * 0.62 }
    const ring2 = { a, b }

    const N = Math.max(assignments.length, 1)
    const planets = assignments.map((asg, i) => {
      const ring = i % 2 === 0 ? ring1 : ring2
      const angleOffset =
        i % 2 === 0 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / N
      const theta = angleOffset + (i / N) * Math.PI * 2
      const px = cx + ring.a * Math.cos(theta)
      const py = cy + ring.b * Math.sin(theta)
      const hasQuiz =
        asg.lesson.quiz_questions && asg.lesson.quiz_questions.length > 0
      const planetSize = hasQuiz ? 44 : 32
      return { asg, px, py, planetSize }
    })

    return { ring1, ring2, planets }
  }, [size, assignments])

  const totalDone = assignments.filter(a => a.completed).length

  return (
    <div className="galaxy-wrap font-rounded">
      <div className="galaxy-hud">
        {profile.name}'s Galaxy
        <span className="sub">
          {assignments.length === 0
            ? 'No lessons this week yet'
            : `Tap a planet to begin · ${totalDone} of ${assignments.length} complete`}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setCommandOpen(true)}
          aria-label="Open command center"
          className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-bold border border-white/15 backdrop-blur-sm transition-colors flex items-center gap-1.5"
        >
          <span>⚙</span>
          <span>Command</span>
        </button>
      </div>

      <div
        className={`galaxy-ship${shipPos ? '' : ' idle'}`}
        style={{
          left: shipPos ? `${shipPos.px}px` : '50%',
          top: shipPos ? `${shipPos.py}px` : '50%',
        }}
        role={shipPos ? undefined : 'button'}
        aria-label={shipPos ? undefined : 'Open command center'}
        onClick={shipPos ? undefined : () => setCommandOpen(true)}
      >
        🚀
      </div>

      <div
        ref={stageRef}
        className={`galaxy-stage${warpTarget ? ' warping' : ''}`}
        style={
          warpTarget
            ? { transformOrigin: `${warpTarget.originX}% ${warpTarget.originY}%` }
            : undefined
        }
      >
        {stars.map(s => (
          <div
            key={s.id}
            className={s.className}
            style={
              {
                left: s.left,
                top: s.top,
                animationDelay: s.delay,
                '--o': s.opacity,
              } as CSSProperties
            }
          />
        ))}

        {[layout.ring1, layout.ring2].map((r, i) => (
          <div
            key={i}
            className="orbit-ring"
            style={{
              width: `${r.a * 2}px`,
              height: `${r.b * 2}px`,
              marginLeft: `${-r.a}px`,
              marginTop: `${-r.b}px`,
            }}
          />
        ))}

        <div className="galaxy-sun" />

        {layout.planets.map(({ asg, px, py, planetSize: pSize }) => {
          const palette = paletteFor(asg.lesson.subject)
          const subj = SUBJECTS.find(s => s.value === asg.lesson.subject)
          return (
            <div
              key={asg.id}
              className={`planet${asg.completed ? ' dim' : ''}`}
              role="button"
              aria-label={`${asg.lesson.title}${asg.completed ? ' (done)' : ''}`}
              style={{
                width: `${pSize}px`,
                height: `${pSize}px`,
                left: `${px}px`,
                top: `${py}px`,
                marginLeft: `${-pSize / 2}px`,
                marginTop: `${-pSize / 2}px`,
                background: `radial-gradient(circle at 32% 30%, ${palette.glow} 0%, ${palette.core} 60%, ${palette.core} 100%)`,
                boxShadow: `0 0 ${pSize * 0.7}px ${palette.core}66, inset -${pSize * 0.1}px -${pSize * 0.15}px ${pSize * 0.4}px rgba(0,0,0,0.35)`,
              }}
              onClick={() => handlePlanetTap(asg.id, px, py)}
            >
              <span className="planet-glyph">
                <span className="subj">{subj?.label}</span>
                {asg.lesson.title}
              </span>
            </div>
          )
        })}

        {assignments.length === 0 && (
          <div className="galaxy-empty">
            <div>The galaxy is quiet</div>
            <div className="sub">No lessons scheduled this week</div>
          </div>
        )}
      </div>

      {commandOpen && (
        <div
          className="cc-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) setCommandOpen(false)
          }}
        >
          <div className="cc-panel">
            <button
              className="cc-close"
              aria-label="Close command center"
              onClick={() => setCommandOpen(false)}
            >
              ×
            </button>
            <div className="cc-title">Command Center</div>
            <div className="cc-subtitle">{profile.name}'s ship</div>

            <div className="cc-section">
              <div className="cc-section-label">
                Done this week · {totalDone} of {assignments.length}
              </div>
              {totalDone === 0 ? (
                <div className="cc-done-empty">
                  Nothing finished yet — tap a planet to get started!
                </div>
              ) : (
                assignments
                  .filter(a => a.completed)
                  .map(a => {
                    const palette = paletteFor(a.lesson.subject)
                    const subj = SUBJECTS.find(s => s.value === a.lesson.subject)
                    return (
                      <button
                        key={a.id}
                        className="cc-done-item"
                        onClick={() => {
                          setCommandOpen(false)
                          onTapAssignment(a.id)
                        }}
                      >
                        <span
                          className="cc-done-dot"
                          style={{ background: palette.core, color: palette.core }}
                        />
                        <span className="cc-done-title">
                          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginRight: 6 }}>
                            {subj?.label}
                          </span>
                          {a.lesson.title}
                        </span>
                        <span className="cc-done-check">✓</span>
                      </button>
                    )
                  })
              )}
            </div>

            <div className="cc-section">
              <div className="cc-section-label">Settings</div>
              <button
                className="cc-action"
                onClick={() => {
                  setCommandOpen(false)
                  onSwitchToList()
                }}
              >
                <span>Switch to list view</span>
                <span className="arrow">→</span>
              </button>
              <button
                className="cc-action"
                onClick={() => {
                  setCommandOpen(false)
                  onBack()
                }}
              >
                <span>← Back to profiles</span>
                <span className="arrow"></span>
              </button>
              <button className="cc-action" disabled>
                <span>Customize spaceship</span>
                <span className="badge">Soon</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
