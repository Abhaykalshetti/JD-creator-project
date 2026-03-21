import './index.css';
import './App.css';
import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import JDForm from './components/JDForm';
import JDPreview from './components/JDPreview';
import QualityChecker from './components/QualityChecker';
import SavedJDs from './components/SavedJDs';
import { api } from './services/api';
import { useAuth } from './AuthContext';
import AuthForms from './components/AuthForms';
import LandingPage from './components/LandingPage';
import type {
  FormData, JDVariant, QualityResult, SavedJD, SavedJDDetail, TabType, Notification,
} from './types';

const INITIAL_FORM: FormData = {
  jobTitle: '', company: '', location: '', experience: '',
  jobType: 'Full-time', workMode: 'On-site', salaryRange: '',
  department: '', responsibilities: '', qualifications: '',
};

export default function App() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [skills, setSkills] = useState<string[]>([]);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [generatedJD, setGeneratedJD] = useState('');
  const [variants, setVariants] = useState<JDVariant[]>([]);
  const [activeVariant, setActiveVariant] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(new Set([0]));
  const [quality, setQuality] = useState<QualityResult | null>(null);
  const [savedJDs, setSavedJDs] = useState<SavedJD[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [unauthView, setUnauthView] = useState<'landing' | 'auth'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const [isSuggestingDetails, setIsSuggestingDetails] = useState(false);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Removed lastAutoSuggestRef since auto-suggest is disabled

  const showNotification = (message: string, type: Notification['type'] = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadSavedJDs = useCallback(async () => {
    try {
      const data = await api.getSavedJDs();
      setSavedJDs(data);
    } catch {
      // silently fail on load
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadSavedJDs();
    } else {
      // Clear all state on logout to prevent cross-account data leaking
      setSavedJDs([]);
      setFormData(INITIAL_FORM);
      setSkills([]);
      setSuggestedSkills([]);
      setGeneratedJD('');
      setVariants([]);
      setQuality(null);
      setActiveTab('create');
    }
  }, [user, loadSavedJDs]);

  // ── Auto-suggest skills manually via button (useEffect removed) ──────────────

  const handleFormChange = (field: keyof FormData, value: string) => {
    if (field === 'jobTitle' || field === 'experience') {
      setSuggestedSkills([]);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setSkills((prev) => [...prev, trimmed]);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleGenerate = async () => {
    if (!formData.jobTitle.trim()) {
      showNotification('Please enter a job title first.', 'error');
      return;
    }
    setIsGenerating(true);
    setQuality(null);
    setVariants([]);
    setActiveVariant(0);
    try {
      const res = await api.generateJD({ ...formData, skills });
      const variantList = res.variants ?? [{ label: 'Formal', jd: res.generatedJD }];
      setVariants(variantList);
      setGeneratedJD(variantList[0].jd);
      setSelectedVariants(new Set([0]));
      showNotification(`✨ 3 JD variants generated! Choose the best one.`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to generate JD', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestSkills = async () => {
    if (!formData.jobTitle.trim()) {
      showNotification('Please enter a job title first.', 'error');
      return;
    }
    setIsSuggestingSkills(true);
    try {
      const { skills: suggested } = await api.suggestSkills({
        jobTitle: formData.jobTitle,
        existingSkills: skills,
      });
      setSuggestedSkills(suggested);
      showNotification(`✦ ${suggested.length} skills suggested!`, 'info');
    } catch (err: any) {
      showNotification(err.message || 'Failed to suggest skills', 'error');
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  const handleSuggestDetails = async () => {
    if (!formData.jobTitle.trim()) {
      showNotification('Please enter a job title first.', 'error');
      return;
    }
    setIsSuggestingDetails(true);
    try {
      const { responsibilities, qualifications } = await api.suggestReqQual({
        jobTitle: formData.jobTitle,
        skills,
        experience: formData.experience,
      });
      setFormData(prev => ({
        ...prev,
        responsibilities: responsibilities || prev.responsibilities,
        qualifications: qualifications || prev.qualifications
      }));
      showNotification('✦ Details auto-filled!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to auto-fill details', 'error');
    } finally {
      setIsSuggestingDetails(false);
    }
  };

  const handleCheckQuality = async () => {
    if (!generatedJD) {
      showNotification('Generate a JD first.', 'error');
      return;
    }
    setIsCheckingQuality(true);
    try {
      const result = await api.checkQuality(generatedJD);
      setQuality(result);
      showNotification(`🎯 Quality score: ${result.score}/100 (${result.grade})`, 'info');
    } catch (err: any) {
      showNotification(err.message || 'Failed to check quality', 'error');
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const handleRefineJD = async (instruction: string) => {
    if (!generatedJD && variants.length === 0) return;
    setIsRefining(true);
    try {
      if (variants.length > 0) {
        // Refine all variants in parallel
        const refinedVariants = await Promise.all(
          variants.map(async (v) => {
            const { refinedJD } = await api.refineJD(v.jd, instruction);
            return { ...v, jd: refinedJD };
          })
        );
        setVariants(refinedVariants);
        setGeneratedJD(refinedVariants[activeVariant]?.jd || refinedVariants[0].jd);
      } else {
        // Fallback if no variants array (backward compatibility)
        const { refinedJD } = await api.refineJD(generatedJD, instruction);
        setGeneratedJD(refinedJD);
      }

      // Clear old quality score since JD has changed
      setQuality(null);
      showNotification('✨ All versions successfully refined!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to refine JDs', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSave = async () => {
    if (!generatedJD && variants.length === 0) return;
    setIsSaving(true);
    try {
      const toSave = variants.filter((_, i) => selectedVariants.has(i));
      // Fallback if none selected
      if (toSave.length === 0) {
        if (variants[activeVariant]) {
          toSave.push(variants[activeVariant]);
        } else {
          toSave.push({ label: 'Original', jd: generatedJD });
        }
      }

      await Promise.all(toSave.map(v => {
        const titleSuffix = variants.length > 1 ? ` - ${v.label.replace(/[^a-zA-Z0-9 ]/g, '').trim()}` : '';
        return api.saveJD({
          ...formData,
          skills,
          jobTitle: `${formData.jobTitle}${titleSuffix}`,
          generatedJD: v.jd,
          qualityScore: quality?.score || 0,
          qualitySuggestions: quality?.suggestions || [],
        });
      }));

      await loadSavedJDs();
      showNotification(`💾 ${toSave.length} JD${toSave.length > 1 ? 's' : ''} saved successfully!`, 'success');
      
      // ✅ Clear all data in the "Create JD" tab after successful save
      setFormData(INITIAL_FORM);
      setSkills([]);
      setSuggestedSkills([]);
      setGeneratedJD('');
      setVariants([]);
      setActiveVariant(0);
      setSelectedVariants(new Set([0]));
      setQuality(null);
    } catch (err: any) {
      showNotification(err.message || 'Failed to save JD', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedJD);
    showNotification('📋 Copied to clipboard!', 'success');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedJDs((prev) => prev.filter((jd) => jd.id !== id));
    showNotification('🗑 JD deleted.', 'info');
  };

  const handleLoadJD = (jd: SavedJDDetail) => {
    setFormData({
      jobTitle: jd.jobTitle || '',
      company: jd.company || '',
      location: jd.location || '',
      experience: jd.experience || '',
      jobType: jd.jobType || 'Full-time',
      workMode: jd.workMode || 'On-site',
      salaryRange: jd.salaryRange || '',
      department: jd.department || '',
      responsibilities: jd.responsibilities || '',
      qualifications: jd.qualifications || '',
    });
    setSkills(jd.skills || []);
    setGeneratedJD(jd.generatedJD || '');
    setQuality(
      jd.qualityScore
        ? { score: jd.qualityScore, grade: jd.qualityScore >= 90 ? 'Excellent' : jd.qualityScore >= 75 ? 'Good' : 'Fair', suggestions: jd.qualitySuggestions || [] }
        : null,
    );
    setActiveTab('create');
    showNotification('✏️ JD loaded for editing!', 'info');
  };



  if (!user) {
    return (
      <div className="app">
        <Header 
          activeTab="create" 
          setActiveTab={() => {}} 
          savedCount={0} 
          onShowAuth={(mode) => {
            setUnauthView('auth');
            setAuthMode(mode);
          }}
          onShowLanding={() => setUnauthView('landing')}
          isAuthView={unauthView === 'auth'}
        />
        <main className="main-content">
          {unauthView === 'landing' ? (
            <LandingPage 
              onGetStarted={() => {
                setUnauthView('auth');
                setAuthMode('register');
              }}
              onLogin={() => {
                setUnauthView('auth');
                setAuthMode('login');
              }}
            />
          ) : (
            <AuthForms initialMode={authMode} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} savedCount={savedJDs.length} />

      <main className="main-content">
        {activeTab === 'create' && (
          <div className="fade-in">
            <div className="page-header">
              <h1>
                <span className="gradient-text">AI Job Description</span> Creator
              </h1>
              <p>Fill in the role details and let AI generate a professional, structured job description instantly.</p>
            </div>

            {/* Progress Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }}>1</div>
                <span style={{ fontWeight: 600 }}>Role & Details</span>
              </div>
              <div style={{ height: 2, width: 60, background: skills.length > 0 ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: skills.length > 0 ? 'var(--accent-purple)' : 'var(--text-muted)' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: skills.length > 0 ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: 'all 0.3s', boxShadow: skills.length > 0 ? '0 0 12px rgba(124,58,237,0.4)' : 'none' }}>2</div>
                <span style={{ fontWeight: 600, transition: 'color 0.3s' }}>Skills & Reqs</span>
              </div>
              <div style={{ height: 2, width: 60, background: generatedJD ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: generatedJD ? 'var(--accent-purple)' : 'var(--text-muted)' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: generatedJD ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: 'all 0.3s', boxShadow: generatedJD ? '0 0 12px rgba(124,58,237,0.4)' : 'none' }}>3</div>
                <span style={{ fontWeight: 600, transition: 'color 0.3s' }}>Review & Edit</span>
              </div>
            </div>

            <div className="creator-layout">
              {/* Left: Form */}
              <JDForm
                formData={formData}
                skills={skills}
                suggestedSkills={suggestedSkills}
                isGenerating={isGenerating}
                isSuggestingSkills={isSuggestingSkills}
                isSuggestingDetails={isSuggestingDetails}
                onChange={handleFormChange}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
                onSetSkills={(newSkills) => {
                  setSkills(newSkills);
                }}
                onClearSuggestions={() => setSuggestedSkills([])}
                onGenerate={handleGenerate}
                onSuggestSkills={handleSuggestSkills}
                onSuggestDetails={handleSuggestDetails}
              />

              {/* Right: Preview + Quality */}
              <div className="right-panel">
                <JDPreview
                  generatedJD={generatedJD}
                  isGenerating={isGenerating}
                  quality={quality}
                  isSaving={isSaving}
                  variants={variants}
                  activeVariant={activeVariant}
                  selectedVariants={selectedVariants}
                  onSelectVariant={(idx) => {
                    setActiveVariant(idx);
                    setGeneratedJD(variants[idx].jd);
                    setQuality(null);
                  }}
                  onToggleVariant={(idx) => {
                    setSelectedVariants(prev => {
                      const next = new Set(prev);
                      if (next.has(idx)) next.delete(idx);
                      else next.add(idx);
                      return next;
                    });
                  }}
                  onSave={handleSave}
                  onCopy={handleCopy}
                  onCheckQuality={handleCheckQuality}
                  onChangeJD={(newJd) => {
                    setGeneratedJD(newJd);
                    setVariants(prev => {
                      const updated = [...prev];
                      if (updated[activeVariant]) {
                         updated[activeVariant] = { ...updated[activeVariant], jd: newJd };
                      }
                      return updated;
                    });
                  }}
                  isCheckingQuality={isCheckingQuality}
                  isRefining={isRefining}
                  onRefine={handleRefineJD}
                />
                <QualityChecker
                  quality={quality}
                  isChecking={isCheckingQuality}
                  hasJD={!!generatedJD}
                  onCheck={handleCheckQuality}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="fade-in">
            <SavedJDs
              savedJDs={savedJDs}
              onDelete={handleDeleteSaved}
              onLoadJD={handleLoadJD}
              onRefresh={loadSavedJDs}
            />
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
