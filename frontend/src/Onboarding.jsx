import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Code, Globe, Database, Zap, Sparkles, Brain, Layout } from 'lucide-react';
import './Onboarding.css';

const STEPS = [
  "Role Selection",
  "Experience Level",
  "Learning Focus",
  "Calibration"
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    role: null,
    level: null,
    focus: null
  });

  const handleSelect = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final Step -> Calibration
      setCurrentStep(prev => prev + 1);
      startCalibration();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    // Fake async process
    setTimeout(() => {
        navigate('/roadmap'); // Redirect to Dashboard after "calibration"
    }, 3000);
  };

  // Content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Role
        return (
          <>
            <h2 className="neural-title">Select Your Path</h2>
            <p className="neural-subtitle">Which archetype aligns with your goals?</p>
            <div className="options-grid">
              <OptionCard 
                icon={<Globe />} 
                label="Full Stack Developer" 
                selected={formData.role === 'fullstack'} 
                onClick={() => handleSelect('role', 'fullstack')}
              />
              <OptionCard 
                icon={<Layout />} 
                label="Frontend Engineer" 
                selected={formData.role === 'frontend'} 
                onClick={() => handleSelect('role', 'frontend')}
              />
              <OptionCard 
                icon={<Database />} 
                label="Backend Architect" 
                selected={formData.role === 'backend'} 
                onClick={() => handleSelect('role', 'backend')}
              />
              <OptionCard 
                icon={<Brain />} 
                label="AI Engineer" 
                selected={formData.role === 'ai'} 
                onClick={() => handleSelect('role', 'ai')}
              />
            </div>
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
             <h2 className="neural-title">Learning Directive</h2>
             <p className="neural-subtitle">What is your primary optimization target?</p>
             <div className="options-grid single-col">
              <OptionCard 
                icon={<Cpu />} 
                label="Build Real-World Projects" 
                selected={formData.focus === 'projects'} 
                onClick={() => handleSelect('focus', 'projects')}
              />
              <OptionCard 
                icon={<Database />} 
                label="Master Computer Science Fundamentals" 
                selected={formData.focus === 'foundations'} 
                onClick={() => handleSelect('focus', 'foundations')}
              />
               <OptionCard 
                icon={<Zap />} 
                label="Fast-Track Career Switch" 
                selected={formData.focus === 'career'} 
                onClick={() => handleSelect('focus', 'career')}
              />
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
    if (currentStep === 1 && !formData.level) return true;
    if (currentStep === 2 && !formData.focus) return true;
    return false;
  };

  return (
    <div className="onboarding-container">
        <div className="neural-overlay"></div>
        
        <div className="onboarding-card">
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
