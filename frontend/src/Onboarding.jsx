import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Code, Globe, Database, Zap, Sparkles, Brain, Layout, Server, Smartphone, BarChart3, PencilLine } from 'lucide-react';
import api from './api';
import './Onboarding.css';

const STEPS = [
  "Role Selection",
  "Experience Level",
  "Profile Setup",
  "Calibration"
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [error, setError] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    role: null,
    level: null,
    gender: 'unspecified',
    budget: 'FREE',
    university_course: '',
    other_career_path: ''
  });

  const handleSelect = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setError(null);
    if (currentStep < STEPS.length - 2) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    // Final Step -> Calibration
    setCurrentStep(prev => prev + 1);
    startCalibration();
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const startCalibration = async () => {
    setIsCalibrating(true);
    setError(null);

    const roleToNiche = {
      fullstack: 'Full Stack Developer',
      frontend: 'Frontend Developer',
      backend: 'Backend Developer',
      data: 'Data Scientist',
      devops: 'DevOps Engineer',
      mobile: 'Mobile Developer',
    };

    const custom = (formData.other_career_path || '').trim();
    const niche = formData.role === 'other' ? custom : (roleToNiche[formData.role] || 'Software Development');

    try {
      await api.post('/api/complete-onboarding/', {
        niche,
        university_course: formData.university_course || 'Self-taught',
        budget: formData.budget,
        gender: formData.gender,
      });

      // Keep UI consistent
      const profileRes = await api.get('/api/profile/');
      const profile = profileRes.data?.profile || profileRes.data;
      if (profile?.username) localStorage.setItem('username', profile.username);

      navigate('/dashboard');
    } catch (e) {
      console.error('Onboarding failed', e);
      const msg = e?.response?.data?.error || 'Onboarding failed. Please try again.';
      setError(msg);
      setIsCalibrating(false);
      setCurrentStep(2);
    }
  };

  // Content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Role
        return (
          <>
            <h2 className="neural-title">Select Your Path</h2>
            <p className="neural-subtitle">Pick a target career path (or enter your own).</p>
            <div className="options-grid">
              <OptionCard 
                icon={<Globe />} 
                label="Full Stack Developer" 
                selected={formData.role === 'fullstack'} 
                onClick={() => handleSelect('role', 'fullstack')}
              />
              <OptionCard 
                icon={<Layout />} 
                label="Frontend Developer" 
                selected={formData.role === 'frontend'} 
                onClick={() => handleSelect('role', 'frontend')}
              />
              <OptionCard 
                icon={<Database />} 
                label="Backend Developer" 
                selected={formData.role === 'backend'} 
                onClick={() => handleSelect('role', 'backend')}
              />
              <OptionCard 
                icon={<BarChart3 />} 
                label="Data Scientist" 
                selected={formData.role === 'data'} 
                onClick={() => handleSelect('role', 'data')}
              />
              <OptionCard 
                icon={<Server />} 
                label="DevOps Engineer" 
                selected={formData.role === 'devops'} 
                onClick={() => handleSelect('role', 'devops')}
              />
              <OptionCard 
                icon={<Smartphone />} 
                label="Mobile Developer" 
                selected={formData.role === 'mobile'} 
                onClick={() => handleSelect('role', 'mobile')}
              />
              <OptionCard 
                icon={<PencilLine />} 
                label="Other" 
                selected={formData.role === 'other'} 
                onClick={() => handleSelect('role', 'other')}
              />
            </div>

            {formData.role === 'other' && (
              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.75)' }}>
                  Enter your career path
                </label>
                <input
                  value={formData.other_career_path}
                  onChange={(e) => handleSelect('other_career_path', e.target.value)}
                  placeholder="e.g. Cybersecurity Analyst"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', outline: 'none' }}
                />
                <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                  Keep it under 100 characters.
                </div>
              </div>
            )}
          </>
        );
      case 1: // Level
        return (
          <>
            <h2 className="neural-title">Experience Calibration</h2>
            <p className="neural-subtitle">Current technical proficiency level.</p>
            <div className="options-grid">
              <OptionCard 
                icon={<Sparkles />} 
                label="Novice (0-1 yr)" 
                selected={formData.level === 'novice'} 
                onClick={() => handleSelect('level', 'novice')}
              />
              <OptionCard 
                icon={<Zap />} 
                label="Apprentice (1-3 yrs)" 
                selected={formData.level === 'apprentice'} 
                onClick={() => handleSelect('level', 'apprentice')}
              />
              <OptionCard 
                icon={<Code />} 
                label="Professional (3+ yrs)" 
                selected={formData.level === 'pro'} 
                onClick={() => handleSelect('level', 'pro')}
              />
              <OptionCard 
                icon={<Cpu />} 
                label="Expert (5+ yrs)" 
                selected={formData.level === 'expert'} 
                onClick={() => handleSelect('level', 'expert')}
              />
            </div>
          </>
        );
      case 2: // Focus
        return (
          <>
             <h2 className="neural-title">Profile Setup</h2>
             <p className="neural-subtitle">Just enough info to personalize your roadmap.</p>

             <div className="options-grid single-col">
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.75)' }}>Gender (optional)</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleSelect('gender', e.target.value)}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', outline: 'none' }}
                >
                  <option value="unspecified">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="nonbinary">Non-binary</option>
                </select>
              </div>

              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.75)' }}>Budget</label>
                <select
                  value={formData.budget}
                  onChange={(e) => handleSelect('budget', e.target.value)}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', outline: 'none' }}
                >
                  <option value="FREE">Free resources only</option>
                  <option value="PAID">I can purchase courses</option>
                </select>
              </div>

              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.75)' }}>University course (optional)</label>
                <input
                  value={formData.university_course}
                  onChange={(e) => handleSelect('university_course', e.target.value)}
                  placeholder="e.g. Computer Science"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', outline: 'none' }}
                />
              </div>
             </div>
          </>
        );
      case 3: // Calibration (Loading)
        return (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0'}}>
             <div className="calibration-loader"></div>
             <h2 className="neural-title">Initializing Neural Link...</h2>
             <p className="neural-subtitle">Generating dynamic roadmap based on your profile.</p>
          </div>
        );
      default: return null;
    }
  };

  // disable next button if current step selection is empty
  const isNextDisabled = () => {
    if (currentStep === 0 && !formData.role) return true;
    if (currentStep === 0 && formData.role === 'other' && !String(formData.other_career_path || '').trim()) return true;
    if (currentStep === 1 && !formData.level) return true;
    return false;
  };

  return (
    <div className="onboarding-container">
        <div className="neural-overlay"></div>
        
        <div className="onboarding-card">
            {error && (
              <div style={{
                marginBottom: 16,
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid rgba(239, 68, 68, 0.5)',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#fecaca',
                fontSize: 14
              }}>
                {error}
              </div>
            )}

            {currentStep < 3 && (
                <div className="step-indicator">
                    {STEPS.slice(0,3).map((_, idx) => (
                        <div key={idx} className={`step-dot ${idx <= currentStep ? 'active' : ''}`}></div>
                    ))}
                </div>
            )}

            {renderStepContent()}

            {currentStep < 3 && (
                <div className="nav-buttons">
                    <button className="btn-back" onClick={handleBack} disabled={currentStep === 0}>
                        {currentStep === 0 ? '' : 'BACK'}
                    </button>
                    <button 
                        className="btn-next" 
                        onClick={handleNext} 
                        disabled={isNextDisabled()}
                    >
                        {currentStep === 2 ? 'INITIALIZE' : 'NEXT'}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}

// Sub-component for options
function OptionCard({ icon, label, selected, onClick }) {
    return (
        <div className={`option-card ${selected ? 'selected' : ''}`} onClick={onClick}>
            <div className="option-icon">{icon}</div>
            <span className="option-label">{label}</span>
        </div>
    );
}
