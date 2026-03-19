import { useState } from 'react';
import type { SavedJD, SavedJDDetail } from '../types';
import { api } from '../services/api';

interface SavedJDsProps {
  savedJDs: SavedJD[];
  onDelete: (id: string) => void;
  onLoadJD: (jd: SavedJDDetail) => void;
  onRefresh?: () => void;
}

function getScoreClass(score: number) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  return 'poor';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function SavedJDs({ savedJDs, onDelete, onLoadJD }: SavedJDsProps) {
  const [search, setSearch] = useState('');
  const [viewJD, setViewJD] = useState<SavedJDDetail | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = savedJDs.filter((jd) =>
    jd.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
    (jd.company || '').toLowerCase().includes(search.toLowerCase()) ||
    (jd.location || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleView = async (id: string) => {
    setLoadingId(id);
    try {
      const detail = await api.getSavedJDById(id);
      setViewJD(detail);
    } catch {
      alert('Failed to load JD details');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job description? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.deleteJD(id);
      onDelete(id);
    } catch {
      alert('Failed to delete JD');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyModal = () => {
    if (viewJD?.generatedJD) {
      navigator.clipboard.writeText(viewJD.generatedJD);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fade-in">
      <div className="saved-header">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem' }}>Saved Job Descriptions</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
            {savedJDs.length} JD{savedJDs.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <div className="saved-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="searchSavedJDs"
            className="saved-search"
            placeholder="Search by role, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>{search ? 'No Results Found' : 'No Saved JDs Yet'}</h3>
          <p>
            {search
              ? 'Try a different search term.'
              : 'Generate and save job descriptions to view them here.'}
          </p>
        </div>
      ) : (
        <div className="saved-grid">
          {filtered.map((jd) => (
            <div key={jd.id} className="saved-card">
              <div className="saved-card-header">
                <div>
                  <div className="saved-card-title">{jd.jobTitle}</div>
                  {jd.company && <div className="saved-card-company">🏢 {jd.company}</div>}
                </div>
                {jd.qualityScore > 0 && (
                  <div className={`saved-score-badge ${getScoreClass(jd.qualityScore)}`}>
                    {jd.qualityScore}
                  </div>
                )}
              </div>

              <div className="saved-card-meta">
                {jd.location && <span className="meta-tag">📍 {jd.location}</span>}
                {jd.experience && <span className="meta-tag">⏳ {jd.experience}</span>}
                {jd.jobType && <span className="meta-tag">💼 {jd.jobType}</span>}
                {jd.workMode && <span className="meta-tag">🏠 {jd.workMode}</span>}
              </div>

              {jd.skills?.length > 0 && (
                <div className="saved-card-skills">
                  {jd.skills.slice(0, 4).map((s) => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                  {jd.skills.length > 4 && (
                    <span className="more-skills">+{jd.skills.length - 4} more</span>
                  )}
                </div>
              )}

              <div className="saved-date">Created {formatDate(jd.createdAt)}</div>

              <div className="saved-card-actions">
                <button
                  className="saved-action-btn primary"
                  onClick={() => handleView(jd.id)}
                  disabled={loadingId === jd.id}
                >
                  {loadingId === jd.id
                    ? <span className="spinner" style={{ width: 12, height: 12 }} />
                    : '👁 View'}
                </button>
                <button
                  className="saved-action-btn"
                  onClick={() => handleView(jd.id).then(() => { /* loaded, use in form */ })}
                  disabled={loadingId === jd.id}
                >
                  ✏️ Edit
                </button>
                <button
                  className="saved-action-btn danger"
                  onClick={() => handleDelete(jd.id)}
                  disabled={deletingId === jd.id}
                >
                  {deletingId === jd.id
                    ? <span className="spinner" style={{ width: 12, height: 12 }} />
                    : '🗑'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {viewJD && (
        <div className="modal-overlay" onClick={() => setViewJD(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{viewJD.jobTitle}</h2>
                {viewJD.company && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
                    🏢 {viewJD.company} {viewJD.location && `• 📍 ${viewJD.location}`}
                  </p>
                )}
              </div>
              <button className="modal-close" onClick={() => setViewJD(null)}>✕</button>
            </div>

            <div className="preview-actions" style={{ display: 'flex', gap: 8 }}>
              <button className="action-btn" onClick={handleCopyModal}>
                {copied ? '✓ Copied!' : '📋 Copy JD'}
              </button>
              <button
                className="action-btn primary"
                onClick={() => { onLoadJD(viewJD); setViewJD(null); }}
              >
                ✏️ Load & Edit
              </button>
            </div>

            <div className="modal-jd-text">{viewJD.generatedJD}</div>
          </div>
        </div>
      )}
    </div>
  );
}
