import type { LessonState } from '../lib/types'
import { LESSON_STATE_COLORS, LESSON_STATE_LABELS } from '../lib/types'

interface Props {
  state: LessonState
  onChange?: (next: LessonState) => void
  size?: number
  disabled?: boolean
  title?: string
}

const CYCLE: Record<LessonState, LessonState> = {
  todo: 'progress',
  progress: 'mastered',
  mastered: 'review',
  review: 'todo',
}

export default function StatusCircle({ state, onChange, size = 22, disabled, title }: Props) {
  const c = LESSON_STATE_COLORS[state]
  const stroke = state === 'review' ? 2 : 1.5
  const inner = state === 'progress' ? (
    <circle cx={size / 2} cy={size / 2} r={size * 0.18} fill={c.ring} />
  ) : state === 'mastered' ? (
    <path
      d={`M ${size * 0.28} ${size * 0.52} L ${size * 0.45} ${size * 0.68} L ${size * 0.74} ${size * 0.36}`}
      stroke={c.ink}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ) : state === 'review' ? (
    <text
      x={size / 2}
      y={size * 0.72}
      textAnchor="middle"
      fontFamily="'Fraunces', serif"
      fontWeight={700}
      fontStyle="italic"
      fontSize={size * 0.62}
      fill={c.ink}
    >!</text>
  ) : null

  const label = title ?? LESSON_STATE_LABELS[state]
  const interactive = !disabled && !!onChange

  function click(e: React.MouseEvent) {
    e.stopPropagation()
    if (interactive) onChange!(CYCLE[state])
  }

  return (
    <button
      type="button"
      onClick={click}
      disabled={!interactive}
      title={label}
      aria-label={`Status: ${label}${interactive ? ' (tap to advance)' : ''}`}
      className={`inline-flex items-center justify-center rounded-full ${
        interactive ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform' : ''
      }`}
      style={{ width: size, height: size, padding: 0, background: 'transparent', border: 0 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - stroke}
          fill={c.fill}
          stroke={c.ring}
          strokeWidth={stroke}
        />
        {inner}
      </svg>
    </button>
  )
}
