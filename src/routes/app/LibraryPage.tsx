import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import type { Lesson, QuizQuestion } from '../../lib/types'
import { SUBJECTS, subjectColor, subjectLabel } from '../../lib/types'
import { getYouTubeId } from '../../lib/youtube'
import { useAuth } from '../../contexts/AuthContext'

function getStorageUrl(path: string): string {
  return supabase.storage.from('resources').getPublicUrl(path).data.publicUrl
}

function pathToFilename(path: string): string {
  return path.split('/').pop()?.replace(/^\d+-/, '') ?? path
}

// ─── File picker UI ───────────────────────────────────────────────────────────

interface FilePickerProps {
  file: File | null
  existingPath: string | null
  accept: string
  label: string
  hint: string
  icon: string
  inputRef: React.RefObject<HTMLInputElement>
  onFile: (f: File | null) => void
  onClear: () => void
}

function FilePicker({ file, existingPath, accept, label, hint, icon, inputRef, onFile, onClear }: FilePickerProps) {
  const hasNew = !!file
  const hasExisting = !!existingPath && !file

  return (
    <div>
      <label className="block text-sm font-semibold text-adult-ink mb-1.5">{label}</label>
      <div
        className="border-2 border-dashed border-adult-border rounded-xl p-4 text-center cursor-pointer hover:border-adult-accent transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {hasNew ? (
          <div className="flex items-center gap-3">
            <span className="text-xl flex-shrink-0">{icon}</span>
            <div className="text-left flex-1 min-w-0">
              <div className="font-semibold text-adult-ink text-sm truncate">{file!.name}</div>
              <div className="text-adult-muted text-xs">{(file!.size / 1024 / 1024).toFixed(1)} MB</div>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onClear() }}
              className="text-adult-muted hover:text-red-500 text-sm transition-colors flex-shrink-0"
            >
              Remove
            </button>
          </div>
        ) : hasExisting ? (
          <div className="flex items-center gap-3">
            <span className="text-xl flex-shrink-0">{icon}</span>
            <div className="text-left flex-1 min-w-0">
              <div className="font-semibold text-adult-ink text-sm truncate">{pathToFilename(existingPath!)}</div>
              <div className="text-adult-muted text-xs">Click to replace</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-adult-muted text-sm font-medium">{hint}</div>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => onFile(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}

// ─── Quiz builder ─────────────────────────────────────────────────────────────

function QuizEditor({ questions, onChange }: { questions: QuizQuestion[]; onChange: (q: QuizQuestion[]) => void }) {
  function addQuestion() {
    if (questions.length >= 5) return
    onChange([...questions, { type: 'multiple_choice', question: '', options: ['', '', '', ''], answer_index: 0 }])
  }

  function removeQuestion(idx: number) {
    onChange(questions.filter((_, i) => i !== idx))
  }

  function updateQ(idx: number, updates: Partial<QuizQuestion>) {
    onChange(questions.map((q, i) => (i === idx ? { ...q, ...updates } : q)))
  }

  function updateOption(qIdx: number, optIdx: number, value: string) {
    onChange(
      questions.map((q, i) => {
        if (i !== qIdx) return q
        const opts = [...(q.options ?? ['', '', '', ''])]
        opts[optIdx] = value
        return { ...q, options: opts }
      }),
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="border border-adult-border rounded-xl p-4 bg-adult-bg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-adult-ink">Question {qi + 1}</span>
            <button
              type="button"
              onClick={() => removeQuestion(qi)}
              className="text-adult-muted hover:text-red-500 text-xs transition-colors"
            >
              Remove
            </button>
          </div>

          <select
            value={q.type}
            onChange={e => {
              const t = e.target.value as QuizQuestion['type']
              updateQ(qi, {
                type: t,
                options: t === 'multiple_choice' ? ['', '', '', ''] : undefined,
                answer_index: t === 'multiple_choice' ? 0 : undefined,
                sentence: t === 'word_order' ? (q.sentence ?? '') : undefined,
              })
            }}
            className="w-full px-3 py-2 rounded-lg border border-adult-border bg-white text-adult-ink text-sm focus:outline-none focus:ring-2 focus:ring-adult-accent mb-3"
          >
            <option value="multiple_choice">Multiple choice</option>
            <option value="word_order">Put words in order</option>
          </select>

          {q.type === 'multiple_choice' && (
            <>
              <input
                value={q.question}
                onChange={e => updateQ(qi, { question: e.target.value })}
                placeholder="Question text…"
                className="w-full px-3 py-2 rounded-lg border border-adult-border bg-white text-adult-ink text-sm focus:outline-none focus:ring-2 focus:ring-adult-accent mb-3"
              />
              <div className="space-y-2">
                {(q.options ?? ['', '', '', '']).map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.answer_index === oi}
                      onChange={() => updateQ(qi, { answer_index: oi })}
                      className="accent-adult-accent flex-shrink-0"
                    />
                    <input
                      value={opt}
                      onChange={e => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}…`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-adult-border bg-white text-adult-ink text-sm focus:outline-none focus:ring-2 focus:ring-adult-accent"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-adult-muted mt-2">Select the radio button next to the correct answer.</p>
            </>
          )}

          {q.type === 'word_order' && (
            <>
              <input
                value={q.question}
                onChange={e => updateQ(qi, { question: e.target.value })}
                placeholder='Instruction (e.g. "Put the words in the right order")'
                className="w-full px-3 py-2 rounded-lg border border-adult-border bg-white text-adult-ink text-sm focus:outline-none focus:ring-2 focus:ring-adult-accent mb-2"
              />
              <input
                value={q.sentence ?? ''}
                onChange={e => updateQ(qi, { sentence: e.target.value })}
                placeholder="The correct sentence — words will be shuffled for Lyle"
                className="w-full px-3 py-2 rounded-lg border border-adult-border bg-white text-adult-ink text-sm focus:outline-none focus:ring-2 focus:ring-adult-accent"
              />
              {q.sentence && (
                <p className="text-xs text-adult-muted mt-1">
                  Words: {q.sentence.split(' ').filter(Boolean).join(' · ')}
                </p>
              )}
            </>
          )}
        </div>
      ))}

      {questions.length < 5 && (
        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-2.5 border-2 border-dashed border-adult-border rounded-xl text-sm font-semibold text-adult-muted hover:border-adult-accent hover:text-adult-accent transition-colors"
        >
          + Add question{questions.length > 0 ? ` (${questions.length}/5)` : ''}
        </button>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // form — core
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState<Lesson['subject']>('reading')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [url2, setUrl2] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  // form — file uploads
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [existingPdfPath, setExistingPdfPath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [contentImageFile, setContentImageFile] = useState<File | null>(null)
  const [existingContentImagePath, setExistingContentImagePath] = useState<string | null>(null)
  const contentImageInputRef = useRef<HTMLInputElement>(null)

  // form — quiz
  const [quizEnabled, setQuizEnabled] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])

  // form — offline / external lesson (library book, piano, field trip, etc.)
  const [isOffline, setIsOffline] = useState(false)

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
    setEditingId(null)
    setTitle('')
    setSubject('reading')
    setDescription('')
    setUrl('')
    setUrl2('')
    setPdfFile(null)
    setExistingPdfPath(null)
    setContentImageFile(null)
    setExistingContentImagePath(null)
    setQuizEnabled(false)
    setQuizQuestions([])
    setIsOffline(false)
    setUploadProgress('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (contentImageInputRef.current) contentImageInputRef.current.value = ''
    setShowForm(false)
  }

  function startEdit(lesson: Lesson) {
    setEditingId(lesson.id)
    setTitle(lesson.title)
    setSubject(lesson.subject)
    setDescription(lesson.description ?? '')
    setUrl(lesson.resource_url ?? '')
    setUrl2(lesson.resource_url_2 ?? '')
    setExistingPdfPath(lesson.pdf_path)
    setExistingContentImagePath(lesson.content_image_path)
    setPdfFile(null)
    setContentImageFile(null)
    if (lesson.quiz_questions && lesson.quiz_questions.length > 0) {
      setQuizEnabled(true)
      setQuizQuestions(lesson.quiz_questions)
    } else {
      setQuizEnabled(false)
      setQuizQuestions([])
    }
    setIsOffline(lesson.is_offline)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function uploadFile(file: File, pathPrefix: string): Promise<string | null> {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${pathPrefix}/${Date.now()}-${safeName}`
    const { error } = await supabase.storage.from('resources').upload(path, file)
    if (error) {
      setUploadProgress(`Upload failed: ${error.message}`)
      return null
    }
    return path
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    let pdfPath: string | null = existingPdfPath
    let contentImagePath: string | null = existingContentImagePath

    if (pdfFile) {
      setUploadProgress('Uploading file…')
      if (existingPdfPath) await supabase.storage.from('resources').remove([existingPdfPath])
      pdfPath = await uploadFile(pdfFile, user.id)
      if (!pdfPath) { setSaving(false); return }
      setUploadProgress('')
    }

    if (contentImageFile) {
      setUploadProgress('Uploading image…')
      if (existingContentImagePath) await supabase.storage.from('resources').remove([existingContentImagePath])
      contentImagePath = await uploadFile(contentImageFile, `${user.id}/images`)
      if (!contentImagePath) { setSaving(false); return }
      setUploadProgress('')
    }

    const payload = {
      title,
      subject,
      description: description.trim() || null,
      resource_url: url.trim() || null,
      resource_url_2: url2.trim() || null,
      pdf_path: pdfPath,
      content_image_path: contentImagePath,
      quiz_questions: quizEnabled && quizQuestions.length > 0 ? quizQuestions : null,
      is_offline: isOffline,
    }

    if (editingId) {
      const { error } = await supabase.from('lessons').update(payload).eq('id', editingId)
      if (!error) { resetForm(); loadLessons() }
    } else {
      const { error } = await supabase.from('lessons').insert({ user_id: user.id, ...payload })
      if (!error) { resetForm(); loadLessons() }
    }

    setSaving(false)
  }

  async function handleDelete(lesson: Lesson) {
    if (!window.confirm(`Delete "${lesson.title}"? This can't be undone.`)) return
    const toRemove: string[] = []
    if (lesson.pdf_path) toRemove.push(lesson.pdf_path)
    if (lesson.content_image_path) toRemove.push(lesson.content_image_path)
    if (toRemove.length > 0) await supabase.storage.from('resources').remove(toRemove)
    await supabase.from('lessons').delete().eq('id', lesson.id)
    setLessons(prev => prev.filter(l => l.id !== lesson.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-black text-adult-ink tracking-tight">Library</h2>
          <p className="text-adult-muted mt-1">Your curriculum — lessons, links, videos, and worksheets.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-adult-accent text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            + Add lesson
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-adult-border rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="font-display text-xl font-bold text-adult-ink mb-5">
            {editingId ? 'Edit lesson' : 'New lesson'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

              {/* Title */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-semibold text-adult-ink mb-1.5">Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Digraph: SH words"
                  className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent"
                />
              </div>

              {/* Subject */}
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

              {/* Offline / external lesson toggle */}
              <div className="col-span-1 sm:col-span-2 -mb-1">
                <div
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-adult-bg/60 border border-adult-border"
                  onClick={() => setIsOffline(v => !v)}
                >
                  <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isOffline ? 'bg-adult-accent' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isOffline ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-adult-ink">Offline lesson</span>
                    <span className="text-sm text-adult-muted ml-2">A library book, piano practice, field trip — anything that happens away from the screen. Lyle just checks it off when done.</span>
                  </div>
                </div>
              </div>

              {/* Link 1 */}
              <div>
                <label className="block text-sm font-semibold text-adult-ink mb-1.5">
                  Link 1 <span className="text-adult-muted font-normal">(YouTube auto-embeds)</span>
                </label>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://youtube.com/… or any URL"
                  type="url"
                  className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent"
                />
              </div>

              {/* Link 2 */}
              <div>
                <label className="block text-sm font-semibold text-adult-ink mb-1.5">
                  Link 2 <span className="text-adult-muted font-normal">(optional)</span>
                </label>
                <input
                  value={url2}
                  onChange={e => setUrl2(e.target.value)}
                  placeholder="https://…"
                  type="url"
                  className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent"
                />
              </div>

              {/* Worksheet / file upload */}
              <div className="col-span-1 sm:col-span-2">
                <FilePicker
                  file={pdfFile}
                  existingPath={existingPdfPath}
                  accept="application/pdf,image/*,.doc,.docx"
                  label="Worksheet / File"
                  hint="PDF, image, or Word doc — make it in Canva, Google Slides, anywhere"
                  icon="📄"
                  inputRef={fileInputRef}
                  onFile={f => { setPdfFile(f); if (fileInputRef.current && !f) fileInputRef.current.value = '' }}
                  onClear={() => { setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                />
              </div>

              {/* Instructions */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-semibold text-adult-ink mb-1.5">
                  Instructions for Lyle
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Short instructions — what should he do first, what to look for, etc. URLs you type here will be tappable."
                  className="w-full px-4 py-2.5 rounded-lg border border-adult-border bg-adult-bg text-adult-ink focus:outline-none focus:ring-2 focus:ring-adult-accent resize-none"
                />
              </div>

              {/* Inline image */}
              <div className="col-span-1 sm:col-span-2">
                <FilePicker
                  file={contentImageFile}
                  existingPath={existingContentImagePath}
                  accept="image/*"
                  label="Inline image (optional)"
                  hint="Displays in the lesson alongside the instructions — maps, diagrams, charts"
                  icon="🖼️"
                  inputRef={contentImageInputRef}
                  onFile={f => { setContentImageFile(f); if (contentImageInputRef.current && !f) contentImageInputRef.current.value = '' }}
                  onClear={() => { setContentImageFile(null); if (contentImageInputRef.current) contentImageInputRef.current.value = '' }}
                />
              </div>
            </div>

            {/* Quiz toggle + builder */}
            <div className="border-t border-adult-border pt-4 mb-4">
              <div
                className="flex items-center gap-3 cursor-pointer mb-4"
                onClick={() => setQuizEnabled(v => !v)}
              >
                <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${quizEnabled ? 'bg-adult-accent' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${quizEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-adult-ink">Add a quiz</span>
                  <span className="text-sm text-adult-muted ml-2">Up to 5 questions, plays after the lesson</span>
                </div>
              </div>

              {quizEnabled && (
                <QuizEditor questions={quizQuestions} onChange={setQuizQuestions} />
              )}
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
                {saving ? (uploadProgress || 'Saving…') : (editingId ? 'Update lesson' : 'Save lesson')}
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
            const ytId2 = lesson.resource_url_2 ? getYouTubeId(lesson.resource_url_2) : null
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
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: subjectColor(lesson.subject) }}
                    >
                      {subjectLabel(lesson.subject)}
                    </span>
                    {lesson.is_offline && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-adult-bg text-adult-muted">
                        Offline
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-adult-ink mt-0.5">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-sm text-adult-muted mt-1 line-clamp-1">{lesson.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {lesson.pdf_path && (
                      <a
                        href={getStorageUrl(lesson.pdf_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-adult-accent hover:underline flex items-center gap-1"
                      >
                        📄 File
                      </a>
                    )}
                    {lesson.content_image_path && (
                      <span className="text-xs text-adult-muted flex items-center gap-1">🖼️ Image</span>
                    )}
                    {lesson.resource_url && (
                      <a
                        href={lesson.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-adult-muted hover:text-adult-accent transition-colors truncate max-w-[160px]"
                      >
                        {ytId ? '▶ YouTube' : '🔗 Link 1'}
                      </a>
                    )}
                    {lesson.resource_url_2 && (
                      <a
                        href={lesson.resource_url_2}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-adult-muted hover:text-adult-accent transition-colors truncate max-w-[160px]"
                      >
                        {ytId2 ? '▶ YouTube' : '🔗 Link 2'}
                      </a>
                    )}
                    {lesson.quiz_questions && lesson.quiz_questions.length > 0 && (
                      <span className="text-xs text-adult-muted">
                        🧩 {lesson.quiz_questions.length}Q quiz
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => startEdit(lesson)}
                    className="text-adult-muted hover:text-adult-accent transition-colors text-sm"
                    title="Edit lesson"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(lesson)}
                    className="text-adult-muted hover:text-red-500 transition-colors text-sm"
                    title="Delete lesson"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
