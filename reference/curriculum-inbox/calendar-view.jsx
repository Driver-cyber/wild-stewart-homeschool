/* Calendar view — month grid showing assigned lessons for current student */

function CalendarView({ studentId, getAssignment, setAssignment, getStatus }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [picker, setPicker] = useState(null); // { date }

  const grid = useMemo(() => window.monthGrid(cursor.year, cursor.month), [cursor]);

  // Build map of date -> [{ entry, kind }]
  const assignmentsByDate = useMemo(() => {
    const map = {};
    window.CURRICULUM.forEach(entry => {
      ['reading','spelling'].forEach(kind => {
        const date = getAssignment(entry.week, kind);
        if (date) {
          if (!map[date]) map[date] = [];
          map[date].push({ entry, kind });
        }
      });
    });
    return map;
  }, [getAssignment]);

  const todayStr = window.todayISO();
  const student = window.STUDENTS.find(s => s.id === studentId);

  const prevMonth = () => setCursor(c => {
    if (c.month === 0) return { year: c.year - 1, month: 11 };
    return { year: c.year, month: c.month - 1 };
  });
  const nextMonth = () => setCursor(c => {
    if (c.month === 11) return { year: c.year + 1, month: 0 };
    return { year: c.year, month: c.month + 1 };
  });
  const jumpToday = () => {
    const d = new Date();
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  // Quick-assign: bulk schedule whole weeks
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkStart, setBulkStart] = useState(todayStr);
  const [bulkFromWeek, setBulkFromWeek] = useState(1);
  const [bulkCount, setBulkCount] = useState(4);

  const runBulk = () => {
    let date = bulkStart;
    for (let i = 0; i < bulkCount; i++) {
      const week = bulkFromWeek + i;
      if (week > window.CURRICULUM.length) break;
      // schedule reading on Monday of week, spelling on Wednesday
      const startMon = window.startOfWeekMonday(new Date(date + 'T00:00:00'));
      const monday = startMon.toISOString().slice(0,10);
      const wednesday = window.addDays(monday, 2);
      setAssignment(week, 'reading', monday);
      setAssignment(week, 'spelling', wednesday);
      date = window.addDays(date, 7);
    }
    setBulkOpen(false);
  };

  return (
    <React.Fragment>
      <div className="header">
        <div>
          <h1><em>Calendar</em> for {student.name}</h1>
          <div className="header-sub">
            See what's coming up. Click a lesson chip to clear it; click an empty day to assign a lesson. Use Bulk schedule to lay out a whole month at once.
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn-secondary" onClick={() => setBulkOpen(o => !o)}>
            {bulkOpen ? 'Close' : 'Bulk schedule'}
          </button>
          <button className="btn-secondary" onClick={jumpToday}>Today</button>
        </div>
      </div>

      {bulkOpen && (
        <div className="bulk-panel">
          <div className="bulk-row">
            <label>Start the week of</label>
            <input type="date" value={bulkStart} onChange={e => setBulkStart(e.target.value)} className="date-input" />
          </div>
          <div className="bulk-row">
            <label>Starting at week</label>
            <select value={bulkFromWeek} onChange={e => setBulkFromWeek(Number(e.target.value))}>
              {window.CURRICULUM.map(c => <option key={c.week} value={c.week}>Week {c.week} — {c.reading.focus}</option>)}
            </select>
          </div>
          <div className="bulk-row">
            <label>How many weeks</label>
            <input type="number" min="1" max="32" value={bulkCount} onChange={e => setBulkCount(Number(e.target.value))} style={{width:80}} />
          </div>
          <button className="btn-primary" onClick={runBulk}>Schedule {bulkCount} weeks</button>
          <div style={{fontSize:12,color:'var(--ink-3)',marginTop:8,fontStyle:'italic',fontFamily:'Fraunces,serif'}}>
            Reading lands on Monday, Spelling on Wednesday of each week.
          </div>
        </div>
      )}

      <div className="calendar">
        <div className="cal-header">
          <button className="cal-nav" onClick={prevMonth}>‹</button>
          <h2 className="cal-month serif">{window.MONTH_NAMES[cursor.month]} {cursor.year}</h2>
          <button className="cal-nav" onClick={nextMonth}>›</button>
        </div>
        <div className="cal-weekdays">
          {window.WEEKDAY_SHORT.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="cal-grid">
          {grid.map(date => {
            const d = new Date(date + 'T00:00:00');
            const inMonth = d.getMonth() === cursor.month;
            const isToday = date === todayStr;
            const assignments = assignmentsByDate[date] || [];
            return (
              <div
                key={date}
                className={`cal-day ${inMonth ? '' : 'out'} ${isToday ? 'today' : ''}`}
                onClick={() => setPicker({ date })}
              >
                <div className="cal-day-num">
                  {d.getDate()}
                  {isToday && <span className="today-tag">today</span>}
                </div>
                <div className="cal-day-items">
                  {assignments.map(({ entry, kind }) => {
                    const status = getStatus(entry.week, kind);
                    return (
                      <button
                        key={`${entry.week}_${kind}`}
                        className={`cal-chip ${kind} status-${status}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Unschedule ${kind} week ${entry.week} (${entry[kind].focus})?`)) {
                            setAssignment(entry.week, kind, '');
                          }
                        }}
                        title={`Week ${entry.week} — ${entry[kind].focus}`}
                      >
                        <span className="cal-chip-week">W{entry.week}</span>
                        <span className="cal-chip-focus">{entry[kind].focus}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {picker && (
        <div className="modal-backdrop" onClick={() => setPicker(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-eyebrow">Assign a lesson</div>
            <h3 className="modal-title serif">{window.formatDate(picker.date)}</h3>
            <div className="modal-body">
              <div style={{maxHeight:340,overflowY:'auto',border:'1px solid var(--line-soft)',borderRadius:8}}>
                {window.CURRICULUM.map(entry => (
                  <div key={entry.week} className="picker-row">
                    <div style={{minWidth:36,fontFamily:'Fraunces,serif',fontSize:18}}>{entry.week}</div>
                    <div style={{flex:1,fontSize:12,color:'var(--ink-2)'}}>
                      <div style={{fontWeight:500,color:'var(--ink)'}}>{entry.unit}</div>
                      <div style={{color:'var(--ink-3)'}}>{entry.reading.focus} · {entry.spelling.focus}</div>
                    </div>
                    <button className="picker-btn reading" onClick={() => { setAssignment(entry.week, 'reading', picker.date); setPicker(null); }}>+ Reading</button>
                    <button className="picker-btn spelling" onClick={() => { setAssignment(entry.week, 'spelling', picker.date); setPicker(null); }}>+ Spelling</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setPicker(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

window.CalendarView = CalendarView;
