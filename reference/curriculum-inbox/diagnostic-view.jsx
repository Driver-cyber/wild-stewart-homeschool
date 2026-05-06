/* Diagnostic view — per-unit assessments */

function DiagnosticUnit({ diagnostic, studentId, state, setState }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [results, setResults] = useState(() => {
    const saved = state.diagnostics?.[studentId]?.[diagnostic.id];
    return saved?.items || diagnostic.items.map(() => null);
  });
  const [date, setDate] = useState(() => state.diagnostics?.[studentId]?.[diagnostic.id]?.date || '');

  useEffect(() => {
    if (!active) return;
    setState(s => ({
      ...s,
      diagnostics: {
        ...s.diagnostics,
        [studentId]: {
          ...(s.diagnostics?.[studentId] || {}),
          [diagnostic.id]: { items: results, date }
        }
      }
    }));
  }, [results, date, active]);

  const setResult = (i, val) => {
    setResults(r => { const n = [...r]; n[i] = val; return n; });
    setActive(true);
  };

  const correct = results.filter(r => r === true).length;
  const wrong = results.filter(r => r === false).length;
  const answered = correct + wrong;
  const total = diagnostic.items.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const completed = answered === total;

  let level = '—';
  let levelColor = 'var(--ink-3)';
  if (completed) {
    if (pct >= 90) { level = 'Mastered'; levelColor = 'var(--sage)'; }
    else if (pct >= 70) { level = 'Almost there'; levelColor = 'var(--amber)'; }
    else if (pct >= 40) { level = 'Practicing'; levelColor = 'var(--amber)'; }
    else { level = 'Just starting'; levelColor = 'var(--accent)'; }
  } else if (answered > 0) {
    level = 'In progress';
  }

  const reset = () => {
    setResults(diagnostic.items.map(() => null));
    setDate('');
    setActive(true);
  };

  return (
    <div className={`diag-unit ${open ? 'open' : ''}`}>
      <button className="diag-head" onClick={() => setOpen(o => !o)}>
        <span className="bucket-chevron">{open ? '▾' : '▸'}</span>
        <div className="diag-head-main">
          <div className="diag-head-title serif">{diagnostic.unit}</div>
          <div className="diag-head-sub">Weeks {diagnostic.weeks[0]}–{diagnostic.weeks[diagnostic.weeks.length-1]} · {total} word check + {diagnostic.spelling.length} spelling</div>
        </div>
        <div className="diag-head-score">
          {answered > 0 ? (
            <React.Fragment>
              <div className="serif" style={{fontSize:24,letterSpacing:'-0.02em',color:levelColor}}>{correct}<span style={{color:'var(--ink-3)',fontSize:14}}>/{total}</span></div>
              <div style={{fontSize:11,color:levelColor,letterSpacing:'0.06em',textTransform:'uppercase'}}>{level}</div>
            </React.Fragment>
          ) : (
            <div style={{fontSize:11,color:'var(--ink-3)',letterSpacing:'0.06em',textTransform:'uppercase'}}>Not started</div>
          )}
        </div>
      </button>
      {open && (
        <div className="diag-body">
          <div className="diag-instructions">
            <div className="detail-eyebrow">How to give</div>
            <p>{diagnostic.description}</p>
            <ul className="bullet-list">
              <li><strong style={{color:'var(--ink)',fontWeight:500}}>Reading:</strong> Show each word one at a time. Mark ✓ if read correctly within 3 seconds.</li>
              <li><strong style={{color:'var(--ink)',fontWeight:500}}>Spelling:</strong> Dictate each word; child writes. Mark ✓ if spelled correctly.</li>
              <li><strong style={{color:'var(--ink)',fontWeight:500}}>No coaching</strong> — this is a snapshot, not a lesson.</li>
            </ul>
          </div>

          <div className="diag-section">
            <div className="section-label">Reading words</div>
            <div className="diag-grid">
              {diagnostic.items.map((item, i) => (
                <div key={i} className={`diag-item ${results[i] === true ? 'ok' : results[i] === false ? 'no' : ''}`}>
                  <div className="diag-word">{item.word}</div>
                  <div className="diag-pattern">{item.pattern}</div>
                  <div className="diag-marks">
                    <button
                      type="button"
                      className={`mark-btn ok ${results[i] === true ? 'on' : ''}`}
                      onClick={() => setResult(i, results[i] === true ? null : true)}
                      aria-label="correct"
                    >✓</button>
                    <button
                      type="button"
                      className={`mark-btn no ${results[i] === false ? 'on' : ''}`}
                      onClick={() => setResult(i, results[i] === false ? null : false)}
                      aria-label="incorrect"
                    >✗</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="diag-section">
            <div className="section-label">Spelling dictation</div>
            <div className="diag-grid">
              {diagnostic.spelling.map((word, i) => (
                <div key={`s${i}`} className="diag-item plain">
                  <div className="diag-word">{word}</div>
                  <div className="diag-pattern">dictate</div>
                </div>
              ))}
            </div>
          </div>

          <div className="diag-footer">
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--ink-3)'}}>Date given</label>
              <input type="date" className="date-input" value={date} onChange={(e) => { setDate(e.target.value); setActive(true); }} />
            </div>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              {answered > 0 && (
                <div style={{fontSize:12,color:'var(--ink-2)'}}>
                  <strong style={{color:'var(--ink)'}}>{correct} correct</strong> · {wrong} miss · <span style={{color:'var(--ink-3)'}}>{total - answered} remaining</span>
                </div>
              )}
              <button className="btn-secondary" onClick={reset}>Reset</button>
            </div>
          </div>

          {completed && (
            <div className="diag-recommendation">
              <div className="detail-eyebrow">Recommendation</div>
              {pct >= 90 && <div>Strong mastery of {diagnostic.unit}. Move on. Mark all {diagnostic.unit} weeks as Mastered in the curriculum view.</div>}
              {pct >= 70 && pct < 90 && <div>Almost there — review the {wrong} missed pattern{wrong>1?'s':''} this week, then move on.</div>}
              {pct >= 40 && pct < 70 && <div>Practicing. Stay in this unit. Re-teach the patterns the child missed and reassess in 2 weeks.</div>}
              {pct < 40 && <div>Just starting. Spend more time in the prior unit's foundations before re-teaching {diagnostic.unit}.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DiagnosticView({ studentId, state, setState }) {
  const student = window.STUDENTS.find(s => s.id === studentId);

  return (
    <React.Fragment>
      <div className="header">
        <div>
          <h1><em>Diagnostic</em> assessment</h1>
          <div className="header-sub">
            One quick check per unit for {student.name}. Each test takes 5 minutes — read the words aloud, mark ✓ or ✗, then dictate the spelling list. The score tells you what to teach next.
          </div>
        </div>
        <div style={{fontSize:11,color:'var(--ink-3)',maxWidth:200,textAlign:'right',lineHeight:1.5}}>
          <strong style={{color:'var(--sage)'}}>90%+</strong> mastered · <strong style={{color:'var(--amber)'}}>70%+</strong> almost · <strong style={{color:'var(--accent)'}}>under 40%</strong> needs foundation
        </div>
      </div>

      <div className="diag-list">
        {window.DIAGNOSTICS.map(d => (
          <DiagnosticUnit
            key={d.id}
            diagnostic={d}
            studentId={studentId}
            state={state}
            setState={setState}
          />
        ))}
      </div>
    </React.Fragment>
  );
}

window.DiagnosticView = DiagnosticView;
