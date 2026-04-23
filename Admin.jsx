// Admin.jsx
const Admin = ({ curriculum, setCurriculum, currentWeek, setCurrentWeek, onBack }) => {
  const [tab, setTab] = React.useState('schedule');
  const [dragOver, setDragOver] = React.useState(false);
  const [uploadMsg, setUploadMsg] = React.useState('');

  // Collect all unique weeks from curriculum + current
  const allWeeks = React.useMemo(() => {
    const ws = new Set(curriculum.map(l => l.week).filter(Boolean));
    ws.add(currentWeek);
    // Add next 4 weeks
    const now = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(now); d.setDate(d.getDate() + i * 7);
      ws.add(getWeekString(d));
    }
    return [...ws].sort();
  }, [curriculum, currentWeek]);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSVCurriculum(e.target.result);
      if (parsed.length > 0) {
        setCurriculum(curr => {
          const keep = curr.filter(l => !parsed.find(p => p.id === l.id));
          return [...keep, ...parsed];
        });
        setUploadMsg(`✓ Loaded ${parsed.length} lesson${parsed.length > 1 ? 's' : ''} from CSV`);
      } else {
        setUploadMsg('⚠ No lessons found — check the CSV format below.');
      }
    };
    reader.readAsText(file);
  };

  const toggleSchedule = (lessonId) => {
    setCurriculum(curr => curr.map(l => {
      if (l.id !== lessonId) return l;
      return { ...l, week: l.week === currentWeek ? (l._prevWeek || '') : currentWeek, _prevWeek: l.week };
    }));
  };

  const CSV_EXAMPLE = `id,subject,title,type,week,content
r010,reading,The WH Sound,reading,2026-W20,"{""sound"":""WH"",""soundDescription"":""WH says wh!"",""words"":[""when"",""where"",""what""],""sentences"":[""Where did it go?"",""What is that?""]}"`

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Dashboard
        </button>
        <h2 className="admin-title">Curriculum Planning</h2>
      </div>

      <div className="admin-tab-bar">
        {['schedule','upload'].map(t => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'schedule' ? '📅 Schedule' : '📄 Upload CSV'}
          </button>
        ))}
      </div>

      {tab === 'schedule' && (
        <div className="schedule-panel">
          <div className="week-pick-row">
            <label className="week-pick-label">Active Week</label>
            <select className="week-select" value={currentWeek} onChange={e => setCurrentWeek(e.target.value)}>
              {allWeeks.map(w => (
                <option key={w} value={w}>{w} · {formatWeekLabel(w)}{w === getWeekString(new Date()) ? ' (this week)' : ''}</option>
              ))}
            </select>
          </div>

          <p className="schedule-hint">Check the lessons you want to appear in Lyle's dashboard for this week.</p>

          {SUBJECT_ORDER.map(subject => {
            const cfg = SUBJECT_CONFIG[subject];
            const lessons = curriculum.filter(l => l.subject === subject);
            if (lessons.length === 0) return null;
            return (
              <div key={subject} className="subject-block">
                <div className="subject-block-header" style={{ color: cfg.color, borderColor: cfg.light }}>
                  <div className="subject-block-dot" style={{ background: cfg.color }} />
                  {cfg.label}
                </div>
                {lessons.map(lesson => {
                  const scheduled = lesson.week === currentWeek;
                  return (
                    <label key={lesson.id} className={`lesson-row ${scheduled ? 'scheduled' : ''}`}>
                      <input type="checkbox" checked={scheduled} onChange={() => toggleSchedule(lesson.id)} />
                      <span className="lesson-row-title">{lesson.title}</span>
                      {lesson.week && lesson.week !== currentWeek && lesson.week !== '' && (
                        <span className="lesson-week-chip">{lesson.week}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'upload' && (
        <div className="upload-panel">
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <div className="drop-icon">📄</div>
            <p className="drop-text">Drag & drop a CSV file here</p>
            <p className="drop-or">— or —</p>
            <label className="browse-btn">
              Browse files
              <input type="file" accept=".csv,.txt" hidden onChange={e => handleFile(e.target.files[0])} />
            </label>
          </div>

          {uploadMsg && <div className={`upload-msg ${uploadMsg.startsWith('✓') ? 'ok' : 'warn'}`}>{uploadMsg}</div>}

          <div className="csv-guide">
            <h4>CSV Format</h4>
            <pre className="csv-pre">{CSV_EXAMPLE}</pre>
            <div className="csv-notes">
              <p><strong>Subjects:</strong> reading, writing, math, science, social_studies</p>
              <p><strong>Types:</strong> reading, spelling, math_stacked, general</p>
              <p><strong>Week format:</strong> YYYY-Www (e.g. 2026-W20)</p>
              <p><strong>Content:</strong> JSON object matching the lesson type — see examples above</p>
            </div>

            <h4 style={{marginTop:'1.5rem'}}>Future roadmap</h4>
            <div className="roadmap-list">
              {['Direct editing on iPad without a CSV file','Month-view calendar to plan ahead','Sync with Google Sheets via link'].map((item, i) => (
                <div key={i} className="roadmap-item">
                  <span className="roadmap-dot" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Admin });
