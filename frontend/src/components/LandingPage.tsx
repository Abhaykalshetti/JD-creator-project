import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="landing-page fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">✨ AI-Powered Recruitment</div>
        <h1 className="hero-title">
          Create Perfect <span className="gradient-text">Job Descriptions</span> in Seconds
        </h1>
        <p className="hero-subtitle">
          Stop struggling with manual JD creation. Our AI engine generates professional, 
          structured, and high-quality job descriptions tailored to your specific needs.
        </p>
        <div className="hero-cta">
          <button className="cta-button primary" onClick={onGetStarted}>
            Get Started for Free
            <span className="btn-icon">→</span>
          </button>
          <button className="cta-button secondary" onClick={onLogin}>
            Sign In to your account
          </button>
        </div>
        

      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Smart Features for <span className="gradient-text">Modern Recruiters</span></h2>
          <p className="section-subtitle">Everything you need to attract top talent with professional JDs.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon">🚀</div>
            <h3>Instant Generation</h3>
            <p>Generate complete JDs from minimal input using advanced LLaMA models.</p>
          </div>
          
          <div className="feature-card glass-card">
            <div className="feature-icon">🎭</div>
            <h3>Multiple Variants</h3>
            <p>Choose from Formal, Engaging, or Concise tones to match your company culture.</p>
          </div>
          
          <div className="feature-card glass-card">
            <div className="feature-icon">🎯</div>
            <h3>Quality Checker</h3>
            <p>Get a quality score and actionable tips to improve your job descriptions.</p>
          </div>
          
          <div className="feature-card glass-card">
            <div className="feature-icon">💡</div>
            <h3>Skill Suggestions</h3>
            <p>AI suggests relevant technical and soft skills so you never miss a requirement.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon">✏️</div>
            <h3>AI Refinement</h3>
            <p>Modify your JD using natural language instructions. It's like having an editor.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon">📋</div>
            <h3>Structured Output</h3>
            <p>Clean, readable, and properly formatted layouts ready for posting.</p>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="solution-section">
        <div className="solution-container glass-card">
          <div className="solution-item">
            <div className="item-label old">The Problem</div>
            <h3>Time-consuming manual creation</h3>
            <p>Recruiters spend hours writing and formatting JDs, leading to inconsistency and fatigue.</p>
          </div>
          <div className="solution-divider"></div>
          <div className="solution-item">
            <div className="item-label new">The Solution</div>
            <h3>Automated AI Workflow</h3>
            <p>Reduce manual effort by 80% while ensuring high-quality, professional output every single time.</p>
          </div>
        </div>
      </section>

      {/* Tech Stack Preview */}
      <section className="tech-section">
        <p className="tech-label">POWERED BY MODERN TECH</p>
        <div className="tech-icons">
          <div className="tech-tag">React</div>
          <div className="tech-tag">NestJS</div>
          <div className="tech-tag">Groq AI</div>
          <div className="tech-tag">PostgreSQL</div>
          <div className="tech-tag">Tailwind</div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <h2>Ready to transform your hiring process?</h2>
        <p>Join recruiters using JD Creator AI to build better teams.</p>
        <button className="cta-button primary large" onClick={onGetStarted}>
          Start Creating Now
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
