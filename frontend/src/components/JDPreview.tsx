import { useState } from 'react';
import type { JDVariant, QualityResult } from '../types';

interface JDPreviewProps {
  generatedJD: string;
  isGenerating: boolean;
  quality: QualityResult | null;
  isSaving: boolean;
  variants: JDVariant[];
  activeVariant: number;
  selectedVariants: Set<number>;
  onSelectVariant: (idx: number) => void;
  onToggleVariant: (idx: number) => void;
  onSave: () => void;
  onCopy: () => void;
  onCheckQuality: () => void;
  onChangeJD: (newJd: string) => void;
  isCheckingQuality: boolean;

  isRefining: boolean;
  onRefine: (instruction: string) => void;
}

const VARIANT_COLORS = [
  { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.35)', accent: '#6366f1' },   // Formal – indigo
  { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', accent: '#10b981' },    // Engaging – emerald
  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', accent: '#f59e0b' },    // Concise – amber
];

export default function JDPreview({
  generatedJD, isGenerating, quality, isSaving,
  variants, activeVariant, selectedVariants, onSelectVariant, onToggleVariant,
  onSave, onCopy, onCheckQuality, onChangeJD, isCheckingQuality,
  isRefining, onRefine
}: JDPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [refineText, setRefineText] = useState('');

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Loading state: show 3 skeleton cards ── */
  if (isGenerating) {
    return (
      <div className="card jd-preview-card">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span className="spinner" style={{ marginBottom: 10 }} />
          <p style={{ fontWeight: 600, marginBottom: 4 }}>✨ Generating 3 JD variants in parallel…</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Formal · Engaging · Concise — pick the best one</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Formal', 'Engaging', 'Concise'].map((label, i) => (
            <div key={i} style={{
              flex: 1, height: 80, borderRadius: 10, padding: '12px 14px',
              background: VARIANT_COLORS[i].bg,
              border: `1px solid ${VARIANT_COLORS[i].border}`,
              display: 'flex', flexDirection: 'column', gap: 8,
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: VARIANT_COLORS[i].accent }}>{label}</div>
              <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '70%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (!generatedJD && variants.length === 0) {
    return (
      <div className="card jd-preview-card">
        <div className="jd-empty-state">
          <div className="jd-empty-icon">📄</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No JD Generated Yet</h3>
          <p>Fill in the role details and click <strong>Generate Job Description</strong> to instantly get <strong>3 ready-to-use JD variants</strong>.</p>
        </div>
      </div>
    );
  }

  const activeColor = VARIANT_COLORS[activeVariant] ?? VARIANT_COLORS[0];

  return (
    <div className="card jd-preview-card fade-in">

      {/* Variant tab selector */}
      {variants.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Choose a Style
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {variants.map((v, i) => {
              const c = VARIANT_COLORS[i];
              const isActive = i === activeVariant;
              const isSelected = selectedVariants ? selectedVariants.has(i) : false;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 10,
                    border: `1.5px solid ${isActive ? c.accent : 'var(--border)'}`,
                    background: isActive ? c.bg : 'transparent',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? `0 0 12px ${c.accent}33` : 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleVariant(i)}
                    style={{ cursor: 'pointer', width: 16, height: 16, accentColor: c.accent }}
                    title="Select this variant to save"
                  />
                  <div
                    onClick={() => onSelectVariant(i)}
                    style={{
                      flex: 1, cursor: 'pointer',
                      color: isActive ? c.accent : 'var(--text-muted)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.8rem',
                    }}
                  >
                    {v.label}
                    {isActive && (
                      <span style={{
                        display: 'block', fontSize: '0.65rem', fontWeight: 400,
                        color: c.accent, marginTop: 2,
                      }}>● Editing</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="preview-header">
        <div className="preview-title" style={{ color: activeColor.accent }}>
          {variants[activeVariant]?.label ?? 'JD'} Variant Preview
        </div>
        <div className="preview-actions">
          <button
            id="checkQualityBtn2"
            className="action-btn"
            onClick={onCheckQuality}
            disabled={isCheckingQuality}
          >
            {isCheckingQuality
              ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Analyzing…</>
              : '🎯 Check Quality'}
          </button>
          <button id="copyJDBtn" className="action-btn" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button
            id="saveJDBtn"
            className="action-btn primary"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving
              ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Saving…</>
              : selectedVariants && selectedVariants.size > 0 
                  ? `💾 Save Selected (${selectedVariants.size})` 
                  : '💾 Save JD'}
          </button>
        </div>
      </div>

      {/* Quality badge */}
      {quality && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
          background: 'rgba(124,58,237,0.08)', borderRadius: 8, marginBottom: 12,
          border: '1px solid rgba(124,58,237,0.2)', fontSize: '0.82rem',
        }}>
          <span>🎯 Quality Score:</span>
          <strong style={{ color: quality.score >= 75 ? '#10b981' : quality.score >= 60 ? '#f59e0b' : '#ef4444' }}>
            {quality.score}/100 ({quality.grade})
          </strong>
        </div>
      )}

      {/* Editable JD textarea */}
      <textarea
        className="jd-text-area"
        value={generatedJD}
        onChange={(e) => onChangeJD(e.target.value)}
        style={{
          width: '100%',
          border: `1px solid ${activeColor.border}`,
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color 0.3s',
        }}
        placeholder="Your generated JD will appear here. You can edit it directly."
      />

      {/* AI Refinement Chat Bar */}
      {generatedJD && (
        <div style={{
          marginTop: 16, display: 'flex', gap: 8, alignItems: 'center',
          background: 'rgba(255,255,255,0.03)', padding: '10px 14px',
          borderRadius: 12, border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          <input
            type="text"
            placeholder="Tell AI to refine this JD (e.g., 'make it more friendly' or 'add WFH perks')..."
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && refineText.trim()) {
                onRefine(refineText.trim());
                setRefineText('');
              }
            }}
            disabled={isRefining}
            style={{
              flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)',
              fontSize: '0.875rem', outline: 'none',
            }}
          />
          <button
            onClick={() => {
              if (refineText.trim()) {
                onRefine(refineText.trim());
                setRefineText('');
              }
            }}
            disabled={isRefining || !refineText.trim()}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none',
              background: refineText.trim() ? activeColor.accent : 'rgba(255,255,255,0.1)',
              color: '#fff', fontSize: '0.8rem', fontWeight: 600,
              cursor: refineText.trim() && !isRefining ? 'pointer' : 'not-allowed',
              opacity: isRefining ? 0.7 : 1, transition: 'all 0.2s',
            }}
          >
            {isRefining ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : 'Refine'}
          </button>
        </div>
      )}
    </div>
  );
}
