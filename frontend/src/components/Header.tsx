import type { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  savedCount: number;
}

export default function Header({ activeTab, setActiveTab, savedCount }: HeaderProps) {
  return (
    <header className="header">
      <a className="header-logo" href="#">
        <div className="header-logo-icon">✦</div>
        <span className="header-logo-text gradient-text">JD Creator AI</span>
      </a>

      <nav className="header-nav">
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
      </nav>
    </header>
  );
}
