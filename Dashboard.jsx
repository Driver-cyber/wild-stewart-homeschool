// Dashboard.jsx
const Dashboard = ({ curriculum, completedLessons, totalStars, currentWeek, onLessonClick, onAdminClick }) => {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const weekLessons = curriculum.filter(l => l.week === currentWeek);
  const completedCount = weekLessons.filter(l => completedLessons.has(l.id)).length;
  const allDone = weekLessons.length > 0 && completedCount === weekLessons.length;

  const getLessonForSubject = (subject) =>
    curriculum.find(l => l.subject === subject && l.week === currentWeek);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h1 className="greeting">Good morning, Lyle!</h1>
          <p className="date-line">{dayName}, {dateStr}</p>
        </div>
        <div className="dash-header-right">
          <div className="star-badge">
            <span className="star-badge-icon">⭐</span>
            <div className="star-badge-info">
              <span className="star-badge-count">{totalStars}</span>
              <span className="star-badge-label">stars</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onAdminClick} title="Curriculum Planning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="22" height="22">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* All done banner */}
      {allDone && (
        <div className="all-done-banner">
          ⭐ All done for the week — amazing work, Lyle! ⭐
        </div>
      )}

      {/* Module grid */}
      <div className="modules-grid">
        {SUBJECT_ORDER.map(subject => {
          const lesson = getLessonForSubject(subject);
          const cfg = SUBJECT_CONFIG[subject];
          const done = lesson && completedLessons.has(lesson.id);
          const empty = !lesson;

          return (
            <div
              key={subject}
              className={`module-card ${done ? 'done' : ''} ${empty ? 'empty' : ''}`}
              style={{ '--sc': cfg.color, '--sb': cfg.bg, '--sl': cfg.light }}
              onClick={() => lesson && !done && onLessonClick(lesson.id)}
              role={lesson && !done ? 'button' : undefined}
            >
              <div className="module-top">
                <div className="module-subject-dot" style={{ background: cfg.color }} />
                <span className="module-subject-label" style={{ color: cfg.color }}>{cfg.label}</span>
                {done && <span className="module-done-check">✓</span>}
              </div>
              <div className="module-title">
                {lesson ? lesson.title : <span className="module-empty-text">No lesson this week</span>}
              </div>
              {lesson && !done && <div className="module-cta">Tap to start →</div>}
              {done && <div className="module-done-msg">Great work!</div>}
            </div>
          );
        })}
      </div>

      {/* Week progress */}
      {weekLessons.length > 0 && (
        <div className="week-progress">
          <div className="week-progress-label">
            <span>{completedCount} of {weekLessons.length} lessons this week</span>
            <span className="week-label">{formatWeekLabel(currentWeek)}</span>
          </div>
          <div className="week-progress-track">
            <div className="week-progress-fill" style={{ width: `${completedCount / weekLessons.length * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Dashboard });
