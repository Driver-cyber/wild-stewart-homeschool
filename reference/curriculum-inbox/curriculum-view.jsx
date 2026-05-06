/* Curriculum view (the original inbox) */

function StatusButton({ status, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      className={`status-btn ${status === 'todo' ? '' : status}`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={ariaLabel}
      title={window.STATUS_LABELS[status]}
    />
  );
}

function WordPills({ words, max = 6 }) {
  if (!Array.isArray(words)) return null;
  const shown = words.slice(0, max);
  const extra = words.length - shown.length;
  return (
    <div className="lesson-words">
      {shown.map((w, i) => <span key={i} className="word-pill">{w}</span>)}
      {extra > 0 && <span className="word-pill more">+{extra} more</span>}
    </div>
  );
}

function LessonDetail({ kind, lesson, status, note, assignment, onStatus, onNote, onAssign }) {
  return (
    <div className="detail-col">
      <div className="detail-eyebrow">
        <span className={`skill-tag ${kind}`}>{kind === 'reading' ? 'Reading' : 'Spelling'}</span>
        &nbsp;&nbsp;{lesson.focus}
      </div>
      <h3 className="detail-title">{lesson.title || lesson.focus}</h3>
      <p className="detail-summary">{lesson.summary || lesson.pattern}</p>

      {kind === 'spelling' && lesson.pattern && (
        <div className="section">
          <div className="section-label">Spelling rule</div>
          <div style={{fontSize:13,color:'var(--ink)',lineHeight:1.5}}>{lesson.pattern}</div>
        </div>
      )}

      <div className="section">
        <div className="section-label">Example words</div>
        <div className="word-grid">
          {(lesson.words || []).map((w, i) => <span key={i} className="word-pill">{w}</span>)}
        </div>
      </div>

      {lesson.sightWords && lesson.sightWords.length > 0 && (
        <div className="section">
          <div className="section-label" style={{display:'flex',alignItems:'center',gap:8}}>
            <span>Sight words this week</span>
            {lesson._personalized && (
              <span className="adapted-badge" title="Adapted to skip sight words your child has already mastered">
                <span className="adapted-mark">✦</span> Adapted
              </span>
            )}
          </div>
          <div className="word-grid">
            {lesson.sightWords.map((w, i) => (
              <span key={i} className="word-pill" style={{background:'var(--accent-soft)',color:'var(--accent)',borderColor:'var(--accent-soft)'}}>{w}</span>
            ))}
          </div>
          {lesson._personalized && (
            <div className="swap-summary">
              <span className="swap-summary-label">Swapped out:</span>
              {Object.entries(lesson._personalized.swaps).map(([from, to], i) => (
                <span key={i} className="swap-pair">
                  <span className="swap-from">{from}</span>
                  <span className="swap-arrow">→</span>
                  <span className="swap-to">{to}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {lesson.sentence && (
        <div className="section">
          <div className="section-label">Practice sentence</div>
          <div className="example-sentence">“{lesson.sentence}”</div>
          {lesson._personalized && lesson._personalized.original.sentence !== lesson.sentence && (
            <div className="original-sentence">
              <span className="original-sentence-label">Original:</span>
              “{lesson._personalized.original.sentence}”
            </div>
          )}
        </div>
      )}

      {lesson.activity && (
        <div className="section">
          <div className="section-label">Activity — no materials</div>
          <div className="activity-card">
            <span className="activity-kind">{lesson.activity.kind}</span>
            <div className="activity-name">{lesson.activity.name}</div>
            <div className="activity-body">{lesson.activity.body}</div>
          </div>
        </div>
      )}

      {lesson.song && (
        <div className="section">
          <div className="section-label">Song / chant</div>
          <div className="song-card">
            <div className="song-icon">♪</div>
            <div className="song-text">{lesson.song}</div>
          </div>
        </div>
      )}

      {lesson.prereqs && lesson.prereqs.length > 0 && (
        <div className="section">
          <div className="section-label">Prerequisites</div>
          <ul className="bullet-list">
            {lesson.prereqs.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

      {lesson.mistakes && lesson.mistakes.length > 0 && (
        <div className="section">
          <div className="section-label">Common mistakes</div>
          <ul className="bullet-list">
            {lesson.mistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {lesson.check && (
        <div className="section">
          <div className="section-label">Quick check</div>
          <div className="check-card"><strong>Pass when:</strong> {lesson.check}</div>
        </div>
      )}

      <div className="section" style={{marginTop:24,paddingTop:18,borderTop:'1px solid var(--line-soft)'}}>
        <div className="section-label">Status, assign & notes</div>
        <div className="status-row">
          {window.STATUS_ORDER.map(s => (
            <button
              key={s}
              type="button"
              data-s={s}
              className={`status-action ${status === s ? 'active' : ''}`}
              onClick={() => onStatus(s)}
            >
              <span className="dot" />
              {window.STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div style={{marginTop:12,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--ink-3)'}}>Assigned date</label>
          <input
            type="date"
            value={assignment || ''}
            onChange={(e) => onAssign(e.target.value)}
            className="date-input"
          />
          {assignment && (
            <button className="status-action" onClick={() => onAssign('')}>Clear</button>
          )}
        </div>
        <div className="notes-box">
          <textarea
            placeholder="Notes for this child — what worked, what to revisit…"
            value={note || ''}
            onChange={(e) => onNote(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function WeekRow({ entry, idx, expanded, onToggle, getStatus, getNote, getAssignment, setStatus, setNote, setAssignment, prevUnit }) {
  const showUnitDivider = entry.unit !== prevUnit;
  const readStatus = getStatus(entry.week, 'reading');
  const spellStatus = getStatus(entry.week, 'spelling');
  const readNote = getNote(entry.week, 'reading');
  const spellNote = getNote(entry.week, 'spelling');
  const readAssign = getAssignment(entry.week, 'reading');
  const spellAssign = getAssignment(entry.week, 'spelling');

  const cycle = (cur) => {
    const i = window.STATUS_ORDER.indexOf(cur);
    return window.STATUS_ORDER[(i + 1) % window.STATUS_ORDER.length];
  };

  return (
    <React.Fragment>
      {showUnitDivider && (
        <div className="unit-divider">
          <span className="unit-roman">Unit</span>
          <span className="unit-name">{entry.unit}</span>
          <span className="unit-meta">Week {entry.week} →</span>
        </div>
      )}
      <div className="week-row">
        <div className="week-num">
          <div className="week-num-big">{String(entry.week).padStart(2, '0')}</div>
          <div className="week-num-label">Week</div>
          <div className="unit-tag">{entry.unit}</div>
        </div>

        <div
          className={`lesson-cell ${expanded === 'reading' ? 'expanded' : ''}`}
          onClick={() => onToggle('reading')}
        >
          <div className="lesson-head">
            <StatusButton
              status={readStatus}
              onClick={() => setStatus(entry.week, 'reading', cycle(readStatus))}
              ariaLabel={`Reading status: ${window.STATUS_LABELS[readStatus]}`}
            />
            <div className="lesson-content">
              <span className="skill-tag reading">Reading</span>
              <div className="lesson-focus">{entry.reading.focus}</div>
              <div className="lesson-title">{entry.reading.title}</div>
              <WordPills words={entry.reading.words} />
            </div>
          </div>
          {readAssign && <span className="has-note" style={{color:'var(--ink-3)',fontStyle:'normal',fontFamily:'Inter'}}>📅 {window.formatDate(readAssign)}</span>}
          {!readAssign && readNote && <span className="has-note">— note</span>}
          <div className="chevron">{expanded === 'reading' ? '▴' : '▾'}</div>
        </div>

        <div
          className={`lesson-cell ${expanded === 'spelling' ? 'expanded' : ''}`}
          onClick={() => onToggle('spelling')}
        >
          <div className="lesson-head">
            <StatusButton
              status={spellStatus}
              onClick={() => setStatus(entry.week, 'spelling', cycle(spellStatus))}
              ariaLabel={`Spelling status: ${window.STATUS_LABELS[spellStatus]}`}
            />
            <div className="lesson-content">
              <span className="skill-tag spelling">Spelling</span>
              <div className="lesson-focus">{entry.spelling.focus}</div>
              <div className="lesson-title">
                {entry.spelling.sightWords ? `Sight words: ${entry.spelling.sightWords.join(', ')}` : ''}
                {entry.spelling._personalized && (
                  <span className="adapted-badge adapted-inline" title="Adapted to skip mastered sight words">
                    <span className="adapted-mark">✦</span> Adapted
                  </span>
                )}
              </div>
              <WordPills words={[...(entry.spelling.words || []), ...(entry.spelling.sightWords || [])]} />
            </div>
          </div>
          {spellAssign && <span className="has-note" style={{color:'var(--ink-3)',fontStyle:'normal',fontFamily:'Inter'}}>📅 {window.formatDate(spellAssign)}</span>}
          {!spellAssign && spellNote && <span className="has-note">— note</span>}
          <div className="chevron">{expanded === 'spelling' ? '▴' : '▾'}</div>
        </div>
      </div>
      {expanded && (
        <div className="detail">
          <div className="detail-inner">
            {expanded === 'reading' ? (
              <LessonDetail
                kind="reading"
                lesson={entry.reading}
                status={readStatus}
                note={readNote}
                assignment={readAssign}
                onStatus={(s) => setStatus(entry.week, 'reading', s)}
                onNote={(n) => setNote(entry.week, 'reading', n)}
                onAssign={(d) => setAssignment(entry.week, 'reading', d)}
              />
            ) : (
              <LessonDetail
                kind="spelling"
                lesson={entry.spelling}
                status={spellStatus}
                note={spellNote}
                assignment={spellAssign}
                onStatus={(s) => setStatus(entry.week, 'spelling', s)}
                onNote={(n) => setNote(entry.week, 'spelling', n)}
                onAssign={(d) => setAssignment(entry.week, 'spelling', d)}
              />
            )}
            <div className="detail-col" style={{background:'var(--paper)',padding:'28px 36px'}}>
              <div className="detail-eyebrow">How to teach spelling</div>
              <h3 className="detail-title">Encoding step-by-step</h3>
              <p className="detail-summary">A child who can read a word can't always spell it. Encoding works the opposite direction: hear → segment → write.</p>

              <div className="section">
                <div className="section-label">The 4-step method</div>
                <ul className="bullet-list" style={{fontSize:14}}>
                  <li><strong style={{color:'var(--ink)',fontWeight:500}}>1. Say the word slowly.</strong> Say it back together, stretching it: "shhh-iiii-p".</li>
                  <li><strong style={{color:'var(--ink)',fontWeight:500}}>2. Tap or push for each sound.</strong> One tap per sound — not per letter. "ship" = 3 sounds: /sh/ /i/ /p/. Use fingers, beans, or pennies.</li>
                  <li><strong style={{color:'var(--ink)',fontWeight:500}}>3. Match sounds to letters.</strong> Ask "what letter(s) make /sh/?" Child writes 'sh'. Then /i/ → 'i'. Then /p/ → 'p'.</li>
                  <li><strong style={{color:'var(--ink)',fontWeight:500}}>4. Read it back.</strong> Run a finger under the word and read it. If it sounds wrong, fix it.</li>
                </ul>
              </div>

              <div className="section">
                <div className="section-label">Spelling list — dictate these</div>
                <div className="word-grid">
                  {(entry.spelling.words || []).map((w, i) => (
                    <span key={i} className="word-pill" style={{fontSize:13,padding:'4px 10px',background:'var(--paper-2)',border:'1px solid var(--line)'}}>{w}</span>
                  ))}
                </div>
                <div style={{fontSize:12,color:'var(--ink-3)',marginTop:8,fontStyle:'italic',fontFamily:'Fraunces,serif'}}>
                  Say each word in a short sentence so it's clear, then dictate just the word. 4 a day is plenty.
                </div>
              </div>

              {entry.spelling.sightWords && entry.spelling.sightWords.length > 0 && (
                <div className="section">
                  <div className="section-label" style={{display:'flex',alignItems:'center',gap:8}}>
                    <span>Sight word spelling</span>
                    {entry.spelling._personalized && (
                      <span className="adapted-badge" title="Adapted to skip mastered sight words">
                        <span className="adapted-mark">✦</span> Adapted
                      </span>
                    )}
                  </div>
                  <div className="word-grid">
                    {entry.spelling.sightWords.map((w, i) => (
                      <span key={i} className="word-pill" style={{fontSize:13,padding:'4px 10px',background:'var(--accent-soft)',color:'var(--accent)',borderColor:'var(--accent-soft)'}}>{w}</span>
                    ))}
                  </div>
                  <div style={{fontSize:12,color:'var(--ink-3)',marginTop:8,fontStyle:'italic',fontFamily:'Fraunces,serif'}}>
                    Sight words are memorized by sight + by tapping the regular parts. For "the", tap /th/ (regular) + /uh/ (heart part — the tricky bit).
                  </div>
                </div>
              )}

              <div className="section">
                <div className="section-label">If they get stuck</div>
                <ul className="bullet-list">
                  <li>Don't tell them the answer. Say "what sound comes next?" and have them stretch the word again.</li>
                  <li>Cover one letter at a time as you check — left to right.</li>
                  <li>Three misses in a row = stop. Re-teach the pattern tomorrow.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

function CurriculumView({ studentId, state, search, setSearch, filter, setFilter, getStatus, setStatus, getNote, setNote, getAssignment, setAssignment }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpanded = (week, kind) => {
    setExpanded(e => {
      if (e[week] === kind) { const n = { ...e }; delete n[week]; return n; }
      return { ...e, [week]: kind };
    });
  };

  /* Personalize curriculum based on this student's mastered sight words.
     Mastered sight words get swapped out of each lesson for fresh ones, and
     the practice sentence is rewritten to match. */
  const mastered = useMemo(
    () => window.getMasteredSightWords ? window.getMasteredSightWords(state, studentId) : new Set(),
    [state?.sightWords, studentId]
  );
  const personalizedCurriculum = useMemo(
    () => window.personalizeEntry
      ? window.CURRICULUM.map(e => window.personalizeEntry(e, mastered))
      : window.CURRICULUM,
    [mastered]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return personalizedCurriculum.filter(entry => {
      if (filter === 'sight') {
        if (!(entry.spelling.sightWords && entry.spelling.sightWords.length > 0)) return false;
      }
      if (!q) return true;
      const hay = JSON.stringify(entry).toLowerCase();
      return hay.includes(q);
    });
  }, [search, filter, personalizedCurriculum]);

  const adaptedCount = useMemo(
    () => personalizedCurriculum.filter(e => e.reading._personalized || e.spelling._personalized).length,
    [personalizedCurriculum]
  );
  const masteredCount = mastered.size;

  return (
    <React.Fragment>
      <div className="header">
        <div>
          <h1>A year of <em>reading & spelling</em></h1>
          <div className="header-sub">
            Structured phonics for kindergarteners who already know their letter sounds — 32 weeks of digraphs, blends, vowel teams, and bossy R, with sight words layered in. Click any lesson to open examples, an activity, and a quick check. Use Assign to schedule it on the calendar.
          </div>
        </div>
        <div className="legend">
          <span className="legend-item"><span className="legend-dot todo"></span>To do</span>
          <span className="legend-item"><span className="legend-dot progress"></span>In progress</span>
          <span className="legend-item"><span className="legend-dot review"></span>Needs review</span>
          <span className="legend-item"><span className="legend-dot mastered"></span>Mastered</span>
        </div>
      </div>

      <div className="track-headers">
        <div>Wk.</div>
        <div className="track-title">Reading <span className="track-title-sub">Decode · Read aloud</span></div>
        <div className="track-title">Spelling <span className="track-title-sub">Encode · Sight words</span></div>
      </div>

      {adaptedCount > 0 && (
        <div className="adapt-banner">
          <span className="adapt-banner-mark">✦</span>
          <div className="adapt-banner-text">
            <strong>Curriculum adapted for this child.</strong>
            <span> {masteredCount} sight word{masteredCount === 1 ? '' : 's'} marked mastered — {adaptedCount} lesson{adaptedCount === 1 ? '' : 's'} updated with fresh sight words and rewritten practice sentences.</span>
          </div>
          <span className="adapt-banner-hint">Mark more in <em>Sight words</em> to refresh further.</span>
        </div>
      )}

      {filtered.map((entry, i) => (
        <WeekRow
          key={entry.week}
          entry={entry}
          idx={i}
          expanded={expanded[entry.week]}
          onToggle={(kind) => toggleExpanded(entry.week, kind)}
          getStatus={getStatus}
          getNote={getNote}
          getAssignment={getAssignment}
          setStatus={setStatus}
          setNote={setNote}
          setAssignment={setAssignment}
          prevUnit={i > 0 ? filtered[i-1].unit : null}
        />
      ))}

      <div style={{padding:'40px 48px 60px',color:'var(--ink-3)',fontSize:12,fontStyle:'italic',fontFamily:'Fraunces, serif',textAlign:'center',borderTop:'1px solid var(--line-soft)'}}>
        End of Year One. Next: short stories, multi-syllable words, and beginning chapter books.
      </div>
    </React.Fragment>
  );
}

window.CurriculumView = CurriculumView;
