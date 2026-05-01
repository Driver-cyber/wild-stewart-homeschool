import type { CSSProperties, ReactNode } from 'react'
import type { SpaceshipConfig } from '../lib/types'
import { DEFAULT_SHIP } from '../lib/types'

interface Props {
  config: SpaceshipConfig | null
  size?: number
  className?: string
  style?: CSSProperties
}

const HULL_PATHS: Record<SpaceshipConfig['hull'], string> = {
  round: 'M28 50 Q28 22, 50 22 Q72 22, 72 50 Q72 72, 60 75 L40 75 Q28 72, 28 50 Z',
  classic: 'M50 18 L70 45 L70 75 L30 75 L30 45 Z',
  angular: 'M50 20 L70 36 L68 78 L32 78 L30 36 Z',
}

const DECAL_EMOJI: Record<SpaceshipConfig['decal'], string> = {
  none: '',
  star: '⭐',
  lightning: '⚡',
  heart: '❤️',
  flame: '🔥',
  moon: '🌙',
}

function darkenHex(hex: string, amount = 60): string {
  const c = hex.replace('#', '')
  if (c.length !== 6) return hex
  const r = Math.max(0, parseInt(c.slice(0, 2), 16) - amount)
  const g = Math.max(0, parseInt(c.slice(2, 4), 16) - amount)
  const b = Math.max(0, parseInt(c.slice(4, 6), 16) - amount)
  return `rgb(${r}, ${g}, ${b})`
}

function Engines({ kind }: { kind: SpaceshipConfig['engine'] }): ReactNode {
  if (kind === 'single') {
    return (
      <path
        d="M40 74 L60 74 L57 90 L43 90 Z"
        fill="#3a3f4a"
        stroke="#1f2330"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    )
  }
  if (kind === 'double') {
    return (
      <>
        <path
          d="M30 74 L42 74 L40 88 L32 88 Z"
          fill="#3a3f4a"
          stroke="#1f2330"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M58 74 L70 74 L68 88 L60 88 Z"
          fill="#3a3f4a"
          stroke="#1f2330"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </>
    )
  }
  return (
    <>
      <path
        d="M40 74 L60 74 L57 88 L43 88 Z"
        fill="#3a3f4a"
        stroke="#1f2330"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M44 88 L56 88 L52 96 L48 96 Z" fill="#FF8C42" />
      <path d="M46 91 L54 91 L51 97 L49 97 Z" fill="#FFD27A" />
    </>
  )
}

export default function Spaceship({
  config,
  size = 64,
  className,
  style,
}: Props) {
  const c = config ?? DEFAULT_SHIP
  const hullPath = HULL_PATHS[c.hull]
  const stroke = darkenHex(c.color, 60)
  const decalEmoji = DECAL_EMOJI[c.decal]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
        ...style,
      }}
    >
      <Engines kind={c.engine} />
      <path
        d={hullPath}
        fill={c.color}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="42" cy="34" rx="8" ry="5" fill="rgba(255,255,255,0.28)" />
      <circle
        cx="50"
        cy="40"
        r="7"
        fill="rgba(180, 220, 255, 0.95)"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.5"
      />
      <ellipse cx="48" cy="38" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.75)" />
      {decalEmoji && (
        <text
          x="50"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
        >
          {decalEmoji}
        </text>
      )}
    </svg>
  )
}
