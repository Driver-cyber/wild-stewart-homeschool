import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Lesson } from '../../lib/types'
import { SUBJECTS, subjectColor, subjectLabel } from '../../lib/types'
import { useAuth } from '../../contexts/AuthContext'

export default function LibraryPage() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState<Lesson['subject']>('reading')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadLessons() }, [])

  async function loadLessons() {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .order('subject')
      .order('title')
    setLessons((data ?? []) as Lesson[])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    const { error } = await supabase.from('lessons').insert({
      user_id: user.id,
      title,
      subject,
      description: description.trim() || null,
      resource_url: url.trim() || null,
    })

    if (!error) {
      setTitle('')
      setDescription('')
      setUrl('')
      setShowForm(false)
      loadLessons()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('lessons').delete().eq('id', id)
    setLessons(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-black text-adult-ink tracking-tight">
            Library
          </h2>
          <p className="text-adult-muted mt-1">
            Your curriculum content — lessons, links, and resources.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-adult-accent text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          + Add lesson
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-adult-border rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="font-display text-xl font-bold text-adult-ink mb-5">New lesson</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-adult-ink mb-1.5">Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Digraph: SH words"
                  className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-adult-ink mb-1.5">Subject *</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value as Lesson['subject'])}
                  className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent"
                >
                  {SUBJECTS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-adult-ink mb-1.5">
                  Resource URL
                </label>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://…"
                  type="url"
                  className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-adult-ink mb-1.5">
                  Notes for Lyle
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What should Lyle do? Instructions, context, what to look for."
                  className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-adult-accent text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? 'Saving…' : 'Save lesson'}
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

      {loading ? (
        <p className="text-adult-muted">Loading…</p>
      ) : lessons.length === 0 ? (
        <div className="bg-white border border-adult-border rounded-2xl p-16 text-center">
          <p className="text-adult-muted text-lg font-medium mb-1">No lessons yet.</p>
          <p className="text-adult-muted text-sm">Add your first one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lessons.map(lesson => (
            <div
              key={lesson.id}
              className="bg-white border border-adult-border rounded-xl p-5 flex items-start gap-4 group"
            >
              <div
                className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
                style={{ backgroundColor: subjectColor(lesson.subject) }}
              />
              <div className="flex-1 min-w-0">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: subjectColor(lesson.subject) }}
                >
                  {subjectLabel(lesson.subject)}
                </span>
                <h3 className="font-semibold text-adult-ink mt-0.5">{lesson.title}</h3>
                {lesson.description && (
                  <p className="text-sm text-adult-muted mt-1 line-clamp-2">
                    {lesson.description}
                  </p>
                )}
                {lesson.resource_url && (
                  <a
                    href={lesson.resource_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-adult-accent mt-1 inline-block hover:underline max-w-xs truncate"
                  >
                    {lesson.resource_url}
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDelete(lesson.id)}
                className="text-adult-muted hover:text-red-500 transition-colors text-sm opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
