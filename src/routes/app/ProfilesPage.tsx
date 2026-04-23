import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../lib/types'
import { useAuth } from '../../contexts/AuthContext'

const COLORS = [
  { label: 'Amber',    value: '#E8970A' },
  { label: 'Red',      value: '#D94F4F' },
  { label: 'Teal',     value: '#2AADAD' },
  { label: 'Green',    value: '#3E9E3E' },
  { label: 'Purple',   value: '#7B4FCC' },
  { label: 'Blue',     value: '#3B82F6' },
]

const EMOJIS = ['⭐', '🦁', '🐢', '🚀', '🦊', '🐬', '🌈', '🦄', '🐉', '🎯']

export default function ProfilesPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0].value)
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadProfiles() }, [])

  async function loadProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setProfiles(data ?? [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    const { error } = await supabase.from('profiles').insert({
      user_id: user.id,
      name,
      color,
      avatar_emoji: emoji,
    })

    if (!error) {
      setName('')
      setColor(COLORS[0].value)
      setEmoji(EMOJIS[0])
      setShowForm(false)
      loadProfiles()
    }
    setSaving(false)
  }

  async function handleDelete(profile: Profile) {
    if (!window.confirm(`Remove "${profile.name}"? Their assignments and progress will be deleted.`)) return
    await supabase.from('profiles').delete().eq('id', profile.id)
    setProfiles(prev => prev.filter(p => p.id !== profile.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-black text-adult-ink tracking-tight">
            Learner Profiles
          </h2>
          <p className="text-adult-muted mt-1">The kids who use this on their iPad.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-adult-accent text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          + Add profile
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-adult-border rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="font-display text-xl font-bold text-adult-ink mb-5">New learner</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-adult-ink mb-1.5">Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Lyle"
                className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-adult-ink mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-9 h-9 rounded-full transition-transform hover:scale-110 ${color === c.value ? 'ring-2 ring-offset-2 ring-adult-ink scale-110' : ''}`}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-adult-ink mb-2">Avatar</label>
              <div className="flex gap-2 flex-wrap">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-11 h-11 text-2xl rounded-xl transition-transform hover:scale-110 ${emoji === e ? 'ring-2 ring-adult-ink bg-adult-bg scale-110' : 'bg-adult-bg'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="bg-adult-accent text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-lg font-semibold text-adult-muted hover:text-adult-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {profiles.length === 0 && !showForm ? (
        <div className="bg-white border border-adult-border rounded-2xl p-12 text-center">
          <p className="text-adult-muted text-lg font-medium mb-1">No learners yet.</p>
          <p className="text-adult-muted text-sm">Add Lyle to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map(p => (
            <div
              key={p.id}
              className="bg-white border border-adult-border rounded-xl p-5 flex items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: p.color }}
              >
                {p.avatar_emoji}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-adult-ink text-lg">{p.name}</div>
              </div>
              <button
                onClick={() => handleDelete(p)}
                className="text-adult-muted hover:text-red-500 transition-colors text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
