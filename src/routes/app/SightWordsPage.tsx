import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { LessonState, Profile, SightWordStateRow } from '../../lib/types'
import { LESSON_STATE_COLORS, LESSON_STATE_LABELS, latestStateByKey } from '../../lib/types'
import { useAuth } from '../../contexts/AuthContext'
import { SIGHT_WORDS, SIGHT_WORDS_FLAT } from '../../data/sight-words'

const CYCLE: Record<LessonState, LessonState> = {
  todo: 'progress',
  progress: 'mastered',
  mastered: 'review',
  review: 'todo',
}

export default function SightWordsPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stateByWord, setStateByWord] = useState<Map<string, LessonState>>(new Map())
  const [seedingCatalog, setSeedingCatalog] = useState(false)
  const [catalogReady, setCatalogReady] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { void boot() }, [])

  async function boot() {
    const [{ data: pData }, { data: catalog }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('sight_words').select('id').limit(1),
    ])
    const ps = (pData ?? []) as Profile[]
    setProfiles(ps)
    if (ps.length > 0) setProfile(ps[0])
    setCatalogReady((catalog ?? []).length > 0)
    setLoading(false)
  }

  useEffect(() => {
    if (!profile) { setStateByWord(new Map()); return }
    void loadStates(profile.id)
  }, [profile])

  async function loadStates(profileId: string) {
    const { data } = await supabase
      .from('sight_word_states')
      .select('id, user_id, profile_id, word, state, created_at')
      .eq('profile_id', profileId)
    const events = (data ?? []) as SightWordStateRow[]
    const latest = latestStateByKey(events, e => e.word.toLowerCase())
    const out = new Map<string, LessonState>()
    for (const [k, v] of latest) out.set(k, v.state)
    setStateByWord(out)
  }

  async function seedCatalog() {
    if (!user || seedingCatalog) return
    setSeedingCatalog(true)
    const rows = SIGHT_WORDS_FLAT.map(w => ({
      user_id: user.id,
      word: w.word,
      tier: w.tier,
    }))
    const { error } = await supabase
      .from('sight_words')
      .upsert(rows, { onConflict: 'user_id,word', ignoreDuplicates: true })
    if (error) {
      alert(`Seed failed: ${error.message}`)
    } else {
      setCatalogReady(true)
    }
    setSeedingCatalog(false)
  }

  async function cycle(word: string) {
    if (!user || !profile) return
    const current = stateByWord.get(word.toLowerCase()) ?? 'todo'
    const next = CYCLE[current]
    setStateByWord(prev => {
      const m = new Map(prev)
      m.set(word.toLowerCase(), next)
      return m
    })
    const { error } = await supabase.from('sight_word_states').insert({
      user_id: user.id,
      profile_id: profile.id,
      word,
      state: next,
    })
    if (error) loadStates(profile.id)
  }

  const counts = useMemo(() => {
    const c: Record<LessonState, number> = { todo: 0, progress: 0, review: 0, mastered: 0 }
    for (const tier of SIGHT_WORDS) {
      for (const w of tier.words) {
        const s = stateByWord.get(w.toLowerCase()) ?? 'todo'
        c[s]++
      }
    }
    return c
  }, [stateByWord])

  if (loading) return <p className="text-adult-muted">Loading…</p>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-3xl font-black text-adult-ink tracking-tight">Sight Words</h2>
          <p className="text-adult-muted mt-1">
            Tap a word to cycle through its status. Mastered words drive curriculum personalization.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {profiles.length > 0 && (
            <select
              value={profile?.id ?? ''}
              onChange={e => setProfile(profiles.find(p => p.id === e.target.value) ?? null)}
              className="px-3 py-2 rounded-lg border border-adult-border bg-white text-adult-ink text-sm font-medium focus:outline-none"
            >
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          {!catalogReady && (
            <button
              onClick={seedCatalog}
              disabled={seedingCatalog}
              className="bg-adult-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {seedingCatalog ? 'Seeding…' : 'Seed sight word catalog'}
            </button>
          )}
        </div>
      </div>

      {/* Counts bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(['todo', 'progress', 'review', 'mastered'] as LessonState[]).map(s => {
          const c = LESSON_STATE_COLORS[s]
          return (
            <div
              key={s}
              className="bg-white border rounded-xl px-4 py-3"
              style={{ borderColor: c.ring }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: c.ring }}>
                {LESSON_STATE_LABELS[s]}
              </div>
              <div className="font-display text-2xl font-black text-adult-ink mt-1">{counts[s]}</div>
            </div>
          )
        })}
      </div>

      {/* Tier grids */}
      <div className="space-y-6">
        {SIGHT_WORDS.map(tier => (
          <div key={tier.tier} className="bg-white border border-adult-border rounded-2xl p-5">
            <div className="flex items-baseline gap-3 mb-3">
              <h3 className="font-display text-lg font-bold text-adult-ink">{tier.label}</h3>
              <span className="text-xs text-adult-muted">{tier.words.length} words</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tier.words.map(word => {
                const state = stateByWord.get(word.toLowerCase()) ?? 'todo'
                const colors = LESSON_STATE_COLORS[state]
                return (
                  <button
                    key={word}
                    type="button"
                    onClick={() => cycle(word)}
                    title={`${word} — ${LESSON_STATE_LABELS[state]} (tap to advance)`}
                    className="font-mono text-sm px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: colors.fill !== 'transparent' ? colors.fill : '#fff',
                      border: `1.5px solid ${colors.ring}`,
                      color: state === 'mastered' ? '#fff' : colors.ring,
                      fontWeight: 600,
                    }}
                  >
                    {word}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
