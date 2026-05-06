/* Sight Words view — checkable list grouped by tier */

function SightWordsView({ studentId, state, setState }) {
  const getStatus = (w) => state.sightWords?.[studentId]?.[w] || 'todo';
  const setSWStatus = (w, s) => setState(prev => ({
    ...prev,
    sightWords: { ...prev.sightWords, [studentId]: { ...(prev.sightWords?.[studentId] || {}), [w]: s } }
  }));

  const cycle = (cur) => {
    const order = ['todo','progress','review','mastered'];
    return order[(order.indexOf(cur) + 1) % order.length];
  };

  const all = window.SIGHT_WORDS.flatMap(g => g.words);
  const counts = all.reduce((acc, w) => { acc[getStatus(w)] = (acc[getStatus(w)] || 0) + 1; return acc; }, {});
  const mastered = counts.mastered || 0;
  const total = all.length;

  const student = window.STUDENTS.find(s => s.id === studentId);

  return (
    <React.Fragment>
      <div className="header">
        <div>
          <h1><em>Sight words</em> · {student.name}</h1>
          <div className="header-sub">
            All {total} sight words taught across the year. Click any word to cycle: To do → In progress → Needs review → Mastered. Saved per child.
          </div>
        </div>
        <div className="profile-stats">
          <div>
            <div className="profile-stat-num serif" style={{color:'var(--sage)'}}>{mastered}<span style={{color:'var(--ink-3)'}}> / {total}</span></div>
            <div className="profile-stat-label">Mastered</div>
          </div>
          <div>
            <div className="profile-stat-num serif" style={{color:'var(--amber)'}}>{counts.progress || 0}</div>
            <div className="profile-stat-label">In progress</div>
          </div>
          <div>
            <div className="profile-stat-num serif" style={{color:'var(--accent)'}}>{counts.review || 0}</div>
            <div className="profile-stat-label">Needs review</div>
          </div>
        </div>
      </div>

      <div style={{padding:'24px 48px 60px',display:'flex',flexDirection:'column',gap:24}}>
        {window.SIGHT_WORDS.map(g => {
          const groupMastered = g.words.filter(w => getStatus(w) === 'mastered').length;
          return (
            <div key={g.group} className="sw-group">
              <div className="sw-group-head">
                <h2 className="serif" style={{margin:0,fontSize:22,letterSpacing:'-0.02em',fontWeight:500}}>{g.group}</h2>
                <span style={{fontSize:11,color:'var(--ink-3)',letterSpacing:'0.06em',textTransform:'uppercase'}}>{groupMastered} / {g.words.length} mastered</span>
              </div>
              <div className="sw-grid">
                {g.words.map(w => {
                  const s = getStatus(w);
                  return (
                    <button
                      key={w}
                      className={`sw-word sw-${s}`}
                      onClick={() => setSWStatus(w, cycle(s))}
                      title={window.STATUS_LABELS[s]}
                    >
                      <span className="sw-text">{w}</span>
                      <span className={`sw-mark sw-mark-${s}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
}
window.SightWordsView = SightWordsView;
