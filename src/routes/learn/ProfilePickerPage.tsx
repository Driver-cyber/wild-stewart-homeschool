import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../lib/types'

export default function ProfilePickerPage() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .order('created_at')
      .then(({ data }) => {
        setProfiles((data ?? []) as Profile[])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-learner-bg flex items-center justify-center font-rounded">
        <div className="text-learner-muted text-xl">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-learner-bg font-rounded flex flex-col items-center justify-center p-8">
      <h1 className="font-display text-5xl font-black text-learner-ink tracking-tight mb-2 text-center">
        Wild Stewart Homeschool
      </h1>
      <p className="text-learner-muted text-2xl font-bold mb-14">Who's here?</p>

      {profiles.length === 0 ? (
        <p className="text-learner-muted text-lg">
          No profiles set up yet. Ask a grown-up!
        </p>
      ) : (
        <div className="flex flex-wrap gap-8 justify-center">
          {profiles.map(profile => (
            <button
              key={profile.id}
              onClick={() => navigate(`/learn/${profile.id}`)}
              className="flex flex-col items-center gap-4 p-6 rounded-3xl hover:scale-105 active:scale-95 transition-transform"
              style={{ backgroundColor: profile.color + '22' }}
            >
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-6xl shadow-lg"
                style={{ backgroundColor: profile.color }}
              >
                {profile.avatar_emoji}
              </div>
              <span className="font-bold text-2xl text-learner-ink">{profile.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
