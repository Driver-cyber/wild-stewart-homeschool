import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Profile, SpaceshipConfig } from '../../lib/types'
import { SHIP_COLORS, DEFAULT_SHIP } from '../../lib/types'
import Spaceship from '../../components/Spaceship'

const HULL_OPTIONS: { value: SpaceshipConfig['hull']; label: string }[] = [
  { value: 'round', label: 'Bubble' },
  { value: 'classic', label: 'Classic' },
  { value: 'angular', label: 'Sharp' },
]

const ENGINE_OPTIONS: { value: SpaceshipConfig['engine']; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Twin' },
  { value: 'plasma', label: 'Plasma' },
]

const DECAL_OPTIONS: {
  value: SpaceshipConfig['decal']
  label: string
  glyph: string
}[] = [
  { value: 'none', label: 'None', glyph: '∅' },
  { value: 'star', label: 'Star', glyph: '⭐' },
  { value: 'lightning', label: 'Bolt', glyph: '⚡' },
  { value: 'heart', label: 'Heart', glyph: '❤️' },
  { value: 'flame', label: 'Fire', glyph: '🔥' },
  { value: 'moon', label: 'Moon', glyph: '🌙' },
]

export default function ShipCustomizerPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [config, setConfig] = useState<SpaceshipConfig>(DEFAULT_SHIP)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profileId) return
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId!)
        .single()
      if (data) {
        setProfile(data as Profile)
        if (data.spaceship_config) {
          setConfig(data.spaceship_config as SpaceshipConfig)
        }
      }
      setLoading(false)
    }
    load()
  }, [profileId])

  async function save() {
    if (!profileId) return
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('profiles')
      .update({ spaceship_config: config })
      .eq('id', profileId)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/learn')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center text-white/70 font-rounded">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2236] via-[#0a0e1c] to-[#05070f] font-rounded text-white">
      <div className="max-w-md mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/learn')}
            className="text-white/70 hover:text-white text-sm font-semibold"
          >
            ← Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded-full bg-white text-[#0a0e1c] text-sm font-bold disabled:opacity-50 active:scale-95 transition-transform"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <h1 className="font-display text-3xl font-black mb-1">
          {profile?.name}'s ship
        </h1>
        <p className="text-white/50 text-sm mb-4">Make it yours</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-center my-6">
          <div className="bg-white/5 rounded-full p-8 border border-white/10">
            <Spaceship config={config} size={170} />
          </div>
        </div>

        <Section title="Hull">
          <div className="grid grid-cols-3 gap-2">
            {HULL_OPTIONS.map(o => (
              <OptionTile
                key={o.value}
                selected={config.hull === o.value}
                onClick={() => setConfig({ ...config, hull: o.value })}
                label={o.label}
              >
                <Spaceship config={{ ...config, hull: o.value }} size={56} />
              </OptionTile>
            ))}
          </div>
        </Section>

        <Section title="Color">
          <div className="grid grid-cols-8 gap-2">
            {SHIP_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => setConfig({ ...config, color: c.value })}
                aria-label={c.label}
                className={`w-full aspect-square rounded-full border-2 transition-transform active:scale-95 ${
                  config.color === c.value
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-white/20'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </Section>

        <Section title="Engine">
          <div className="grid grid-cols-3 gap-2">
            {ENGINE_OPTIONS.map(o => (
              <OptionTile
                key={o.value}
                selected={config.engine === o.value}
                onClick={() => setConfig({ ...config, engine: o.value })}
                label={o.label}
              >
                <Spaceship config={{ ...config, engine: o.value }} size={56} />
              </OptionTile>
            ))}
          </div>
        </Section>

        <Section title="Decal">
          <div className="grid grid-cols-6 gap-2">
            {DECAL_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setConfig({ ...config, decal: o.value })}
                aria-label={o.label}
                className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl transition-transform active:scale-95 ${
                  config.decal === o.value
                    ? 'bg-white/15 border-white scale-105'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {o.glyph}
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}

function OptionTile({
  selected,
  onClick,
  label,
  children,
}: {
  selected: boolean
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-transform active:scale-95 ${
        selected
          ? 'bg-white/10 border-white scale-105'
          : 'bg-white/5 border-white/10'
      }`}
    >
      {children}
      <span className="text-xs font-semibold text-white/85">{label}</span>
    </button>
  )
}
