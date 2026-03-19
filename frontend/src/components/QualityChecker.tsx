import type { QualityResult } from '../types';

interface QualityCheckerProps {
  quality: QualityResult | null;
  isChecking: boolean;
  hasJD: boolean;
  onCheck: () => void;
}

function getGradeClass(grade: string) {
  if (grade === 'Excellent') return 'excellent';
  if (grade === 'Good') return 'good';
  if (grade === 'Fair') return 'fair';
  return 'poor';
}

function getScoreColor(score: number) {
  if (score >= 90) return '#10b981';
  if (score >= 75) return '#60a5fa';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

export default function QualityChecker({ quality, isChecking, hasJD, onCheck }: QualityCheckerProps) {
  const circumference = 220;
  const offset = quality ? circumference - (quality.score / 100) * circumference : circumference;
  const color = quality ? getScoreColor(quality.score) : '#60a5fa';

  return (
    <div className="card quality-card">
      <div className="quality-header">
        <div className="card-title" style={{ marginBottom: 0 }}>
          <span className="card-title-icon">🎯</span> JD Quality Score
        </div>
        <button
          id="checkQualityBtn"
          className="check-quality-btn"
          onClick={onCheck}
          disabled={isChecking || !hasJD}
        >
          {isChecking
            ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Analyzing...</>
            : '⚡ Check Quality'}
        </button>
      </div>

      {!quality && !isChecking && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 8 }}>
          Generate a JD first, then check its quality score and get AI-powered improvement suggestions.
        </p>
      )}

      {isChecking && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <span className="spinner" style={{ width: 20, height: 20 }} /> Analyzing your job description...
        </div>
      )}

      {quality && !isChecking && (
        <div className="fade-in">
          <div className="quality-score-row" style={{ marginTop: 12 }}>
            <div className="quality-ring-wrap">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle className="quality-ring-bg" cx="45" cy="45" r="35" strokeWidth="8" />
                <circle
                  className="quality-ring-fill"
                  cx="45" cy="45" r="35" strokeWidth="8"
                  stroke={color}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="quality-ring-text">
                <span className="score" style={{ color }}>{quality.score}</span>
                <span className="pct">/ 100</span>
              </div>
            </div>
            <div className="quality-info">
              <div className={`quality-grade ${getGradeClass(quality.grade)}`}>
                {quality.grade === 'Excellent' && '🏆 '}
                {quality.grade === 'Good' && '👍 '}
                {quality.grade === 'Fair' && '⚠️ '}
                {quality.grade === 'Poor' && '❗ '}
                {quality.grade}
              </div>
              <div className="quality-desc">
                {quality.score >= 90 && 'Outstanding JD! Ready to publish.'}
                {quality.score >= 75 && quality.score < 90 && 'Strong JD with minor improvements possible.'}
                {quality.score >= 60 && quality.score < 75 && 'Decent JD — a few key areas to improve.'}
                {quality.score < 60 && 'Needs significant improvement before publishing.'}
              </div>
            </div>
          </div>

          {quality.suggestions.length > 0 && (
            <div className="quality-suggestions">
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                SUGGESTIONS
              </div>
              {quality.suggestions.map((s, i) => (
                <div key={i} className={`suggestion-item ${quality.score >= 90 ? 'positive' : ''}`}>
                  <span className="suggestion-icon">{quality.score >= 90 ? '✓' : '→'}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
