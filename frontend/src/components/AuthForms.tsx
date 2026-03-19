import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../services/api';

export default function AuthForms() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({ email, password });
        login(res.access_token);
      } else {
        await api.register({ email, password });
        const res = await api.login({ email, password });
        login(res.access_token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}>
      <div className="glass-card scale-in" style={{
        padding: '2.5rem',
        borderRadius: 'var(--radius-xl, 24px)',
        width: '100%',
        maxWidth: '420px',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'var(--gradient-primary)', fontSize: '24px', 
            boxShadow: '0 0 20px rgba(109,40,217,0.5)', marginBottom: '1.25rem' 
          }}>
            ✦
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem 0' }}>
            <span className="gradient-text">JD Creator AI</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isLogin ? 'Sign in to access your workspace.' : 'Create an account to get started.'}
          </p>
        </div>

        {error && (
          <div className="notification error" style={{ position: 'relative', bottom: 'auto', right: 'auto', width: '100%', marginBottom: '1.5rem', animation: 'none' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ textAlign: 'left' }}>Email Address <span style={{ color: 'var(--error)' }}>*</span></label>
            <input
              type="email"
              className="form-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ textAlign: 'left' }}>Password <span style={{ color: 'var(--error)' }}>*</span></label>
            <input
              type="password"
              className="form-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="generate-btn"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? <span className="spinner"></span> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="divider" style={{ margin: '2rem 0 1.5rem 0' }}></div>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: 600, cursor: 'pointer', padding: 0, transition: 'color 0.2s', fontFamily: 'inherit' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#c4b5fd'}
            onMouseOut={(e) => e.currentTarget.style.color = '#a78bfa'}
          >
            {isLogin ? 'Sign up here' : 'Sign in here'}
          </button>
        </div>
      </div>
    </div>
  );
}
