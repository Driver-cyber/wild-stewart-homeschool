// ── Reading Lesson ───────────────────────────────────────────────
const ReadingLesson = ({ content, onComplete }) => {
  const [phase, setPhase] = React.useState('intro');
  const [sentIdx, setSentIdx] = React.useState(0);
  const { sound, soundDescription, words, sentences } = content;

  if (phase === 'intro') return (
    <div className="lesson-phase">
      <div className="sound-feature">
        <div className="sound-big">{sound}</div>
        <p className="sound-desc">{soundDescription}</p>
      </div>
      <button className="btn-next" onClick={() => setPhase('words')}>See the words →</button>
    </div>
  );
  if (phase === 'words') return (
    <div className="lesson-phase">
      <h2 className="phase-heading">Words with <span className="sound-inline">{sound}</span></h2>
      <div className="word-grid">{words.map(w => <div key={w} className="word-card">{w}</div>)}</div>
      <button className="btn-next" onClick={() => setPhase('sentences')}>Now let's read! →</button>
    </div>
  );
  const isLast = sentIdx >= sentences.length - 1;
  return (
    <div className="lesson-phase">
      <div className="sentence-counter">{sentIdx + 1} of {sentences.length}</div>
      <div className="sentence-display"><p className="sentence-text">{sentences[sentIdx]}</p></div>
      <p className="sentence-hint">Read the sentence out loud, then tap next!</p>
      {isLast
        ? <button className="btn-complete" onClick={onComplete}>All done! ✓</button>
        : <button className="btn-next" onClick={() => setSentIdx(i => i + 1)}>Next →</button>
      }
    </div>
  );
};

// ── Word Jumble Spelling Lesson ──────────────────────────────────
function shuffleLetters(word) {
  const letters = word.split('').map((l, i) => ({ l, id: `${i}-${Math.random().toString(36).slice(2)}` }));
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  // Ensure not accidentally in correct order
  const joined = letters.map(x => x.l).join('');
  if (joined === word && word.length > 1) return shuffleLetters(word);
  return letters;
}

const SpellingLesson = ({ content, onComplete }) => {
  const { words } = content;
  const [wordIdx, setWordIdx] = React.useState(0);
  const [slots, setSlots] = React.useState(() => Array(words[0].length).fill(null));
  const [pool, setPool] = React.useState(() => shuffleLetters(words[0]));
  const [status, setStatus] = React.useState(null); // null | 'correct' | 'wrong'

  const initWord = React.useCallback((idx) => {
    setSlots(Array(words[idx].length).fill(null));
    setPool(shuffleLetters(words[idx]));
    setStatus(null);
  }, [words]);

  const tapTile = (tile) => {
    if (status === 'correct') return;
    const firstEmpty = slots.findIndex(s => s === null);
    if (firstEmpty === -1) return;
    setSlots(prev => { const n = [...prev]; n[firstEmpty] = tile; return n; });
    setPool(prev => prev.filter(t => t.id !== tile.id));
    setStatus(null);
  };

  const tapSlot = (i) => {
    if (!slots[i] || status === 'correct') return;
    const tile = slots[i];
    setSlots(prev => { const n = [...prev]; n[i] = null; return n; });
    setPool(prev => [...prev, tile]);
    setStatus(null);
  };

  const checkAnswer = () => {
    const answer = slots.map(s => s ? s.l : '').join('');
    const target = words[wordIdx];
    if (answer.toLowerCase() === target.toLowerCase()) {
      setStatus('correct');
      setTimeout(() => {
        const next = wordIdx + 1;
        if (next >= words.length) { onComplete(); return; }
        setWordIdx(next);
        initWord(next);
      }, 900);
    } else {
      setStatus('wrong');
      setTimeout(() => initWord(wordIdx), 1200);
    }
  };

  const allFilled = slots.every(s => s !== null);
  const currentWord = words[wordIdx];

  return (
    <div className="lesson-phase spelling-phase">
      <div className="word-dots">
        {words.map((_, i) => <div key={i} className={`word-dot ${i < wordIdx ? 'done' : i === wordIdx ? 'active' : ''}`} />)}
      </div>

      <div className="jumble-word-prompt">
        <div className="jumble-word-label">Spell this word:</div>
        <div className="jumble-target-word">{currentWord}</div>
      </div>

      {/* Answer slots */}
      <div className={`jumble-slots ${status || ''}`}>
        {slots.map((slot, i) => (
          <div key={i} className={`jumble-slot ${slot ? 'filled' : 'empty'}`} onClick={() => tapSlot(i)}>
            {slot ? slot.l : ''}
          </div>
        ))}
      </div>

      {status === 'correct' && <div className="status-msg correct">✓ That's it!</div>}
      {status === 'wrong'   && <div className="status-msg wrong">Not quite — let's try again!</div>}

      {/* Letter pool */}
      <div className="jumble-pool">
        {pool.map(tile => (
          <div key={tile.id} className="jumble-tile" onClick={() => tapTile(tile)}>{tile.l}</div>
        ))}
        {pool.length === 0 && !status && (
          <div className="jumble-pool-empty">Tap a slot to move a letter back</div>
        )}
      </div>

      {allFilled && !status && (
        <button className="btn-next" onClick={checkAnswer}>Check ✓</button>
      )}
    </div>
  );
};

// ── Place Value Lesson ───────────────────────────────────────────
const PV_PLACES = [
  { key:'hundreds', label:'Hundreds', color:'#7C4DCC', val:(n)=>Math.floor(n/100),     exp:(n)=>Math.floor(n/100)*100 },
  { key:'tens',     label:'Tens',     color:'#F5A623', val:(n)=>Math.floor((n%100)/10), exp:(n)=>Math.floor((n%100)/10)*10 },
  { key:'ones',     label:'Ones',     color:'#E85D4A', val:(n)=>n%10,                   exp:(n)=>n%10 },
];

const PlaceValueDisplay = ({ number, show, animate }) => {
  const places = PV_PLACES.filter(p => show.includes(p.key));
  return (
    <div className="pv-columns">
      {places.map(p => {
        const digit = p.val(number);
        return (
          <div key={p.key} className="pv-col" style={{'--pvc': p.color}}>
            <div className="pv-col-digit">{digit}</div>
            <div className="pv-col-label">{p.label}</div>
            <div className="pv-col-value">= {p.exp(number)}</div>
          </div>
        );
      })}
    </div>
  );
};

const PlaceValueLesson = ({ content, onComplete }) => {
  const { intro, examples, quiz } = content;
  const [phase, setPhase] = React.useState('intro');
  const [exIdx, setExIdx] = React.useState(0);
  const [qIdx, setQIdx] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [answered, setAnswered] = React.useState(false);

  if (phase === 'intro') return (
    <div className="lesson-phase">
      <div className="pv-intro-box"><p className="pv-intro-text">{intro}</p></div>
      <PlaceValueDisplay number={253} show={['hundreds','tens','ones']} />
      <button className="btn-next" onClick={() => setPhase('examples')}>Show me how! →</button>
    </div>
  );

  if (phase === 'examples') {
    const ex = examples[exIdx];
    const isLast = exIdx >= examples.length - 1;
    const places = PV_PLACES.filter(p => ex.show.includes(p.key));
    return (
      <div className="lesson-phase">
        <p className="pv-ex-heading">Let's break down <span className="pv-ex-num">{ex.number}</span></p>
        <PlaceValueDisplay number={ex.number} show={ex.show} animate />
        <div className="pv-sum">
          {places.map((p, i) => (
            <React.Fragment key={p.key}>
              {i > 0 && <span className="pv-sum-op"> + </span>}
              <span className="pv-sum-part" style={{color: p.color}}>{p.exp(ex.number)}</span>
            </React.Fragment>
          ))}
          <span className="pv-sum-op"> = </span>
          <strong className="pv-sum-total">{ex.number}</strong>
        </div>
        <button className="btn-next" onClick={() => isLast ? setPhase('quiz') : setExIdx(i => i + 1)}>
          {isLast ? 'Time to practice! →' : 'Next example →'}
        </button>
      </div>
    );
  }

  const q = quiz[qIdx];
  const isLastQ = qIdx >= quiz.length - 1;
  const pick = (c) => {
    if (answered) return;
    setSelected(c); setAnswered(true);
    if (c === q.answer) {
      setTimeout(() => {
        if (isLastQ) { onComplete(); return; }
        setQIdx(i => i + 1); setSelected(null); setAnswered(false);
      }, 900);
    }
  };

  return (
    <div className="lesson-phase">
      <div className="pv-quiz-counter">Question {qIdx + 1} of {quiz.length}</div>
      <div className="pv-quiz-num">{q.number}</div>
      <p className="pv-quiz-q">{q.question}</p>
      <div className="pv-choices">
        {q.choices.map(c => (
          <button key={c}
            className={`pv-choice ${answered ? (c === q.answer ? 'correct' : selected === c ? 'wrong' : 'dim') : ''}`}
            onClick={() => pick(c)} disabled={answered}>
            {c}
          </button>
        ))}
      </div>
      {answered && selected !== q.answer && (
        <div className="pv-feedback">
          <p className="math-error">The answer is <strong>{q.answer}</strong> — keep going!</p>
          <button className="btn-next" onClick={() => { if (isLastQ) onComplete(); else { setQIdx(i=>i+1); setSelected(null); setAnswered(false); } }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

// ── Math Stacked Lesson ──────────────────────────────────────────
const MathLesson = ({ content, onComplete }) => {
  const { intro, problems, operation = 'add' } = content;
  const [showIntro, setShowIntro] = React.useState(true);
  const [probIdx, setProbIdx] = React.useState(0);

  if (showIntro) return (
    <div className="lesson-phase math-phase">
      <div className="math-intro-card">
        <div className="math-intro-icon">{operation === 'subtract' ? '−' : '+'}</div>
        <p className="math-intro-text">{intro}</p>
      </div>
      <StackedDisplay num1={problems[0].num1} num2={problems[0].num2} operation={operation} preview />
      <button className="btn-next" onClick={() => setShowIntro(false)}>Let's try it! →</button>
    </div>
  );
  return (
    <div className="lesson-phase math-phase">
      <div className="prob-counter">Problem {probIdx + 1} of {problems.length}</div>
      <MathSolver key={probIdx} num1={problems[probIdx].num1} num2={problems[probIdx].num2}
        operation={operation} isLast={probIdx >= problems.length - 1}
        onNext={() => probIdx >= problems.length - 1 ? onComplete() : setProbIdx(i => i + 1)} />
    </div>
  );
};

const StackedDisplay = ({ num1, num2, operation, preview, step, carryVal, onesAnswer, tensAnswer }) => {
  const s1 = String(num1).padStart(2, '0');
  const s2 = String(num2).padStart(2, '0');
  const op = operation === 'subtract' ? '−' : '+';
  return (
    <div className={`stacked-display ${preview ? 'preview' : ''}`}>
      {/* carry row */}
      <div className="stack-row carry-row">
        <div className="stack-op-spacer" />
        <div className="stack-cell carry-cell">{carryVal > 0 ? carryVal : ''}</div>
        <div className="stack-cell carry-cell" />
      </div>
      {/* num1 */}
      <div className="stack-row">
        <div className="stack-op-spacer" />
        <div className={`stack-cell ${step === 1 ? 'hl-active' : ''}`}>{s1[0]}</div>
        <div className={`stack-cell ${step === 0 ? 'hl-active' : ''}`}>{s1[1]}</div>
      </div>
      {/* op + num2 */}
      <div className="stack-row">
        <div className="stack-op">{op}</div>
        <div className={`stack-cell ${step === 1 ? 'hl-active' : ''}`}>{s2[0]}</div>
        <div className={`stack-cell ${step === 0 ? 'hl-active' : ''}`}>{s2[1]}</div>
      </div>
      <div className="stack-line" />
      {/* answer */}
      <div className="stack-row answer-row">
        <div className="stack-op-spacer" />
        <div className="stack-cell answer-cell">
          {tensAnswer !== undefined ? <span className="answer-digit">{tensAnswer}</span> : <span className="answer-blank">?</span>}
        </div>
        <div className="stack-cell answer-cell">
          {onesAnswer !== undefined ? <span className="answer-digit">{onesAnswer}</span> : <span className="answer-blank">?</span>}
        </div>
      </div>
    </div>
  );
};

const MathSolver = ({ num1, num2, operation, onNext, isLast }) => {
  const isAdd = operation !== 'subtract';
  const ones1 = num1 % 10, tens1 = Math.floor(num1 / 10);
  const ones2 = num2 % 10, tens2 = Math.floor(num2 / 10);
  const onesRaw = isAdd ? ones1 + ones2 : ones1 - ones2;
  const carry   = isAdd ? (onesRaw >= 10 ? 1 : 0) : (onesRaw < 0 ? 1 : 0);
  const onesAns = isAdd ? onesRaw % 10 : (onesRaw < 0 ? onesRaw + 10 : onesRaw);
  const tensAns = isAdd ? tens1 + tens2 + carry : tens1 - tens2 - carry;

  const [step, setStep] = React.useState(0);
  const [input, setInput] = React.useState('');
  const [err, setErr] = React.useState(false);
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current && inputRef.current.focus(); }, [step]);

  const onesExpected = isAdd ? onesRaw : onesAns;
  const checkOnes = () => { if (parseInt(input) === onesExpected) { setErr(false); setInput(''); setStep(1); } else setErr(true); };
  const checkTens = () => { if (parseInt(input) === tensAns) { setErr(false); setInput(''); setStep(2); } else setErr(true); };

  return (
    <div className="math-solver">
      <StackedDisplay num1={num1} num2={num2} operation={operation} step={step}
        carryVal={step >= 1 ? carry : 0}
        onesAnswer={step >= 1 ? onesAns : undefined}
        tensAnswer={step >= 2 ? tensAns : undefined} />

      <div className="math-hint-box">
        {step === 0 && (<>
          <p className="math-hint">👉 Start with the <strong>ones column</strong> (right side)</p>
          <p className="math-question">{isAdd ? `${ones1} + ${ones2} = ?` : `${ones1} − ${ones2} = ?`}</p>
          {!isAdd && carry > 0 && <p className="math-hint borrow-hint">Tip: {ones1} is smaller than {ones2}, so you may need to borrow!</p>}
          <div className="math-input-row">
            <input ref={inputRef} type="number" className={`math-input ${err ? 'error' : ''}`}
              value={input} onChange={e => { setInput(e.target.value); setErr(false); }}
              onKeyDown={e => e.key === 'Enter' && input !== '' && checkOnes()} placeholder="?" />
            <button className="btn-check" onClick={checkOnes} disabled={input === ''}>Check →</button>
          </div>
          {err && <p className="math-error">Not quite — try again!</p>}
        </>)}

        {step === 1 && (<>
          <p className="math-hint success-hint">
            {isAdd
              ? (carry > 0 ? `${ones1} + ${ones2} = ${onesRaw} → write ${onesAns}, carry 1!` : `${ones1} + ${ones2} = ${onesAns} ✓`)
              : (carry > 0 ? `Borrowed! ${ones1+10} − ${ones2} = ${onesAns} ✓` : `${ones1} − ${ones2} = ${onesAns} ✓`)}
          </p>
          <p className="math-hint">Now the <strong>tens column!</strong></p>
          <p className="math-question">
            {isAdd ? `${tens1} + ${tens2}${carry ? ' + 1 (carried)' : ''} = ?`
                   : `${tens1} − ${tens2}${carry ? ' − 1 (borrowed)' : ''} = ?`}
          </p>
          <div className="math-input-row">
            <input ref={inputRef} type="number" className={`math-input ${err ? 'error' : ''}`}
              value={input} onChange={e => { setInput(e.target.value); setErr(false); }}
              onKeyDown={e => e.key === 'Enter' && input !== '' && checkTens()} placeholder="?" />
            <button className="btn-check" onClick={checkTens} disabled={input === ''}>Check →</button>
          </div>
          {err && <p className="math-error">Not quite — try again!</p>}
        </>)}

        {step === 2 && (<>
          <p className="math-answer">🎉 {num1} {isAdd ? '+' : '−'} {num2} = <strong>{isAdd ? num1+num2 : num1-num2}</strong></p>
          <button className="btn-complete" onClick={onNext}>{isLast ? 'All done! ✓' : 'Next problem →'}</button>
        </>)}
      </div>
    </div>
  );
};

// ── Interactive Lesson (Science / Social Studies) ────────────────
const FillBlankActivity = ({ sentences, onComplete }) => {
  const [idx, setIdx] = React.useState(0);
  const [picked, setPicked] = React.useState(null);
  const [status, setStatus] = React.useState(null);
  const s = sentences[idx];
  const isLast = idx >= sentences.length - 1;

  const pick = (c) => {
    if (status === 'correct') return;
    setPicked(c);
    if (c === s.answer) {
      setStatus('correct');
      setTimeout(() => {
        if (isLast) onComplete();
        else { setIdx(i => i + 1); setPicked(null); setStatus(null); }
      }, 1000);
    } else {
      setStatus('wrong');
      setTimeout(() => { setPicked(null); setStatus(null); }, 800);
    }
  };

  const parts = s.text.split('___');
  return (
    <div className="lesson-phase">
      <div className="fb-counter">{idx + 1} of {sentences.length}</div>
      <div className="fb-sentence">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <span className="fb-text">{part}</span>
            {i < parts.length - 1 && (
              <span className={`fb-blank ${status === 'correct' ? 'correct' : status === 'wrong' && picked ? 'wrong' : ''}`}>
                {status === 'correct' ? s.answer : picked && status === 'wrong' ? picked : '______'}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="fb-choices">
        {s.choices.map(c => (
          <button key={c}
            className={`fb-choice ${picked === c && status ? status : ''}`}
            onClick={() => pick(c)} disabled={status === 'correct'}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};

const OrderActivity = ({ items, correctOrder, prompt, onComplete }) => {
  const scrambled = React.useMemo(() => {
    const arr = items.map((item, i) => ({ item, idx: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const [slots, setSlots] = React.useState(Array(items.length).fill(null));
  const [pool, setPool] = React.useState(scrambled);
  const [checked, setChecked] = React.useState(false);
  const [correct, setCorrect] = React.useState(false);

  const placeItem = (item) => {
    const first = slots.findIndex(s => s === null);
    if (first === -1) return;
    setSlots(prev => { const n=[...prev]; n[first]=item; return n; });
    setPool(prev => prev.filter(p => p.idx !== item.idx));
    setChecked(false);
  };
  const removeSlot = (i) => {
    if (!slots[i]) return;
    setPool(prev => [...prev, slots[i]]);
    setSlots(prev => { const n=[...prev]; n[i]=null; return n; });
    setChecked(false);
  };
  const check = () => {
    const ok = slots.every((s, i) => s && s.idx === correctOrder[i]);
    setChecked(true); setCorrect(ok);
    if (ok) setTimeout(onComplete, 1000);
    else setTimeout(() => { setSlots(Array(items.length).fill(null)); setPool(scrambled); setChecked(false); }, 1600);
  };

  const allFilled = slots.every(s => s !== null);
  return (
    <div className="lesson-phase">
      <p className="order-prompt">{prompt}</p>
      <div className="order-layout">
        <div className="order-slots">
          {slots.map((slot, i) => (
            <div key={i}
              className={`order-slot ${slot?'filled':'empty'} ${checked&&slot?(slot.idx===correctOrder[i]?'correct':'wrong'):''}`}
              onClick={() => removeSlot(i)}>
              <div className="order-num">{i+1}</div>
              <div className="order-slot-text">{slot ? slot.item : <span className="order-placeholder">tap a card →</span>}</div>
            </div>
          ))}
        </div>
        <div className="order-pool">
          {pool.map(a => (
            <div key={a.idx} className="order-card" onClick={() => placeItem(a)}>{a.item}</div>
          ))}
        </div>
      </div>
      {checked && correct  && <p className="order-success">🎉 Perfect order!</p>}
      {checked && !correct && <p className="math-error">Not quite — let's try again!</p>}
      {allFilled && !checked && (
        <button className="btn-check" style={{alignSelf:'flex-start'}} onClick={check}>Check order ✓</button>
      )}
    </div>
  );
};

const InteractiveLesson = ({ content, onComplete }) => {
  const { videoId, activity, discussion } = content;
  const phases = React.useMemo(() =>
    [videoId !== undefined && 'video', activity && 'activity', discussion && 'discussion'].filter(Boolean), []);
  const [phaseIdx, setPhaseIdx] = React.useState(0);
  const phase = phases[phaseIdx];
  const next = () => { if (phaseIdx < phases.length - 1) setPhaseIdx(i => i + 1); else onComplete(); };

  if (phase === 'video') return (
    <div className="lesson-phase">
      <div className="video-wrap">
        {videoId
          ? <iframe className="video-embed"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
              frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title="Lesson video" />
          : <div className="video-placeholder">
              <div className="video-ph-icon">▶</div>
              <p className="video-ph-text">Add a YouTube video ID in the admin panel to show a video here</p>
            </div>
        }
      </div>
      <button className="btn-next" onClick={next}>
        {phases[phaseIdx+1] === 'activity' ? 'Now let\'s play! →' : 'Continue →'}
      </button>
    </div>
  );

  if (phase === 'activity') {
    if (activity.type === 'fill_blank')
      return <FillBlankActivity sentences={activity.sentences} onComplete={next} />;
    if (activity.type === 'order')
      return <OrderActivity items={activity.items} correctOrder={activity.correctOrder} prompt={activity.prompt} onComplete={next} />;
  }

  if (phase === 'discussion') return (
    <div className="lesson-phase general-phase">
      <div className="discussion-box">
        <div className="discussion-label">Let's Talk!</div>
        <p className="discussion-text">{discussion}</p>
      </div>
      <button className="btn-complete" onClick={onComplete}>We talked about it! ✓</button>
    </div>
  );
  return null;
};

// ── General Lesson (fallback) ────────────────────────────────────
const GeneralLesson = ({ content, onComplete }) => {
  const { intro, keyPoints, discussion } = content;
  const [phase, setPhase] = React.useState('content');
  if (phase === 'content') return (
    <div className="lesson-phase general-phase">
      <p className="general-intro">{intro}</p>
      <div className="key-points-list">
        {(keyPoints||[]).map((pt, i) => (
          <div key={i} className="key-point">
            <div className="key-point-num">{i+1}</div>
            <div className="key-point-text">{pt}</div>
          </div>
        ))}
      </div>
      {discussion
        ? <button className="btn-next" onClick={() => setPhase('discussion')}>Discussion time! →</button>
        : <button className="btn-complete" onClick={onComplete}>All done! ✓</button>
      }
    </div>
  );
  return (
    <div className="lesson-phase general-phase">
      <div className="discussion-box">
        <div className="discussion-label">Let's Talk!</div>
        <p className="discussion-text">{discussion}</p>
      </div>
      <button className="btn-complete" onClick={onComplete}>We talked about it! ✓</button>
    </div>
  );
};

Object.assign(window, {
  ReadingLesson, SpellingLesson, PlaceValueLesson, PlaceValueDisplay,
  MathLesson, StackedDisplay, InteractiveLesson, GeneralLesson
});
