import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Code, Globe, Database, Zap, Sparkles, Layout, Server, Smartphone, BarChart3, PencilLine, Shield, Palette, ChevronRight, ArrowLeft } from 'lucide-react';
import api from './api';
import './Onboarding.css';

const STEPS = ['Role', 'Experience', 'Profile', 'Building...'];

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
  const [dir, setDir] = useState(1); // 1 = forward, -1 = back (for animations)
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const contentRef = useRef(null);
  const calibratingRef = useRef(false);

  const [form, setForm] = useState({
    role: null,
    level: null,
    gender: 'unspecified',
    budget: 'FREE',
    university_course: '',
    other_career_path: '',
  });

  /* Skip-guard: if user already has a career, redirect to dashboard */
  useEffect(() => {
    api.get('/api/profile/')
      .then(r => {
        const p = r.data?.profile || r.data;
        if (p?.target_career) navigate('/dashboard', { replace: true });
      })
      .catch(() => { /* not logged in — ProtectedRoute will handle */ });
  }, [navigate]);

  /* Fetch roles */
  useEffect(() => {
    api.get('/api/roles/')
      .then(r => setRoles(r.data?.roles || []))
      .catch(() => {
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

  /* Keyboard navigation: Enter → next, Escape → back */
  useEffect(() => {
    const handleKey = (e) => {
      if (step >= 3) return; // no nav during building
      if (e.key === 'Enter' && !disabled()) { e.preventDefault(); next(); }
      if (e.key === 'Escape' && step > 0) { e.preventDefault(); back(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }); // intentionally no deps — reads step/form via closure on each render

  const goTo = (target) => {
    setDir(target > step ? 1 : -1);
    setError(null);
    setStep(target);
  };

  const next = () => {
    if (step < STEPS.length - 2) { goTo(step + 1); return; }
    goTo(STEPS.length - 1);
    calibrate();
  };

  const back = () => { if (step > 0) goTo(step - 1); };

  const calibrate = async () => {
    if (calibratingRef.current) return;
    calibratingRef.current = true;
    setError(null);
    try {
      await api.post('/api/complete-onboarding/', {
        role: form.role === 'other' ? (form.other_career_path || '').trim() : form.role,
        university_course: form.university_course || 'Self-taught',
        budget: form.budget,
        gender: form.gender,
        level: form.level,
      });
      const res = await api.get('/api/profile/');
      const p = res.data?.profile || res.data;
      if (p?.username) localStorage.setItem('username', p.username);
      navigate('/dashboard');
    } catch (e) {
      console.error('Onboarding failed', e);
      setError(e?.response?.data?.error || 'Something went wrong. Please try again.');
      calibratingRef.current = false;
      goTo(2);
    }
  };

  const disabled = () => {
    if (step === 0 && !form.role) return true;
    if (step === 0 && form.role === 'other' && !(form.other_career_path || '').trim()) return true;
    if (step === 1 && !form.level) return true;
    return false;
  };

  /* ─── Step content renderer ─── */
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
              <div className="other-input-wrap">
                <label className="field-label">Enter your career path</label>
                <input
                  className="onboarding-input"
                  value={form.other_career_path}
                  onChange={e => set('other_career_path', e.target.value)}
                  placeholder="e.g. Cybersecurity Analyst"
                  maxLength={100}
                  autoFocus
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
            <p className="onboarding-subtitle">This calibrates difficulty so we skip things you already know.</p>
            <div className="options-grid level-grid">
              {[
                { key: 'novice', icon: <Sparkles size={22} />, label: 'Beginner', desc: '0 – 1 year' },
                { key: 'apprentice', icon: <Zap size={22} />, label: 'Intermediate', desc: '1 – 3 years' },
                { key: 'pro', icon: <Code size={22} />, label: 'Advanced', desc: '3 – 5 years' },
                { key: 'expert', icon: <Cpu size={22} />, label: 'Expert', desc: '5+ years' },
              ].map(l => (
                <OptionCard
                  key={l.key}
                  icon={l.icon}
                  label={l.label}
                  desc={l.desc}
                  selected={form.level === l.key}
                  onClick={() => set('level', l.key)}
                />
              ))}
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="onboarding-title">A few quick details</h2>
            <p className="onboarding-subtitle">Optional info that helps personalise your plan.</p>
            <div className="profile-fields">
              <div className="field-group">
                <label className="field-label">Gender (optional)</label>
                <select className="onboarding-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="unspecified">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="nonbinary">Non-binary</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Budget</label>
                <select className="onboarding-select" value={form.budget} onChange={e => set('budget', e.target.value)}>
                  <option value="FREE">Free resources only</option>
                  <option value="PAID">I can purchase courses</option>
                </select>
              </div>
              <div className="field-group">
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
        return <BuildingState />;

      default: return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {error && <div className="onboarding-error">{error}</div>}

        {/* Progress bar */}
        {step < 3 && (
          <div className="step-progress">
            {STEPS.slice(0, 3).map((label, i) => (
              <div key={i} className={`step-bar ${i < step ? 'completed' : ''} ${i === step ? 'active' : ''}`}>
                <span className="step-bar-label">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Animated content area */}
        <div className="step-content-area" ref={contentRef} key={step}>
          <div className={`step-slide ${dir > 0 ? 'slide-in-right' : 'slide-in-left'}`}>
            {content()}
          </div>
        </div>

        {/* Navigation */}
        {step < 3 && (
          <div className="nav-buttons">
            <button className="btn-back" onClick={back} disabled={step === 0}>
              {step > 0 && <><ArrowLeft size={16} /> Back</>}
            </button>
            <button className="btn-next" onClick={next} disabled={disabled()}>
              {step === 2 ? 'Build My Roadmap' : 'Continue'}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function OptionCard({ icon, label, desc, selected, onClick }) {
  return (
    <div className={`option-card ${selected ? 'selected' : ''}`} onClick={onClick} tabIndex={0} role="button"
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onClick(); } }}>
      <div className="option-icon">{icon}</div>
      <span className="option-label">{label}</span>
      {desc && <span className="option-desc">{desc}</span>}
      {selected && <span className="option-check">✓</span>}
    </div>
  );
}

/* ─── Loading state with rotating tips ─── */
const TIPS = [
  'Your roadmap typically has 8–12 modules.',
  'We\'ll personalise resources to your budget.',
  'Each module has a hands-on project to prove mastery.',
  'You can pivot your career path anytime later.',
  'Projects are verified by the community.',
];

function BuildingState() {
  const [tipIdx, setTipIdx] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="building-state">
      <div className="calibration-loader" />
      <h2 className="onboarding-title">Building your roadmap...</h2>
      <p className="onboarding-subtitle">This usually takes a few seconds.</p>
      <div className="skeleton-preview">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-pill" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </div>
      <p className="rotating-tip" key={tipIdx}>{TIPS[tipIdx]}</p>
    </div>
  );
}
