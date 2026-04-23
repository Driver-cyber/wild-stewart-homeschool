// App.jsx — main router + state

const LessonPage = ({ lesson, onBack, onComplete }) => {
  const cfg = SUBJECT_CONFIG[lesson.subject];

  const renderContent = () => {
    switch (lesson.type) {
      case 'reading':           return <ReadingLesson      content={lesson.content} onComplete={onComplete} />;
      case 'spelling':          return <SpellingLesson     content={lesson.content} onComplete={onComplete} />;
      case 'math_stacked':      return <MathLesson         content={lesson.content} onComplete={onComplete} />;
      case 'math_place_value':  return <PlaceValueLesson   content={lesson.content} onComplete={onComplete} />;
      case 'interactive':       return <InteractiveLesson  content={lesson.content} onComplete={onComplete} />;
      case 'general':           return <GeneralLesson      content={lesson.content} onComplete={onComplete} />;
      default:                  return <GeneralLesson      content={lesson.content} onComplete={onComplete} />;
    }
  };

  return (
    <div className="lesson-page" style={{ '--sc': cfg.color, '--sb': cfg.bg, '--sl': cfg.light }}>
      <div className="lesson-nav">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Dashboard
        </button>
        <span className="lesson-subject-pill" style={{ background: cfg.color }}>{cfg.label}</span>
      </div>
      <div className="lesson-hero">
        <h1 className="lesson-page-title">{lesson.title}</h1>
      </div>
      <div className="lesson-body">
        {renderContent()}
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = React.useState('dashboard');
  const [lessonId, setLessonId] = React.useState(null);
  const [celebration, setCelebration] = React.useState(null);

  const [curriculum, setCurriculum] = React.useState(() => {
    try { const s = localStorage.getItem('wsh_curriculum'); return s ? JSON.parse(s) : SAMPLE_CURRICULUM; }
    catch { return SAMPLE_CURRICULUM; }
  });
  const [completed, setCompleted] = React.useState(() => {
    try { const s = localStorage.getItem('wsh_completed'); return s ? new Set(JSON.parse(s)) : new Set(); }
    catch { return new Set(); }
  });
  const [stars, setStars] = React.useState(() => parseInt(localStorage.getItem('wsh_stars') || '0'));
  const [currentWeek, setCurrentWeek] = React.useState(() =>
    localStorage.getItem('wsh_week') || getWeekString(new Date())
  );

  React.useEffect(() => { localStorage.setItem('wsh_curriculum', JSON.stringify(curriculum)); }, [curriculum]);
  React.useEffect(() => { localStorage.setItem('wsh_completed', JSON.stringify([...completed])); }, [completed]);
  React.useEffect(() => { localStorage.setItem('wsh_stars', String(stars)); }, [stars]);
  React.useEffect(() => { localStorage.setItem('wsh_week', currentWeek); }, [currentWeek]);

  const openLesson = (id) => { setLessonId(id); setView('lesson'); };
  const completeLesson = () => {
    const lesson = curriculum.find(l => l.id === lessonId);
    setCompleted(prev => new Set([...prev, lessonId]));
    setStars(s => s + 1);
    setCelebration(lesson);
  };
  const closeCelebration = () => { setCelebration(null); setView('dashboard'); setLessonId(null); };

  const lesson = curriculum.find(l => l.id === lessonId);

  return (
    <div className="app-root">
      {view === 'dashboard' && (
        <Dashboard
          curriculum={curriculum}
          completedLessons={completed}
          totalStars={stars}
          currentWeek={currentWeek}
          onLessonClick={openLesson}
          onAdminClick={() => setView('admin')}
        />
      )}
      {view === 'lesson' && lesson && (
        <LessonPage lesson={lesson} onBack={() => setView('dashboard')} onComplete={completeLesson} />
      )}
      {view === 'admin' && (
        <Admin
          curriculum={curriculum}
          setCurriculum={setCurriculum}
          currentWeek={currentWeek}
          setCurrentWeek={setCurrentWeek}
          onBack={() => setView('dashboard')}
        />
      )}
      {celebration && <Celebration lessonTitle={celebration.title} onClose={closeCelebration} />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
