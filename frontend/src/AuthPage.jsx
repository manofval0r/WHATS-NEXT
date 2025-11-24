import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Briefcase, GraduationCap, ArrowRight } from 'lucide-react'; // Icons for better UX


export default function AuthPage() {
  // Toggle between Login and Signup
  const [isLogin, setIsLogin] = useState(false); // Default to Signup as per your flow

  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    target_career: '', 
    university_course_raw: '', 
    budget_preference: 'FREE' 
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- HANDLERS ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError(null);
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // FLOW A: LOGIN
      if (isLogin) {
        await executeLogin(formData.username, formData.password);
      } 
      // FLOW B: SIGNUP
      else {
        // 1. Create Account
        await axios.post('http://127.0.0.1:8000/api/register/', formData);
        // 2. Auto-Login immediately
        await executeLogin(formData.username, formData.password);
      }
    } catch (err) {
      handleErrors(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to Log In and Redirect
  const executeLogin = async (username, password) => {
    const res = await axios.post('http://127.0.0.1:8000/api/token/', {
      username, password
    });
    localStorage.setItem('access_token', res.data.access);
    navigate('/dashboard');
  };

  // Helper to handle Backend Errors
  const handleErrors = (err) => {
    console.error("Auth Error:", err.response);
    
    if (err.response && err.response.data) {
      const data = err.response.data;

      // Specific check for Duplicate User
      if (data.username && data.username[0].includes("already exists")) {
        setError("Username is taken. If this is you, please Login.");
        return;
      }
      
      // Check for Login Fail
      if (data.detail) {
        setError("Invalid credentials. Please check your password.");
        return;
      }

      // Generic formatting for other errors
      const errorMsg = Object.entries(data)
        .map(([field, messages]) => `${field}: ${messages}`)
        .join(' | ');
      setError(errorMsg);
    } else {
      setError("Server is offline or unreachable.");
    }
  };

  // --- RENDER ---

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Fondamento', cursive", minHeight: '100vh', background: '#050505', color: 'white' }}>
      
      <div style={{ width: '400px', padding: '40px', borderRadius: '15px', background: '#0a0a0a', border: '1px solid #222', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, color: '#00f2ff', fontSize: '60px', fontWeight: 'bold', background: 'linear-gradient(90deg, #00f2ff, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Caesar Dressing', cursive" }}>
            {isLogin ? 'Welcome Back' : 'Start Your Journey'}
          </h1>
          <p style={{ fontSize:'20px', color: '#666', marginTop: '10px' }}>
            {isLogin ? 'Resume your roadmap progress' : 'Build your AI Career Path'}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '16px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleAuth}>
          
          {/* COMMON FIELDS (Username/Pass) */}
          <div style={inputWrapperStyle}>
            <User size={18} color="#666" />
            <input style={inputStyle} name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          </div>

          <div style={inputWrapperStyle}>
            <Lock size={18} color="#666" />
            <input style={inputStyle} name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          </div>

          {/* SIGNUP ONLY FIELDS */}
          {!isLogin && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              
              <div style={inputWrapperStyle}>
                <Mail size={18} color="#666" />
                <input style={inputStyle} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
              </div>

              <hr style={{ borderColor: '#222', margin: '20px 0' }} />
              
              <div style={inputWrapperStyle}>
                <Briefcase size={18} color="#666" />
                <input style={inputStyle} name="target_career" placeholder="Dream Career (e.g. Web Dev)" value={formData.target_career} onChange={handleChange} required />
              </div>

              <div style={inputWrapperStyle}>
                <GraduationCap size={18} color="#666" />
                <input style={inputStyle} name="university_course_raw" placeholder="Uni Course (Optional)" value={formData.university_course_raw} onChange={handleChange} />
              </div>

              <select style={{ ...inputStyle, padding: '10px', width: '100%', border: '1px solid #333', borderRadius: '5px', color: 'grey',marginTop: '10px' }} name="budget_preference" onChange={handleChange} value={formData.budget_preference}>
                <option value="FREE">I need Free Resources</option>
                <option value="PAID">I can pay for courses</option>
              </select>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '15px', 
              marginTop: '20px',
              background: loading ? '#333' : 'linear-gradient(90deg, #00f2ff, #0099ff)', 
              color: loading ? '#888' : '#000',
              border: 'none', 
              borderRadius: '8px',
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: loading ? 'wait' : 'pointer',
              transition: '0.3s',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px'
            }}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Launch Roadmap')}
            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        {/* TOGGLE SWITCH */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#888' }}>
          {isLogin ? "New here?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: '#00f2ff', marginLeft: '5px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? "Create Account" : "Log In"}
          </button>
        </div>

      </div>
    </div>
  );
}

// --- STYLES ---
const inputWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  background: '#151515',
  border: '1px solid #333',
  borderRadius: '8px',
  padding: '0 15px',
  marginBottom: '15px'
};

const inputStyle = { 
  flex: 1,
  background: 'transparent',
  border: 'none',
  color: 'white',
  padding: '15px',
  outline: 'none',
  fontSize: '14px'
};