import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Mail, Briefcase, GraduationCap, ArrowRight, Zap, Github, Chrome, AlertCircle, Eye, EyeOff, Code2 } from 'lucide-react';
import './Auth.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    target_career: '',
    university_course_raw: '',
    budget_preference: 'FREE',
    rememberMe: false
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize Mode
  useEffect(() => {
    if (location.pathname === '/login') setIsLogin(true);
    else if (location.pathname === '/register' || location.pathname === '/signup') setIsLogin(false);
  
    // Check for OAuth errors
    const params = new URLSearchParams(location.search);
    const urlError = params.get('error');
    if (urlError) setError(decodeURIComponent(urlError));
  }, [location]);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError(null);
  };

  // Toggle Mode
  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setError(null);
    navigate(newMode ? '/login' : '/signup');
  };

  // Submit Handler
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
    }

    try {
      if (isLogin) {
        await executeLogin(formData.username, formData.password, formData.rememberMe);
      } else {
        await api.post('/api/register/', formData);
        // Auto login after signup
        await executeLogin(formData.username, formData.password);
      }
    } catch (err) {
      console.error("Auth Error:", err);
      const data = err.response?.data || {};
      if (data.detail) setError(data.detail);
      else if (data.username) setError(`Username: ${data.username[0]}`);
      else if (data.email) setError(`Email: ${data.email[0]}`);
      else setError("Authentication failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const executeLogin = async (username, password, rememberMe) => {
    try {
        const res = await api.post('/api/token/', { username, password });
        localStorage.setItem('access_token', res.data.access);
        if (rememberMe) localStorage.setItem('refresh_token', res.data.refresh);
        navigate('/dashboard');
    } catch (e) {
        throw e;
    }
  };

  const handleSocialLogin = (provider) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    window.location.href = `${API_BASE_URL}/accounts/${provider.toLowerCase()}/login/`;
  };

  // Render
  return (
    <div className="auth-container">
      <div className="auth-grid-bg"></div>
      
      <div className="auth-card-wrapper">
        
        {/* LEFT SIDE: BRANDING */}
        <div className="auth-brand-side">
            <div className="brand-header">
                <Code2 size={32} color="var(--neon-cyan)" />
                <span className="brand-logo-text">WHATS-NEXT</span>
            </div>

            <div className="brand-hero-text">
                <h1>
                    {isLogin ? "Welcome Back to the Dojo." : "Build Your Future. Verification Required."}
                </h1>
                <p>
                    {isLogin 
                        ? "Continue your progression. Your roadmap is waiting." 
                        : "Join the elite community of developers escaping tutorial hell."}
                </p>

                <div className="feature-list">
                    <div className="feature-pill"><Zap size={14} /> AI Roadmaps</div>
                    <div className="feature-pill"><Github size={14} /> GitHub Sync</div>
                </div>
            </div>
            
            {/* Jada Decorator (Static for now) */}
            <div style={{ position: 'absolute', bottom: -20, right: -20, width: 200, height: 200, background: 'radial-gradient(circle, rgba(95,245,255,0.2), transparent 70%)', borderRadius: '50%' }}></div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="auth-form-side">
            <div className="auth-form-header">
                <div className="auth-title">{isLogin ? 'Sign In' : 'Create Account'}</div>
                <div className="auth-subtitle">
                    {isLogin ? 'Enter your credentials to access the terminal.' : 'Initialize your developer profile.'}
                </div>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleAuth}>
                {!isLogin && (
                    <div className="auth-form-group">
                        <label className="auth-label">Email Address</label>
                        <div className="auth-input-wrapper">
                            <Mail className="auth-input-icon" size={18} />
                            <input 
                                className="auth-input" 
                                name="email" 
                                type="email" 
                                placeholder="developer@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>
                )}

                <div className="auth-form-group">
                    <label className="auth-label">Username</label>
                    <div className="auth-input-wrapper">
                        <User className="auth-input-icon" size={18} />
                        <input 
                            className="auth-input" 
                            name="username" 
                            type="text" 
                            placeholder="codewarrior"
                            value={formData.username}
                            onChange={handleChange}
                            required 
                        />
                    </div>
                </div>

                <div className="auth-form-group">
                    <label className="auth-label">Password</label>
                    <div className="auth-input-wrapper">
                        <Lock className="auth-input-icon" size={18} />
                        <input 
                            className="auth-input" 
                            name="password" 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 16, background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer' }}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {!isLogin && (
                    <div className="auth-form-group">
                        <label className="auth-label">Confirm Password</label>
                        <div className="auth-input-wrapper">
                            <Lock className="auth-input-icon" size={18} />
                            <input 
                                className="auth-input" 
                                name="confirmPassword" 
                                type="password" 
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>
                )}

                {!isLogin && (
                    <div className="auth-form-group">
                        <label className="auth-label">Target Career</label>
                        <div className="auth-input-wrapper">
                            <Briefcase className="auth-input-icon" size={18} />
                            <input 
                                className="auth-input" 
                                name="target_career" 
                                type="text" 
                                placeholder="e.g. Full Stack Developer"
                                value={formData.target_career}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>
                )}

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : (isLogin ? 'Access System' : 'Initialize Account')}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div className="auth-divider">
                <span>OR CONTINUE WITH</span>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('GitHub')}>
                    <Github size={18} /> GitHub
                </button>
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('Google')}>
                    <Chrome size={18} /> Google
                </button>
            </div>

            <div className="auth-toggle">
                {isLogin ? "New to the dojo?" : "Already verified?"}
                <a onClick={toggleMode}>
                    {isLogin ? "Create Account" : "Sign In"}
                </a>
            </div>
        </div>
      </div>
    </div>
  );
}