import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Briefcase, GraduationCap, ArrowRight, Sparkles, Code2, Zap, Github, Chrome, AlertCircle, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from './hooks/useMediaQuery';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Animated background particles
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear field-level errors for this field
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }

    if (error) setError(null);
  }

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengths = [
      { score: 0, text: '', color: '' },
      { score: 1, text: 'Weak', color: '#da3633' },
      { score: 2, text: 'Fair', color: '#fb8500' },
      { score: 3, text: 'Good', color: '#ffd60a' },
      { score: 4, text: 'Strong', color: '#2ea043' },
      { score: 5, text: 'Very Strong', color: '#00f2ff' }
    ];

    setPasswordStrength(strengths[score]);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password confirmation for signup
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await executeLogin(formData.username, formData.password, formData.rememberMe);
      } else {
        await api.post('/api/register/', formData);
        await executeLogin(formData.username, formData.password, formData.rememberMe);
      }
    } catch (err) {
      handleErrors(err);
    } finally {
      setLoading(false);
    }
  };

  const executeLogin = async (username, password, rememberMe) => {
    const res = await api.post('/api/token/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    if (rememberMe) {
      localStorage.setItem('refresh_token', res.data.refresh);
    }
    navigate('/dashboard');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Send password reset email via Formspree
      const response = await fetch('https://formspree.io/f/xovzoobd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          subject: 'Password Reset Request - What\'s Next',
          message: `Password reset requested for: ${formData.email}`
        })
      });

      if (response.ok) {
        setSuccess('Password reset link sent! Check your email.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setSuccess(null);
        }, 3000);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const providerPath = provider.toLowerCase();
    window.location.href = `${API_BASE_URL}/accounts/${providerPath}/login/`;
  };

  const handleErrors = (err) => {
    console.error("Auth Error Full:", err);
    console.error("Auth Error Response:", err.response);
    console.error("Auth Error Request:", err.request);
    console.error("Auth Error Config:", err.config);

    // Reset field errors
    setFieldErrors({});

    if (err.response && err.response.data) {
      const data = err.response.data;

      if (data.username) {
        const msg = Array.isArray(data.username) ? data.username[0] : data.username;
        setFieldErrors(prev => ({ ...prev, username: msg }));
        return;
      }

      if (data.email) {
        const msg = Array.isArray(data.email) ? data.email[0] : data.email;
        setFieldErrors(prev => ({ ...prev, email: msg }));
        return;
      }

      if (data.detail) {
        setError("Invalid credentials. Please check your password.");
        return;
      }

      const errorMsg = Object.entries(data)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(' | ') : messages}`)
        .join(' | ');
      setError(errorMsg);
    } else {
      setError("Server is offline or unreachable.");
    }
  };

  // Real-time validation: password mismatch + form validity
  const passwordMismatch = !isLogin && formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword;

  const isFormValid = () => {
    if (isLogin) {
      return formData.username && formData.password;
    } else {
      return (
        formData.username &&
        formData.email &&
        formData.password &&
        formData.confirmPassword &&
        formData.target_career &&
        !passwordMismatch
      );
    }
  };

  const getDisabledReason = () => {
    if (loading) return 'Processing...';
    if (isLogin) {
      if (!formData.username || !formData.password) return 'Please enter username and password';
      return '';
    } else {
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.target_career) return 'Please fill in all required fields';
      if (passwordMismatch) return 'Passwords do not match';
      return '';
    }
  };

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div style={styles.container}>
        <AnimatedBackground particles={particles} />

        <div style={styles.content}>
          <div style={{ ...styles.formCard, maxWidth: '400px', margin: '0 auto' }}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Reset Password</h2>
              <p style={styles.formSubtitle}>Enter your email to receive a reset link</p>
            </div>

            {error && <ErrorBanner message={error} />}
            {success && <SuccessBanner message={success} />}

            <form onSubmit={handleForgotPassword} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} color="#8b949e" />
                  <input
                    style={styles.input}
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  background: loading ? '#30363d' : 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div style={styles.toggleSection}>
              <button
                onClick={() => setShowForgotPassword(false)}
                style={styles.toggleButton}
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Auth View
  return (
    <div style={styles.container}>
      <AnimatedBackground particles={particles} />

      <div style={{
        ...styles.content,
        flexDirection: isMobile ? 'column' : 'row',
        padding: isMobile ? '20px' : '40px',
        gap: isMobile ? '20px' : '60px'
      }}>

        {/* Left Side - Branding */}
        {!isMobile && <div style={styles.brandingSection}>
          <div style={styles.logoContainer}>
            <Code2 size={48} color="#00f2ff" strokeWidth={2} />
            <h1 style={styles.brandTitle}>WHAT'S NEXT</h1>
          </div>

          <p style={styles.tagline}>
            AI-Powered Career Roadmaps
          </p>

          <div style={styles.features}>
            <div style={styles.featureItem}>
              <Sparkles size={20} color="#00f2ff" />
              <span>Personalized Learning Paths</span>
            </div>
            <div style={styles.featureItem}>
              <Zap size={20} color="#bc13fe" />
              <span>Real-Time Progress Tracking</span>
            </div>
            <div style={styles.featureItem}>
              <Briefcase size={20} color="#2ea043" />
              <span>Job-Ready Skills</span>
            </div>
          </div>
        </div>}

        {/* Right Side - Auth Form */}
        <div style={{
          ...styles.formSection,
          marginTop: '0px',
          maxWidth: isMobile ? '100%' : 'auto'
        }}>
          <div style={{
            ...styles.formCard,
            maxHeight: isMobile ? 'none' : '80vh',
            overflowY: isMobile ? 'visible' : 'auto',
            padding: isMobile ? '24px' : '40px'
          }}>


            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>
                {isLogin ? 'Welcome Back' : 'Start Your Journey'}
              </h2>
              <p style={styles.formSubtitle}>
                {isLogin ? 'Resume your roadmap progress' : 'Build your AI-powered career path'}
              </p>
            </div>

            {error && <ErrorBanner message={error} />}
            {success && <SuccessBanner message={success} />}

            {/* Social Login Buttons */}
            <div style={styles.socialButtons}>
              <button
                onClick={() => handleSocialLogin('Google')}
                style={styles.socialButton}
                type="button"
              >
                <Chrome size={18} />
                <span>Continue with Google</span>
              </button>
              <button
                onClick={() => handleSocialLogin('GitHub')}
                style={styles.socialButton}
                type="button"
              >
                <Github size={18} />
                <span>Continue with GitHub</span>
              </button>
            </div>

            <div style={styles.dividerContainer}>
              <div style={styles.divider}></div>
              <span style={styles.dividerText}>or</span>
              <div style={styles.divider}></div>
            </div>

            <form onSubmit={handleAuth} style={styles.form}>

              {/* Username */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                <div style={styles.inputWrapper}>
                  <User size={18} color="#8b949e" />
                  <input
                    style={styles.input}
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.username && <div style={{ color: '#da3633', fontSize: '12px', marginTop: '6px' }}>{fieldErrors.username}</div>}
              </div>

              {/* Password */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} color="#8b949e" />
                  <input
                    style={styles.input}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#8b949e', display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!isLogin && formData.password && (
                  <PasswordStrengthIndicator strength={passwordStrength} />
                )}
              </div>

              {/* Confirm Password (Signup Only) */}
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <div style={styles.inputWrapper}>
                    <Lock size={18} color="#8b949e" />
                    <input
                      style={styles.input}
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#8b949e', display: 'flex' }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordMismatch && <div style={{ color: '#da3633', fontSize: '12px', marginTop: '6px' }}>Passwords do not match</div>}
                </div>

              )}

              {/* Remember Me & Forgot Password */}
              {isLogin && (
                <div style={styles.loginOptions}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      style={styles.checkbox}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    style={styles.forgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Signup Only Fields */}
              {!isLogin && (
                <div style={styles.signupFields}>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email Address</label>
                    <div style={styles.inputWrapper}>
                      <Mail size={18} color="#8b949e" />
                      <input
                        style={styles.input}
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ ...styles.divider, margin: '10px 0' }}></div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Dream Career</label>
                    <div style={styles.inputWrapper}>
                      <Briefcase size={18} color="#8b949e" />
                      <input
                        style={styles.input}
                        name="target_career"
                        placeholder="e.g., Full-Stack Developer"
                        value={formData.target_career}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>University Course (Optional)</label>
                    <div style={styles.inputWrapper}>
                      <GraduationCap size={18} color="#8b949e" />
                      <input
                        style={styles.input}
                        name="university_course_raw"
                        placeholder="e.g., Computer Science"
                        value={formData.university_course_raw}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Learning Budget</label>
                    <select
                      style={styles.select}
                      name="budget_preference"
                      onChange={handleChange}
                      value={formData.budget_preference}
                    >
                      <option value="FREE">Free Resources Only</option>
                      <option value="PAID">Can Pay for Premium Courses</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isFormValid()}
                style={{
                  ...styles.submitButton,
                  background: (loading || !isFormValid()) ? '#30363d' : 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
                  cursor: (loading || !isFormValid()) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !isFormValid()) ? 0.6 : 1
                }}
                title={!isFormValid() ? getDisabledReason() : ""}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Launch Roadmap'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              {/* Disabled helper message */}
              {!isFormValid() && (
                <div style={{ color: '#8b949e', fontSize: '12px', marginTop: '8px' }}>{getDisabledReason()}</div>
              )}
            </form>

            <div style={styles.toggleSection}>
              <span style={styles.toggleText}>
                {isLogin ? "New to What's Next?" : "Already have an account?"}
              </span>
              <button
                onClick={() => setIsLogin(!isLogin)}
                style={styles.toggleButton}
              >
                {isLogin ? "Create Account" : "Sign In"}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// --- COMPONENTS ---

function AnimatedBackground({ particles }) {
  return (
    <>
      <div style={styles.bgGradient}></div>
      <div style={styles.bgGrid}></div>

      {/* Floating Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.id % 3 === 0 ? '#00f2ff' : particle.id % 3 === 1 ? '#bc13fe' : '#2ea043',
            borderRadius: '50%',
            opacity: 0.3,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            pointerEvents: 'none',
            boxShadow: `0 0 ${particle.size * 2}px currentColor`
          }}
        />
      ))}

      {/* Floating Code Snippets */}
      <div style={styles.codeSnippet1}>{'<Code />'}</div>
      <div style={styles.codeSnippet2}>{'{ AI }'}</div>
      <div style={styles.codeSnippet3}>{'=> Success'}</div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

function PasswordStrengthIndicator({ strength }) {
  if (!strength.text) return null;

  return (
    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        flex: 1,
        height: '4px',
        background: '#30363d',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(strength.score / 5) * 100}%`,
          height: '100%',
          background: strength.color,
          transition: 'all 0.3s'
        }}></div>
      </div>
      <span style={{ fontSize: '12px', color: strength.color, fontWeight: '500' }}>
        {strength.text}
      </span>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div role="alert" aria-live="assertive" style={styles.errorBanner}>
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}

function SuccessBanner({ message }) {
  return (
    <div role="status" aria-live="polite" style={styles.successBanner}>
      <CheckCircle2 size={18} />
      <span>{message}</span>
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d1117',
    overflow: 'auto',
    fontFamily: "'Inter', sans-serif"
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(0, 242, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(188, 19, 254, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none'
  },

  bgGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'linear-gradient(rgba(48, 54, 61, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(48, 54, 61, 0.4) 1px, transparent 1px)',
    backgroundSize: '50px 50px',
    pointerEvents: 'none',
    opacity: 0.4
  },

  codeSnippet1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    color: '#00f2ff',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '14px',
    opacity: 0.2,
    animation: 'float 15s ease-in-out infinite',
    pointerEvents: 'none'
  },

  codeSnippet2: {
    position: 'absolute',
    top: '70%',
    right: '15%',
    color: '#bc13fe',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '16px',
    opacity: 0.2,
    animation: 'float 18s ease-in-out infinite',
    animationDelay: '2s',
    pointerEvents: 'none'
  },

  codeSnippet3: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    color: '#2ea043',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px',
    opacity: 0.2,
    animation: 'float 20s ease-in-out infinite',
    animationDelay: '4s',
    pointerEvents: 'none'
  },

  content: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'row',
    gap: '60px',
    maxWidth: '1200px',
    width: '100%',
    padding: '40px'
  },

  brandingSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '30px'
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },

  brandTitle: {
    fontSize: '48px',
    fontWeight: '700',
    fontFamily: "'JetBrains Mono', monospace",
    background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  },

  tagline: {
    fontSize: '24px',
    color: '#c9d1d9',
    fontWeight: '300',
    margin: 0
  },

  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '20px'
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    color: '#8b949e',
    fontSize: '16px'
  },

  formSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  formCard: {
    width: '100%',
    maxWidth: '480px',
    background: 'rgba(22, 27, 34, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid #30363d',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
  },

  formHeader: {
    marginBottom: '30px',
    textAlign: 'center'
  },

  formTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#f0f6fc',
    margin: '0 0 10px 0',
    fontFamily: "'JetBrains Mono', monospace"
  },

  formSubtitle: {
    fontSize: '14px',
    color: '#8b949e',
    margin: 0
  },

  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(218, 54, 51, 0.1)',
    border: '1px solid #da3633',
    color: '#da3633',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    animation: 'fadeIn 0.3s'
  },

  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(46, 160, 67, 0.1)',
    border: '1px solid #2ea043',
    color: '#2ea043',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    animation: 'fadeIn 0.3s'
  },

  socialButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px'
  },

  socialButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    color: '#c9d1d9',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Inter', sans-serif"
  },

  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0'
  },

  dividerText: {
    fontSize: '12px',
    color: '#8b949e',
    fontWeight: '500'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#c9d1d9',
    fontFamily: "'JetBrains Mono', monospace"
  },

  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '0 16px',
    transition: 'all 0.2s'
  },

  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#c9d1d9',
    padding: '14px 0',
    outline: 'none',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif"
  },

  select: {
    width: '100%',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    color: '#c9d1d9',
    padding: '14px 16px',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif"
  },

  loginOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '-10px'
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#8b949e',
    cursor: 'pointer'
  },

  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },

  forgotPassword: {
    background: 'none',
    border: 'none',
    color: '#00f2ff',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: "'Inter', sans-serif"
  },

  signupFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    animation: 'fadeIn 0.3s ease-in'
  },

  divider: {
    height: '1px',
    background: '#30363d',
    flex: 1
  },

  submitButton: {
    width: '100%',
    padding: '16px',
    marginTop: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#0d1117',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s',
    fontFamily: "'JetBrains Mono', monospace",
    boxShadow: '0 4px 12px rgba(0, 242, 255, 0.3)'
  },

  toggleSection: {
    marginTop: '24px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },

  toggleText: {
    fontSize: '14px',
    color: '#8b949e'
  },

  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#00f2ff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: "'Inter', sans-serif"
  }
};