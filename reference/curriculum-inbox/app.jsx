/* App shell — top tabs + view switching */

function App() {
  const [studentId, setStudentId] = useState(window.STUDENTS[0].id);
  const [state, setState] = useState(window.loadState);
  const [view, setView] = useState('curriculum');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { window.saveState(state); }, [state]);

  const getStatus = useCallback((week, kind) => {
    return state.progress?.[studentId]?.[`${week}_${kind}`] || 'todo';
  }, [state, studentId]);

  const getNote = useCallback((week, kind) => {
    return state.notes?.[studentId]?.[`${week}_${kind}`] || '';
  }, [state, studentId]);

  const getAssignment = useCallback((week, kind) => {
    return state.assignments?.[studentId]?.[`${week}_${kind}`] || '';
  }, [state, studentId]);

  const setStatus = useCallback((week, kind, status) => {
    setState(s => ({
      ...s,
      progress: { ...s.progress, [studentId]: { ...(s.progress?.[studentId] || {}), [`${week}_${kind}`]: status } }
    }));
  }, [studentId]);

  const setNote = useCallback((week, kind, value) => {
    setState(s => ({
      ...s,
      notes: { ...s.notes, [studentId]: { ...(s.notes?.[studentId] || {}), [`${week}_${kind}`]: value } }
    }));
  }, [studentId]);

  const setAssignment = useCallback((week, kind, date) => {
    setState(s => {
      const cur = { ...(s.assignments?.[studentId] || {}) };
      const key = `${week}_${kind}`;
      if (date) cur[key] = date; else delete cur[key];
      return { ...s, assignments: { ...s.assignments, [studentId]: cur } };
    });
  }, [studentId]);

  const stats = useMemo(() => {
    const total = window.CURRICULUM.length * 2;
    let mastered = 0, progress = 0, review = 0;
    window.CURRICULUM.forEach(e => {
      ['reading','spelling'].forEach(k => {
        const s = getStatus(e.week, k);
        if (s === 'mastered') mastered++;
        else if (s === 'progress') progress++;
        else if (s === 'review') review++;
      });
    });
    return { total, mastered, progress, review, todo: total - mastered - progress - review };
  }, [getStatus]);

  const currentStudent = window.STUDENTS.find(s => s.id === studentId);
  const showSidebarFilters = view === 'curriculum';

  const tabs = [
    { id: 'curriculum', label: 'Curriculum', icon: '☰' },
    { id: 'profile', label: 'Profile', icon: '◉' },
    { id: 'sightwords', label: 'Sight words', icon: 'a' },
    { id: 'calendar', label: 'Calendar', icon: '▦' },
    { id: 'diagnostic', label: 'Diagnostic', icon: '✓' },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Phon<em>ix</em></div>
        </div>
        <div className="brand-sub">Kindergarten · Yr 1</div>

        <div className="nav-label">Children</div>
        {window.STUDENTS.map(s => (
          <button
            key={s.id}
            className={`student-pill ${studentId === s.id ? 'active' : ''}`}
            onClick={() => setStudentId(s.id)}
          >
            <span className="student-avatar" style={{background: s.color}}>{s.initial}</span>
            <span>{s.name}</span>
          </button>
        ))}

        <div className="nav-label">Sections</div>
        <div className="nav-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-tab ${view === t.id ? 'active' : ''}`}
              onClick={() => setView(t.id)}
            >
              <span className="nav-tab-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {showSidebarFilters && (
          <React.Fragment>
            <div className="nav-label">Search</div>
            <input
              className="search"
              type="text"
              placeholder="Find a sound, word, week…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="nav-label">Skill area</div>
            <div className="filter-row">
              {[
                { id: 'all', label: 'All' },
                { id: 'sight', label: 'Sight words' },
              ].map(f => (
                <button
                  key={f.id}
                  className={`chip ${filter === f.id ? 'on' : ''}`}
                  onClick={() => setFilter(f.id)}
                >{f.label}</button>
              ))}
            </div>
          </React.Fragment>
        )}

        <div className="nav-label">Progress · {currentStudent.name}</div>
        <div className="progress-block">
          <div className="progress-num">{stats.mastered}<span> / {stats.total}</span></div>
          <div className="progress-label">lessons mastered</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{width: `${(stats.mastered / stats.total) * 100}%`}} />
          </div>
          <div style={{display:'flex',gap:12,marginTop:14,fontSize:11,color:'var(--ink-3)',flexWrap:'wrap'}}>
            <span>● {stats.progress} active</span>
            <span style={{color:'var(--accent)'}}>! {stats.review} review</span>
          </div>
        </div>
      </aside>

      <main className="main">
        {view === 'curriculum' && (
          <window.CurriculumView
            studentId={studentId}
            state={state}
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            getStatus={getStatus}
            setStatus={setStatus}
            getNote={getNote}
            setNote={setNote}
            getAssignment={getAssignment}
            setAssignment={setAssignment}
          />
        )}
        {view === 'profile' && (
          <window.ProfileView
            studentId={studentId}
            getStatus={getStatus}
            setStatus={setStatus}
            getNote={getNote}
            getAssignment={getAssignment}
            setAssignment={setAssignment}
          />
        )}
        {view === 'sightwords' && (
          <window.SightWordsView
            studentId={studentId}
            state={state}
            setState={setState}
          />
        )}
        {view === 'calendar' && (
          <window.CalendarView
            studentId={studentId}
            getAssignment={getAssignment}
            setAssignment={setAssignment}
            getStatus={getStatus}
          />
        )}
        {view === 'diagnostic' && (
          <window.DiagnosticView
            studentId={studentId}
            state={state}
            setState={setState}
          />
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
