// Celebration.jsx
const Celebration = ({ lessonTitle, onClose }) => {
  const pieces = React.useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.0,
    duration: 1.2 + Math.random() * 1.0,
    size: 18 + Math.random() * 20,
    symbol: ['⭐', '✨', '🌟', '⭐', '✨'][i % 5],
    color: ['#FFD700','#FF6B6B','#4ECDC4','#A78BFA','#34D399','#F59E0B'][i % 6],
  })), []);

  return (
    <div className="celebration-overlay">
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: `${p.left}%`,
          fontSize: `${p.size}px`,
          color: p.color,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
        }}>{p.symbol}</div>
      ))}
      <div className="celebration-card">
        <div className="celebration-star-big">⭐</div>
        <h1 className="celebration-title">Amazing, Lyle!</h1>
        <p className="celebration-subtitle">You finished</p>
        <p className="celebration-lesson-name">"{lessonTitle}"</p>
        <div className="celebration-reward">
          <span className="reward-star">⭐</span>
          <span className="reward-text">+1 Star Earned!</span>
        </div>
        <button className="btn-celebrate" onClick={onClose}>Back to Dashboard</button>
      </div>
    </div>
  );
};

Object.assign(window, { Celebration });
