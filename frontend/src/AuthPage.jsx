import { useState, useEffect, useRef, useCallback } from 'react';
import api, { jadaClaimGuest } from './api';
import { getGuestSessionId, clearGuestSessionId } from './jada/guestSession';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from './toast';
import { User, Lock, Mail, ArrowRight, Zap, Github, Chrome, AlertCircle, Eye, EyeOff, Code2, Check, X } from 'lucide-react';
import { usePostHogApp } from './PostHogProvider';
import './Auth.css';

/* ─── Password strength helper ─── */
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: 'Very weak', color: '#ef4444' },
    { label: 'Weak', color: '#f97316' },
    { label: 'Fair', color: '#eab308' },
    { label: 'Good', color: '#22c55e' },
    { label: 'Strong', color: '#10b981' },
  ];
  const idx = Math.min(score, levels.length) - 1;
  return { score, ...(idx >= 0 ? levels[idx] : { label: '', color: '' }) };
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
  });

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [usernameReason, setUsernameReason] = useState('');
  const debounceRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { identify, capture } = usePostHogApp();

  useEffect(() => {
    if (location.pathname === '/login') setIsLogin(true);
    else if (location.pathname === '/register' || location.pathname === '/signup') setIsLogin(false);
    const params = new URLSearchParams(location.search);
    const urlError = params.get('error');
    if (urlError) setError(decodeURIComponent(urlError));
  }, [location]);

  /* ─── Debounced username check ─── */
  const checkUsername = useCallback((name) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!name || name.length < 3) {
      setUsernameStatus(name ? 'invalid' : null);
      setUsernameReason(name ? 'At least 3 characters' : '');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setUsernameStatus('invalid');
      setUsernameReason('Only letters, numbers, underscores');
      return;
    }
    setUsernameStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/api/check-username/?q=${encodeURIComponent(name)}`);
        if (res.data.available) {
          setUsernameStatus('available');
          setUsernameReason('');
        } else {
          setUsernameStatus('taken');
          setUsernameReason(res.data.reason || 'Username is taken');
        }
      } catch {
        setUsernameStatus(null);
      }
    }, 400);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (error) setError(null);
    if (fieldErrors[name]) setFieldErrors(p => ({ ...p, [name]: null }));

    // Live username check on signup
    if (name === 'username' && !isLogin) checkUsername(value);
  };

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setError(null);
    setFieldErrors({});
    setUsernameStatus(null);
    navigate(newMode ? '/login' : '/signup');
  };

  /* ─── Submit ─── */
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    if (!isLogin) {
      // Client-side validation
      const errs = {};
      if (formData.username.length < 3) errs.username = 'At least 3 characters';
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) errs.username = 'Only letters, numbers, underscores';
      if (!formData.email) errs.email = 'Email is required';
      if (formData.password.length < 8) errs.password = 'At least 8 characters';
      if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
      if (usernameStatus === 'taken') errs.username = 'Username is taken';

      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await executeLogin(formData.username, formData.password, formData.rememberMe);
      } else {
        await api.post('/api/register/', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        // Auto-login then send to onboarding
        await executeLogin(formData.username, formData.password, false, '/onboarding');
      }
    } catch (err) {
      console.error('Auth Error:', err);
      const data = err.response?.data || {};
      if (data.detail) setError(data.detail);
      else if (data.username) setFieldErrors(p => ({ ...p, username: data.username[0] }));
      else if (data.email) setFieldErrors(p => ({ ...p, email: data.email[0] }));
      else if (data.password) setFieldErrors(p => ({ ...p, password: data.password[0] }));
      else setError('Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const executeLogin = async (username, password, rememberMe, redirectTo = '/dashboard') => {
    const res = await api.post('/api/token/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);

    // Claim any guest JADA conversations
    const guestSid = getGuestSessionId();
    if (guestSid) {
      jadaClaimGuest(guestSid).catch(() => {});
      clearGuestSessionId();
    }

    // PostHog: identify user + capture event
    try {
      const profile = await api.get('/api/profile/');
      const p = profile.data?.profile || profile.data;
      if (p?.id) identify(p.id, { username: p.username, email: p.email, plan_tier: p.plan_tier || 'FREE', target_career: p.target_career || '' });
      if (redirectTo === '/onboarding') {
        capture('user_signed_up', { method: 'email' });
        toast.success('Account created! Let\'s set up your roadmap.');
      } else {
        capture('user_logged_in', { method: 'email' });
        toast.success('Welcome back!');
      }
    } catch (_) { /* best-effort */ }

    navigate(redirectTo);
  };

  const handleSocialLogin = (provider) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    window.location.href = `${API_BASE_URL}/accounts/${provider.toLowerCase()}/login/`;
  };

  const pwStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <div className="auth-grid-bg" />

      <div className="auth-card-wrapper">
        {/* LEFT: Brand */}
        <div className="auth-brand-side">
          <div className="brand-header">
            <Code2 size={32} color="var(--neon-cyan)" />
            <span className="brand-logo-text">WHATS-NEXT</span>
          </div>
          <div className="brand-hero-text">
            <h1>{isLogin ? 'Welcome Back to the Dojo.' : 'Build Your Future. Verification Required.'}</h1>
            <p>{isLogin ? 'Continue your progression. Your roadmap is waiting.' : 'Join the elite community of developers escaping tutorial hell.'}</p>
            <div className="feature-list">
              <div className="feature-pill"><Zap size={14} /> AI Roadmaps</div>
              <div className="feature-pill"><Github size={14} /> GitHub Sync</div>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: -20, right: -20, width: 200, height: 200, background: 'radial-gradient(circle, rgba(95,245,255,0.2), transparent 70%)', borderRadius: '50%' }} />
        </div>

        {/* RIGHT: Form */}
        <div className="auth-form-side">
          <div className="auth-form-header">
            <div className="auth-title">{isLogin ? 'Sign In' : 'Create Account'}</div>
            <div className="auth-subtitle">{isLogin ? 'Enter your credentials to access the terminal.' : 'Quick setup — we\'ll personalise your roadmap next.'}</div>
          </div>

          {/* Social buttons first on signup for convenience */}
          {!isLogin && (
            <>
              <div className="social-buttons-row">
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('GitHub')}>
                  <Github size={18} /> GitHub
                </button>
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('Google')}>
                  <Chrome size={18} /> Google
                </button>
              </div>
              <div className="auth-divider"><span>OR WITH EMAIL</span></div>
            </>
          )}

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} noValidate>
            {/* Email — signup only */}
            {!isLogin && (
              <div className="auth-form-group">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" size={18} />
                  <input className={`auth-input ${fieldErrors.email ? 'input-error' : ''}`} name="email" type="email" placeholder="developer@example.com" value={formData.email} onChange={handleChange} required />
                </div>
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </div>
            )}

            {/* Username */}
            <div className="auth-form-group">
              <label className="auth-label">Username</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" size={18} />
                <input className={`auth-input ${fieldErrors.username ? 'input-error' : ''}`} name="username" type="text" placeholder="codewarrior" value={formData.username} onChange={handleChange} required autoComplete="username" />
                {!isLogin && usernameStatus === 'checking' && <span className="input-status checking" />}
                {!isLogin && usernameStatus === 'available' && <Check size={16} className="input-status-icon available" />}
                {!isLogin && (usernameStatus === 'taken' || usernameStatus === 'invalid') && <X size={16} className="input-status-icon taken" />}
              </div>
              {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
              {!fieldErrors.username && usernameReason && <span className="field-error">{usernameReason}</span>}
            </div>

            {/* Password */}
            <div className="auth-form-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input className={`auth-input ${fieldErrors.password ? 'input-error' : ''}`} name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} required autoComplete={isLogin ? 'current-password' : 'new-password'} />
                <button type="button" className="toggle-pw-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}

              {/* Password strength meter — signup only */}
              {!isLogin && formData.password && (
                <div className="pw-strength">
                  <div className="pw-strength-track">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="pw-strength-seg" style={{ background: i <= pwStrength.score ? pwStrength.color : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <span className="pw-strength-label" style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password — signup only */}
            {!isLogin && (
              <div className="auth-form-group">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" size={18} />
                  <input className={`auth-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`} name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && <Check size={16} className="input-status-icon available" />}
                </div>
                {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
              </div>
            )}

            {/* Remember me — login only */}
            {isLogin && (
              <label className="remember-row">
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />
                <span>Remember me</span>
              </label>
            )}

            <button type="submit" className="auth-btn-primary" disabled={loading || (!isLogin && usernameStatus === 'taken')}>
              {loading ? 'Processing...' : isLogin ? 'Access System' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Social buttons for login */}
          {isLogin && (
            <>
              <div className="auth-divider"><span>OR CONTINUE WITH</span></div>
              <div className="social-buttons-row">
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('GitHub')}>
                  <Github size={18} /> GitHub
                </button>
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('Google')}>
                  <Chrome size={18} /> Google
                </button>
              </div>
            </>
          )}

          <div className="auth-toggle">
            {isLogin ? 'New to the dojo?' : 'Already verified?'}
            <a onClick={toggleMode}>{isLogin ? 'Create Account' : 'Sign In'}</a>
          </div>
        </div>
      </div>
    </div>
  );
}