import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Code, Globe, Database, Zap, Sparkles, Layout, Server, Smartphone, BarChart3, PencilLine, Shield, Palette } from 'lucide-react';
import api from './api';
import './Onboarding.css';

const STEPS = ['Role', 'Experience', 'Profile', 'Building...'];

/* Icon lookup for roles fetched from catalog */
const ROLE_ICONS = {
  fullstack: <Globe size={22} />,
  frontend: <Layout size={22} />,
  backend: <Database size={22} />,
  data: <BarChart3 size={22} />,
  devops: <Server size={22} />,
  mobile: <Smartphone size={22} />,
  cybersecurity: <Shield size={22} />,
  ux: <Palette size={22} />,
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);

  const [form, setForm] = useState({
    role: null,
    level: null,
    gender: 'unspecified',
    budget: 'FREE',
    university_course: '',
    other_career_path: '',
  });

  /* Fetch available roles from catalog on mount */
  useEffect(() => {
    api.get('/api/roles/')
      .then(r => setRoles(r.data?.roles || []))
      .catch(() => {
        /* Fallback hardcoded list if API unreachable */
        setRoles([
          { key: 'fullstack', title: 'Full Stack Developer' },
          { key: 'frontend', title: 'Frontend Developer' },
          { key: 'backend', title: 'Backend Developer' },
          { key: 'data', title: 'Data Scientist' },
          { key: 'devops', title: 'DevOps Engineer' },
          { key: 'mobile', title: 'Mobile Developer' },
        ]);
      });
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const next = () => {
    setError(null);
    if (step < STEPS.length - 2) { setStep(s => s + 1); return; }
    setStep(s => s + 1);
    calibrate();
  };

  const back = () => { if (step > 0) setStep(s => s - 1); };

  const calibrate = async () => {
    setError(null);
    try {
      await api.post('/api/complete-onboarding/', {
        role: form.role === 'other' ? (form.other_career_path || '').trim() : form.role,
        university_course: form.university_course || 'Self-taught',
        budget: form.budget,
        gender: form.gender,
      });

      const res = await api.get('/api/profile/');
      const p = res.data?.profile || res.data;
      if (p?.username) localStorage.setItem('username', p.username);
      navigate('/dashboard');
    } catch (e) {
      console.error('Onboarding failed', e);
      setError(e?.response?.data?.error || 'Something went wrong. Please try again.');
      setStep(2);
    }
  };

  const disabled = () => {
    if (step === 0 && !form.role) return true;
    if (step === 0 && form.role === 'other' && !(form.other_career_path || '').trim()) return true;
    if (step === 1 && !form.level) return true;
    return false;
  };

  const content = () => {
    switch (step) {
      case 0:
        return (
          <>
            <h2 className="onboarding-title">What do you want to become?</h2>
            <p className="onboarding-subtitle">Pick a career goal — we'll build your roadmap around it.</p>
            <div className="options-grid">
              {roles.map(r => (
                <OptionCard
                  key={r.key}
                  icon={ROLE_ICONS[r.key] || <Code size={22} />}
                  label={r.title}
                  selected={form.role === r.key}
                  onClick={() => set('role', r.key)}
                />
              ))}
              <OptionCard
                icon={<PencilLine size={22} />}
                label="Other"
                selected={form.role === 'other'}
                onClick={() => set('role', 'other')}
              />
            </div>

            {form.role === 'other' && (
              <div style={{ width: '100%', marginTop: 12 }}>
                <label className="field-label">Enter your career path</label>
                <input
                  className="onboarding-input"
                  value={form.other_career_path}
                  onChange={e => set('other_career_path', e.target.value)}
                  placeholder="e.g. Cybersecurity Analyst"
                  maxLength={100}
                />
                <span className="field-hint">Keep it under 100 characters.</span>
              </div>
            )}
          </>
        );

      case 1:
        return (
          <>
            <h2 className="onboarding-title">Where are you now?</h2>
            <p className="onboarding-subtitle">This helps us calibrate difficulty and skip things you already know.</p>
            <div className="options-grid">
              <OptionCard icon={<Sparkles size={22} />} label="Beginner (0-1 yr)" selected={form.level === 'novice'} onClick={() => set('level', 'novice')} />
              <OptionCard icon={<Zap size={22} />} label="Intermediate (1-3 yrs)" selected={form.level === 'apprentice'} onClick={() => set('level', 'apprentice')} />
              <OptionCard icon={<Code size={22} />} label="Advanced (3+ yrs)" selected={form.level === 'pro'} onClick={() => set('level', 'pro')} />
              <OptionCard icon={<Cpu size={22} />} label="Expert (5+ yrs)" selected={form.level === 'expert'} onClick={() => set('level', 'expert')} />
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="onboarding-title">A few quick details</h2>
            <p className="onboarding-subtitle">Optional info that helps us personalise your plan.</p>
            <div className="options-grid single-col">
              <div style={{ width: '100%' }}>
                <label className="field-label">Gender (optional)</label>
                <select className="onboarding-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="unspecified">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="nonbinary">Non-binary</option>
                </select>
              </div>
              <div style={{ width: '100%' }}>
                <label className="field-label">Budget</label>
                <select className="onboarding-select" value={form.budget} onChange={e => set('budget', e.target.value)}>
                  <option value="FREE">Free resources only</option>
                  <option value="PAID">I can purchase courses</option>
                </select>
              </div>
              <div style={{ width: '100%' }}>
                <label className="field-label">University course (optional)</label>
                <input
                  className="onboarding-input"
                  value={form.university_course}
                  onChange={e => set('university_course', e.target.value)}
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
            <div className="calibration-loader" />
            <h2 className="onboarding-title">Building your roadmap...</h2>
            <p className="onboarding-subtitle">This usually takes a few seconds.</p>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {error && <div className="onboarding-error">{error}</div>}

        {step < 3 && (
          <div className="step-progress">
            {STEPS.slice(0, 3).map((_, i) => (
              <div key={i} className={`step-bar ${i < step ? 'completed' : ''} ${i === step ? 'active' : ''}`} />
            ))}
          </div>
        )}

        {content()}

        {step < 3 && (
          <div className="nav-buttons">
            <button className="btn-back" onClick={back} disabled={step === 0}>
              {step === 0 ? '' : 'Back'}
            </button>
            <button className="btn-next" onClick={next} disabled={disabled()}>
              {step === 2 ? 'Build My Roadmap' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function OptionCard({ icon, label, selected, onClick }) {
  return (
    <div className={`option-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="option-icon">{icon}</div>
      <span className="option-label">{label}</span>
    </div>
  );
}
