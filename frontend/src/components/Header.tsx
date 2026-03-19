import type { TabType } from '../types';
import { useAuth } from '../AuthContext';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  savedCount: number;
}

export default function Header({ activeTab, setActiveTab, savedCount }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <a className="header-logo" href="#">
        <div className="header-logo-icon">✦</div>
        <span className="header-logo-text gradient-text">JD Creator AI</span>
      </a>

      <nav className="header-nav">
        {user && (
          <>
            <button
              id="tab-create"
              className={`nav-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              ✨ Create JD
            </button>
            <button
              id="tab-saved"
              className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              📁 Saved JDs
              {savedCount > 0 && (
                <span className="header-badge">{savedCount}</span>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.email}</span>
              <button 
                onClick={logout}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 0.8rem', borderRadius: '4px', color: '#fff', cursor: 'pointer', transition: 'background-color 0.2s' }}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
