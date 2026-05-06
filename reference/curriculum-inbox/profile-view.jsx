/* Profile view — collapsible To do / In progress / Needs review / Mastered per student */

function ProfileBucket({ title, count, color, items, expanded, onToggle, getNote, setStatus, setAssignment, getAssignment }) {
  return (
    <div className={`bucket ${expanded ? 'open' : ''}`}>
      <button type="button" className="bucket-head" onClick={onToggle}>
        <span className="bucket-chevron">{expanded ? '▾' : '▸'}</span>
        <span className="bucket-dot" style={{background: color, borderColor: color}} />
        <span className="bucket-title">{title}</span>
        <span className="bucket-count">{count}</span>
      </button>
      {expanded && (
        <div className="bucket-body">
          {items.length === 0 ? (
            <div className="bucket-empty">Nothing here yet.</div>
          ) : (
            items.map(({ entry, kind, lesson, status }) => {
              const note = getNote(entry.week, kind);
              const assign = getAssignment(entry.week, kind);
              return (
                <div key={`${entry.week}_${kind}`} className="bucket-item">
                  <div className="bucket-item-week">
                    <span className="serif" style={{fontSize:20,letterSpacing:'-0.02em'}}>{String(entry.week).padStart(2,'0')}</span>
                    <span style={{fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-3)'}}>Wk</span>
                  </div>
                  <div className="bucket-item-body">
                    <div style={{display:'flex',gap:8,alignItems:'baseline',marginBottom:3}}>
                      <span className={`skill-tag ${kind}`}>{kind === 'reading' ? 'Reading' : 'Spelling'}</span>
                      <span style={{fontSize:11,color:'var(--ink-3)'}}>{entry.unit}</span>
                    </div>
                    <div className="bucket-item-focus">{lesson.focus}</div>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap',marginTop:6}}>
                      {(lesson.words || []).slice(0, 5).map((w, i) => <span key={i} className="word-pill">{w}</span>)}
                    </div>
                    {note && (
                      <div className="bucket-note">"{note}"</div>
                    )}
                  </div>
                  <div className="bucket-item-actions">
                    {assign && <div className="bucket-assigned">📅 {window.formatDate(assign)}</div>}
                    <select
                      className="bucket-status-select"
                      value={status}
                      onChange={(e) => setStatus(entry.week, kind, e.target.value)}
                    >
                      {window.STATUS_ORDER.map(s => <option key={s} value={s}>{window.STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function ProfileView({ studentId, getStatus, setStatus, getNote, getAssignment, setAssignment }) {
  const [open, setOpen] = useState({ todo: true, progress: true, review: true, mastered: false });
  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));

  const buckets = useMemo(() => {
    const out = { todo: [], progress: [], review: [], mastered: [] };
    window.CURRICULUM.forEach(entry => {
      ['reading','spelling'].forEach(kind => {
        const status = getStatus(entry.week, kind);
        const lesson = entry[kind];
        out[status].push({ entry, kind, lesson, status });
      });
    });
    return out;
  }, [getStatus]);

  const student = window.STUDENTS.find(s => s.id === studentId);
  const total = window.CURRICULUM.length * 2;
  const mastered = buckets.mastered.length;
  const pct = Math.round((mastered / total) * 100);

  return (
    <React.Fragment>
      <div className="header">
        <div>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:10}}>
            <span className="student-avatar" style={{background: student.color, width: 44, height: 44, fontSize: 20}}>{student.initial}</span>
            <h1 style={{margin:0}}><em>{student.name}'s</em> profile</h1>
          </div>
          <div className="header-sub">
            All 64 lessons (32 weeks × 2 tracks) sorted by status. Open any bucket to see what's there. Change status from the dropdown on each lesson.
          </div>
        </div>
        <div className="profile-stats">
          <div>
            <div className="profile-stat-num serif">{mastered}<span style={{color:'var(--ink-3)'}}> / {total}</span></div>
            <div className="profile-stat-label">Mastered · {pct}%</div>
          </div>
          <div>
            <div className="profile-stat-num serif" style={{color:'var(--amber)'}}>{buckets.progress.length}</div>
            <div className="profile-stat-label">In progress</div>
          </div>
          <div>
            <div className="profile-stat-num serif" style={{color:'var(--accent)'}}>{buckets.review.length}</div>
            <div className="profile-stat-label">Needs review</div>
          </div>
        </div>
      </div>

      <div className="buckets">
        <ProfileBucket
          title="To do"
          count={buckets.todo.length}
          color="oklch(0.93 0.008 75)"
          items={buckets.todo}
          expanded={open.todo}
          onToggle={() => toggle('todo')}
          getNote={getNote}
          setStatus={setStatus}
          setAssignment={setAssignment}
          getAssignment={getAssignment}
        />
        <ProfileBucket
          title="In progress"
          count={buckets.progress.length}
          color="oklch(0.68 0.10 70)"
          items={buckets.progress}
          expanded={open.progress}
          onToggle={() => toggle('progress')}
          getNote={getNote}
          setStatus={setStatus}
          setAssignment={setAssignment}
          getAssignment={getAssignment}
        />
        <ProfileBucket
          title="Needs review"
          count={buckets.review.length}
          color="oklch(0.55 0.11 38)"
          items={buckets.review}
          expanded={open.review}
          onToggle={() => toggle('review')}
          getNote={getNote}
          setStatus={setStatus}
          setAssignment={setAssignment}
          getAssignment={getAssignment}
        />
        <ProfileBucket
          title="Mastered"
          count={buckets.mastered.length}
          color="oklch(0.58 0.07 150)"
          items={buckets.mastered}
          expanded={open.mastered}
          onToggle={() => toggle('mastered')}
          getNote={getNote}
          setStatus={setStatus}
          setAssignment={setAssignment}
          getAssignment={getAssignment}
        />
      </div>
    </React.Fragment>
  );
}

window.ProfileView = ProfileView;
