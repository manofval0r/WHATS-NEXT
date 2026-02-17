import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Github, Zap, Brain, TrendingUp, Users, Award, CheckCircle, ArrowRight, MessageSquare, Sparkles, MousePointer2 } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import Button from './components/common/Button';
import './Landing.css';

// Typewriter Hook
const useTypewriter = (texts, typingSpeed = 80, deletingSpeed = 50, pauseDuration = 3000) => {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const currentText = texts[textIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);
    
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);
  
  return displayText;
};

// Counter Animation Hook
const useCountUp = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    if (startOnView && !isInView) return;
    if (hasStarted) return;
    
    setHasStarted(true);
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      
      if (progress >= 1) clearInterval(timer);
    }, 16);
    
    return () => clearInterval(timer);
  }, [end, duration, isInView, startOnView, hasStarted]);
  
  return { count, ref };
};

// 3D Tilt Card Component
const TiltCard = ({ children, className, style }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    setRotateX(-mouseY / 20);
    setRotateY(mouseX / 20);
  };
  
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };
  
  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Magnetic Button Component
const MagneticButton = ({ children, onClick, className, style }) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.3;
    const distanceY = (e.clientY - centerY) * 0.3;
    
    setPosition({ x: distanceX, y: distanceY });
  };
  
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };
  
  return (
    <motion.div
      ref={buttonRef}
      className={className}
      style={style}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// Stagger Text Animation
const StaggerText = ({ text, className, delay = 0 }) => {
  const words = text.split(' ');
  
  return (
    <motion.span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ 
            duration: 0.5, 
            delay: delay + i * 0.1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Glitch Text Component
const GlitchText = ({ children, className }) => {
  return (
    <span className={`glitch-text ${className || ''}`} data-text={children}>
      {children}
    </span>
  );
};

// CountUp Stat Component for animated numbers
const CountUpStat = ({ end, prefix = '', suffix = '', label }) => {
  const { count, ref } = useCountUp(end, 1500);
  
  return (
    <div className="result-stat" ref={ref}>
      <span className="stat-val">{prefix}{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
};

// Simple count-up display for stats section
const CountUpDisplay = ({ end, decimals = 0 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [end]);
  
  return decimals > 0 ? count.toFixed(decimals) : Math.floor(count);
};

export default function Landing() {
  const navigate = useNavigate();

  // Smooth scroll to section
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    document.querySelector(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // --- STATE ---
  const [scrolled, setScrolled] = useState(false);
  const [demoState, setDemoState] = useState({ studying: '', wantToBe: '', loading: false, result: null });

  // --- REFS ---
  const heroRef = useRef(null);
  
  // Section refs for scroll animations
  const pipelineRef = useRef(null);
  const proofRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  
  // InView hooks for scroll-triggered animations
  const isPipelineInView = useInView(pipelineRef, { once: true, margin: "-100px" });
  const isProofInView = useInView(proofRef, { once: true, margin: "-100px" });
  const isStatsInView = useInView(statsRef, { once: true, margin: "-50px" });
  const isTestimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" });

  // --- SCROLL LISTENER ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handler
  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    if (!demoState.studying || !demoState.wantToBe) return;

    setDemoState(prev => ({ ...prev, loading: true }));
    await new Promise(r => setTimeout(r, 1500));
    setDemoState(prev => ({ ...prev, loading: false, result: true }));
    
    // Scroll to preview
    setTimeout(() => {
        const preview = document.querySelector('.holo-result');
        if (preview) preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  return (
    <div className="landing-page">

      
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a href="#" className="nav-logo"><BookOpen size={20}/> What's Next</a>
          <div className="nav-links">
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, '#how-it-works')}>How It Works</a>
            <a href="#features" onClick={(e) => scrollToSection(e, '#features')}>Features</a>
            <a href="#feedback" onClick={(e) => scrollToSection(e, '#feedback')}>Feedback</a>
          </div>
          <div className="nav-actions">
            <a href="/login" className="nav-login">Log In</a>
            <Button variant="primary" className="nav-cta" onClick={() => navigate('/signup')} size="sm">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 1: HERO - Clean Startup Welcome
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-bg-grid"></div>
        
        {/* Centered Content Stack */}
        <div className="hero-centered">
          {/* Badge */}
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={14} />
            <span>Your personalized dev career starts here</span>
          </motion.div>
          
          {/* Main Headline */}
          <motion.h1 
            className="hero-headline"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <GlitchText>Escape Tutorial Hell</GlitchText>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            className="hero-subtext"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            AI-generated roadmaps. Real projects. <span className="text-highlight">GitHub-verified skills.</span>
          </motion.p>
          
          {/* CTA - Single Strong Action */}
          <motion.div 
            className="hero-cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            {/* Animated Pointing Hand */}
            <motion.div 
              className="pointing-hand"
              animate={{ 
                x: [0, 8, 0],
                rotate: [-30, -38, -30]
              }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <MousePointer2 size={48} strokeWidth={1.5} />
            </motion.div>
            
            <a href="/signup" className="btn-primary-cta">
              Let's Go !!!
              <ArrowRight size={20} className="cta-arrow" />
            </a>
          </motion.div>
        </div>
        
        {/* Scroll Indicator - Desktop Only */}
        <motion.div 
          className="scroll-indicator desktop-only"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 2: RESOURCES BAR - Honest about where content comes from
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="section-resources">
        <p className="resources-label">Curating the best free resources from</p>
        <div className="resources-track">
          <div className="resources-slide">
            {['freeCodeCamp', 'MDN Web Docs', 'The Odin Project', 'Programming with Mosh', 'Traversy Media', 'Fireship', 'CS50', 'Full Stack Open'].map((resource, i) => (
              <div key={i} className="resource-item">{resource}</div>
            ))}
            {['freeCodeCamp', 'MDN Web Docs', 'The Odin Project', 'Programming with Mosh', 'Traversy Media', 'Fireship', 'CS50', 'Full Stack Open'].map((resource, i) => (
              <div key={`dup-${i}`} className="resource-item">{resource}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 3: HOW IT WORKS - Visual Timeline
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="section-how-it-works" ref={pipelineRef}>
        <div className="section-container">
          <motion.div 
            className="section-header-group"
            initial={{ opacity: 0, y: 30 }}
            animate={isPipelineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="section-eyebrow">HOW IT WORKS</span>
            <h2 className="section-title">From Zero to Hired in 4 Steps</h2>
            <p className="section-subtitle">
              Our AI-powered system creates a personalized path from where you are to where you want to be.
            </p>
          </motion.div>
          
          <div className="steps-grid">
            {[ 
              { 
                icon: <Brain size={28} />, 
                step: "01", 
                title: "Tell Us Your Goal", 
                desc: "Select your current background and dream role. Our AI analyzes thousands of career paths to find the optimal route.",
                highlight: "2 minutes to start"
              },
              { 
                icon: <Zap size={28} />, 
                step: "02", 
                title: "Get Your Roadmap", 
                desc: "JADA generates a custom curriculum with modules, lessons, and projects tailored to your specific learning style.",
                highlight: "Personalized content"
              },
              { 
                icon: <Github size={28} />, 
                step: "03", 
                title: "Build & Verify", 
                desc: "Complete real projects that push to your GitHub. Our verification system ensures code quality and validates your skills.",
                highlight: "Proof that matters"
              },
              { 
                icon: <TrendingUp size={28} />, 
                step: "04", 
                title: "Land Your Job", 
                desc: "Export your verified portfolio and certificates. Employers see green squares and real code, not just certificates.",
                highlight: "Average 3 months"
              }
            ].map((step, i) => (
              <motion.div 
                className="step-card" 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={isPipelineInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              >
                <div className="step-number">{step.step}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                <span className="step-highlight">{step.highlight}</span>
                {i < 3 && <div className="step-connector" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 4: FEATURES BENTO GRID
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="section-features" ref={proofRef}>
        <div className="section-container">
          <motion.div 
            className="section-header-group"
            initial={{ opacity: 0, y: 30 }}
            animate={isProofInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="section-eyebrow">FEATURES</span>
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-subtitle">
              Powerful tools designed to accelerate your learning and prove your skills.
            </p>
          </motion.div>
          
          <div className="bento-grid">
            {/* Large Feature Card - Interactive Demo */}
            <motion.div 
              className="bento-card bento-large"
              initial={{ opacity: 0, y: 30 }}
              animate={isProofInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bento-card-header">
                <span className="bento-tag">INTERACTIVE</span>
                <div className="window-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
              
              <div className="demo-interface">
                <form className="demo-form" onSubmit={handleDemoSubmit}>
                  <div className="demo-field">
                    <label>I am currently a...</label>
                    <select value={demoState.studying} onChange={e => setDemoState({...demoState, studying: e.target.value, result: null})}>
                      <option value="">Select your background</option>
                      <option value="cs">CS Student</option>
                      <option value="bio">Non-Tech Background</option>
                      <option value="self">Self-Taught Developer</option>
                    </select>
                  </div>
                  
                  <div className="demo-field">
                    <label>I want to become a...</label>
                    <select value={demoState.wantToBe} onChange={e => setDemoState({...demoState, wantToBe: e.target.value, result: null})}>
                      <option value="">Select your goal</option>
                      <option value="web">Full-Stack Engineer</option>
                      <option value="ai">AI/ML Engineer</option>
                      <option value="data">Data Scientist</option>
                    </select>
                  </div>
                  
                  <button type="submit" className="demo-btn" disabled={!demoState.studying || !demoState.wantToBe || demoState.loading}>
                    {demoState.loading ? (
                      <><span className="spinner"></span> Generating...</>
                    ) : (
                      <>Generate My Roadmap <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
                
                {demoState.result && (
                  <motion.div 
                    className="demo-result"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className="result-header">
                      <CheckCircle size={20} color="#2ea043" />
                      <span>Your path is ready!</span>
                    </div>
                    <div className="result-stats">
                      <div className="result-stat-item">
                        <span className="stat-value">~4 months</span>
                        <span className="stat-label">Est. Duration</span>
                      </div>
                      <div className="result-stat-item">
                        <span className="stat-value">8 Projects</span>
                        <span className="stat-label">To Build</span>
                      </div>
                      <div className="result-stat-item">
                        <span className="stat-value">142 Hours</span>
                        <span className="stat-label">Of Learning</span>
                      </div>
                    </div>
                    <a href="/signup" className="result-cta">Start This Journey →</a>
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            {/* Medium Cards */}
            <motion.div 
              className="bento-card bento-medium"
              initial={{ opacity: 0, y: 30 }}
              animate={isProofInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bento-icon"><Github size={32} /></div>
              <h3>GitHub Verified</h3>
              <p>Every project pushes real code to your GitHub. Build a contribution graph that speaks louder than any certificate.</p>
              <div className="github-preview">
                <div className="commit-graph">
                  {Array(35).fill(0).map((_, i) => (
                    <div key={i} className="commit-cell" style={{ opacity: Math.random() * 0.8 + 0.2 }} />
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bento-card bento-medium"
              initial={{ opacity: 0, y: 30 }}
              animate={isProofInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bento-icon"><Brain size={32} /></div>
              <h3>Adaptive AI</h3>
              <p>JADA learns how you learn. Struggling with a concept? Get extra resources automatically. Flying through? Skip ahead.</p>
              <div className="ai-visual">
                <motion.div
                  aria-hidden="true"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    rotate: [0, 2, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 28,
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.18), rgba(16,185,129,0.14), rgba(108,99,255,0.18))',
                    backgroundSize: '200% 200%',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(var(--glass-blur))',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.12, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      inset: 14,
                      borderRadius: 22,
                      background: 'radial-gradient(circle at 30% 30%, rgba(108,99,255,0.45), transparent 60%)',
                      filter: 'blur(6px)',
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Small Cards */}
            <motion.div 
              className="bento-card bento-small"
              initial={{ opacity: 0, y: 30 }}
              animate={isProofInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <TrendingUp size={24} />
              <h4>Market-Aligned</h4>
              <p>Curriculum updates weekly based on real job postings.</p>
            </motion.div>
            
            <motion.div 
              className="bento-card bento-small"
              initial={{ opacity: 0, y: 30 }}
              animate={isProofInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.55 }}
            >
              <Users size={24} />
              <h4>Peer Reviews</h4>
              <p>Get code reviewed by other developers in the community.</p>
            </motion.div>
            
            <motion.div 
              className="bento-card bento-small"
              initial={{ opacity: 0, y: 30 }}
              animate={isProofInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Award size={24} />
              <h4>Certificates</h4>
              <p>Earn verifiable certificates for completed modules.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats section removed - we're honest about being a new startup */}

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 6: FEEDBACK PROMPT - We're a startup, invite real feedback
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section id="feedback" className="section-feedback" ref={testimonialsRef}>
        <div className="section-container">
          <motion.div 
            className="feedback-card"
            initial={{ opacity: 0, y: 30 }}
            animate={isTestimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="feedback-icon">
              <MessageSquare size={32} />
            </div>
            <h2 className="feedback-title">We're Building This For You</h2>
            <p className="feedback-desc">
              We're a young startup on a mission to fix developer education. 
              Your feedback shapes what we build next.
            </p>
            <div className="feedback-cta-group">
              <a href="/signup" className="feedback-btn-primary">
                Try It Free & Tell Us What You Think
              </a>
              <a href="mailto:feedback@whatsnext.dev" className="feedback-btn-secondary">
                Or just email us directly
              </a>
            </div>
            <p className="feedback-note">
              Already using WHATS-NEXT? We'd love to hear your story.
            </p>
          </motion.div>
        </div>
      </section>


      {/* 🚀 SECTION 7: FINAL CTA (UNTOUCHED AS REQUESTED) */}
      <section className="section-invitation">
         <h2 className="invite-headline">
            BUILD.<br/>
            SHIP.<br/>
            GET HIRED.
         </h2>
         <p className="invite-sub">
            The only platform you'll need to get on your dream tech path and land that job. 
         </p>
         
         <div className="magnetic-btn-wrap">
             <Button variant="primary" size="lg" onClick={() => navigate('/signup')} 
                style={{ 
                    padding: '24px 80px', 
                    fontSize: '1.5rem', 
                    borderRadius: '100px',
                    boxShadow: '0 8px 30px rgba(108, 99, 255, 0.25)',
                    border: 'none'
                }}>
                 Start Building Now
             </Button>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="startup-footer">
           <div className="footer-grid">
                <div className="footer-brand">
                    <h4> <BookOpen size={24}/> What's Next</h4>
                    <p className="footer-desc">
                        We gather the resources so you dont have to. Stop searching and start learning.
                    </p>
                </div>
                
                <div className="footer-col">
                    <h5>Platform</h5>
                    <div className="footer-links">
                        <a href="#how-it-works" onClick={(e) => scrollToSection(e, '#how-it-works')}>How it Works</a>
                        <a href="#features" onClick={(e) => scrollToSection(e, '#features')}>Features</a>
                        <a href="#feedback" onClick={(e) => scrollToSection(e, '#feedback')}>Feedback</a>
                        <a href="/login">Login</a>
                    </div>
                </div>

                <div className="footer-col">
                    <h5>Community</h5>
                    <div className="footer-links">
                        <a href="#">Discord</a>
                        <a href="#">Twitter</a>
                        <a href="#">GitHub</a>
                        <a href="#">Blog</a>
                    </div>
                </div>

                <div className="footer-col">
                    <h5>Stay Updated</h5>
                    <input type="email" placeholder="Enter email..." className="newsletter-input" />
                    <Button variant="outline" size="sm" style={{width: '100%', justifyContent:'center'}}>Subscribe</Button>
                </div>
           </div>

           <div className="footer-bottom">
            <div>© {new Date().getFullYear()} WHATS-NEXT Inc.</div>
                <div style={{display:'flex', gap:'20px'}}>
                    <a href="#" style={{color:'inherit', textDecoration:'none'}}>Privacy</a>
                    <a href="#" style={{color:'inherit', textDecoration:'none'}}>Terms</a>
                    <a href="#" style={{color:'inherit', textDecoration:'none'}}>Security</a>
                </div>
           </div>
      </footer>
    </div>
  );
}
