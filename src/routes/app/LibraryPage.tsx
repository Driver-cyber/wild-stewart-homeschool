import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import type { Lesson } from '../../lib/types'
import { SUBJECTS, subjectColor, subjectLabel } from '../../lib/types'
import { getYouTubeId } from '../../lib/youtube'
import { useAuth } from '../../contexts/AuthContext'

function getPdfUrl(path: string): string {
  return supabase.storage.from('resources').getPublicUrl(path).data.publicUrl
}

export default function LibraryPage() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState<Lesson['subject']>('reading')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function resetForm() {
    setTitle('')
    setDescription('')
    setUrl('')
    setPdfFile(null)
    setUploadProgress('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    let pdfPath: string | null = null

    if (pdfFile) {
      setUploadProgress('Uploading PDF…')
      const safeName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${user.id}/${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(path, pdfFile)

      if (uploadError) {
        setUploadProgress(`Upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }
      pdfPath = path
      setUploadProgress('')
    }

    const { error } = await supabase.from('lessons').insert({
      user_id: user.id,
      title,
      subject,
      description: description.trim() || null,
      resource_url: url.trim() || null,
      pdf_path: pdfPath,
    })

    if (!error) {
      resetForm()
      loadLessons()
    }
    setSaving(false)
  }

  async function handleDelete(lesson: Lesson) {
    if (!window.confirm(`Delete "${lesson.title}"? This can't be undone.`)) return
    if (lesson.pdf_path) {
      await supabase.storage.from('resources').remove([lesson.pdf_path])
    }
    await supabase.from('lessons').delete().eq('id', lesson.id)
    setLessons(prev => prev.filter(l => l.id !== lesson.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-black text-adult-ink tracking-tight">
            Library
          </h2>
          <p className="text-adult-muted mt-1">
            Your curriculum — lessons, links, videos, and worksheets.
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
                  Link <span className="text-adult-muted font-normal">(YouTube auto-embeds)</span>
                </label>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://youtube.com/… or any URL"
                  type="url"
                  className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-adult-ink mb-1.5">
                  Worksheet / PDF
                </label>
                <div
                  className="border-2 border-dashed border-adult-border rounded-xl p-5 text-center cursor-pointer hover:border-adult-accent transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {pdfFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div className="text-left">
                        <div className="font-semibold text-adult-ink text-sm">{pdfFile.name}</div>
                        <div className="text-adult-muted text-xs">
                          {(pdfFile.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                        className="ml-auto text-adult-muted hover:text-red-500 text-sm transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📄</div>
                      <div className="text-adult-muted text-sm font-medium">
                        Click to upload a PDF worksheet
                      </div>
                      <div className="text-adult-muted text-xs mt-1">
                        Make it in Canva, Google Slides, or anywhere
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-adult-ink mb-1.5">
                  Instructions for Lyle
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Short instructions — what should he do first, what to look for, etc."
                  className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent resize-none"
                />
              </div>
            </div>

            {uploadProgress && (
              <p className="text-adult-muted text-sm mb-3">{uploadProgress}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-adult-accent text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? (uploadProgress || 'Saving…') : 'Save lesson'}
              </button>
              <button
                type="button"
                onClick={resetForm}
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
          {lessons.map(lesson => {
            const ytId = lesson.resource_url ? getYouTubeId(lesson.resource_url) : null
            return (
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
                    <p className="text-sm text-adult-muted mt-1 line-clamp-1">
                      {lesson.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {lesson.pdf_path && (
                      <a
                        href={getPdfUrl(lesson.pdf_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-adult-accent hover:underline flex items-center gap-1"
                      >
                        📄 PDF worksheet
                      </a>
                    )}
                    {lesson.resource_url && (
                      <a
                        href={lesson.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-adult-muted hover:text-adult-accent transition-colors truncate max-w-xs flex items-center gap-1"
                      >
                        {ytId ? '▶ YouTube' : '🔗 Link'}
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(lesson)}
                  className="text-adult-muted hover:text-red-500 transition-colors text-sm opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
