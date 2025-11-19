import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Register
      console.log("Sending Data:", formData); // Debug log
      await axios.post('http://127.0.0.1:8000/api/register/', formData);
      
      // 2. Login (Get Token)
      const res = await axios.post('http://127.0.0.1:8000/api/token/', {
        username: formData.username, 
        password: formData.password
      });
      
      // 3. Save Token & Redirect
      localStorage.setItem('access_token', res.data.access);
      navigate('/dashboard');
      
    } catch (err) {
      console.error("Signup Error:", err.response);
      // Extract the specific error message from Django
      if (err.response && err.response.data) {
        // Format the error JSON into a readable string
        const errorMsg = Object.entries(err.response.data)
          .map(([field, messages]) => `${field}: ${messages}`)
          .join(' | ');
        setError(errorMsg);
      } else {
        setError("Network Error or Server Offline");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050505', color: 'white', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ width: '400px', padding: '40px', border: '1px solid #333', borderRadius: '15px', background: '#111', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
        <h1 style={{ textAlign: 'center', color: '#00f2ff', marginBottom: '10px' }}>Start Your Journey</h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>Create your AI Roadmap Profile</p>
        
        {/* Error Display */}
        {error && (
          <div style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', color: '#ff4444', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Fields */}
        <input 
          style={inputStyle} 
          name="username" 
          placeholder="Username" 
          onChange={handleChange} 
          required 
        />
        
        <input 
          style={inputStyle} 
          name="email" 
          type="email" 
          placeholder="Email Address" 
          onChange={handleChange} 
          required // Added Email Field
        />

        <input 
          style={inputStyle} 
          name="password" 
          type="password" 
          placeholder="Password" 
          onChange={handleChange} 
          required 
        />
        
        <hr style={{ borderColor: '#333', margin: '20px 0' }} />
        
        <input 
          style={inputStyle} 
          name="target_career" 
          placeholder="Dream Career (e.g. Data Scientist)" 
          onChange={handleChange} 
          required 
        />
        
        <input 
          style={inputStyle} 
          name="university_course_raw" 
          placeholder="Uni Course (Optional)" 
          onChange={handleChange} 
        />
        
        <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Budget Preference</label>
        <select style={inputStyle} name="budget_preference" onChange={handleChange}>
          <option value="FREE">I need Free Resources</option>
          <option value="PAID">I can pay for courses</option>
        </select>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '15px', 
            background: loading ? '#555' : '#00f2ff', 
            color: loading ? '#ccc' : '#000',
            border: 'none', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            cursor: loading ? 'not-allowed' : 'pointer',
            borderRadius: '5px',
            marginTop: '10px',
            transition: '0.3s'
          }}>
          {loading ? 'Creating Account...' : 'Launch Roadmap 🚀'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = { 
  width: '100%', 
  padding: '12px', 
  marginBottom: '15px', 
  background: '#222', 
  border: '1px solid #444', 
  color: 'white',
  borderRadius: '5px',
  outline: 'none',
  boxSizing: 'border-box'
};