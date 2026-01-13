import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import Button from './components/common/Button';
import Jada from './components/common/Jada';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  // --- STATE ---
  const [scrolled, setScrolled] = useState(false);
  const [demoState, setDemoState] = useState({ studying: '', wantToBe: '', loading: false, result: null });
  const [pathLabel, setPathLabel] = useState("CS → Web Dev");

  // --- REFS ---
  const roadmapRef = useRef(null);
  const observerRef = useRef(null);

  // --- SCROLL LISTENER ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- THREE.JS SCENE (The Shrine) ---
  useEffect(() => {
    if (!roadmapRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    const container = roadmapRef.current;
    
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Perspective camera from spec
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xa78bfa, 0.4); 
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x5ff5ff, 1.5);
    pointLight.position.set(0, 2, 4);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(0xff2e88, 0.8);
    rimLight.position.set(-3, -2, 2);
    scene.add(rimLight);

    // NODES (Torus) - ARC LAYOUT
    const geometry = new THREE.TorusGeometry(0.8, 0.15, 16, 32); 
    const material = new THREE.MeshStandardMaterial({
      color: 0x5ff5ff,
      emissive: 0x5ff5ff,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });

    const nodes = [];
    const arcRadius = 3; 
    const arcAngle = Math.PI / 3; 

    for (let i = 0; i < 3; i++) {
        const node = new THREE.Mesh(geometry, material.clone());
        const angle = -arcAngle/2 + (arcAngle/3) * i;
        node.position.x = Math.sin(angle) * arcRadius;
        node.position.y = Math.cos(angle) * arcRadius - 2; 
        node.position.z = 0;
        
        node.rotation.x = Math.random() * Math.PI;
        node.rotation.y = Math.random() * Math.PI;

        nodes.push(node);
        scene.add(node);
    }

    // CONNECTING CURVED LINES
    for (let i = 0; i < nodes.length - 1; i++) {
        const start = nodes[i].position;
        const end = nodes[i + 1].position;
        
        const curve = new THREE.QuadraticBezierCurve3(
            start,
            new THREE.Vector3((start.x + end.x) / 2, (start.y + end.y) / 2 + 0.5, 0),
            end
        );
        
        const points = curve.getPoints(50);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x5ff5ff, opacity: 0.6, transparent: true, linewidth: 2 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        
        // PARTICLES ALONG PATH
        const pGeo = new THREE.BufferGeometry();
        const pCount = 20;
        const pPos = new Float32Array(pCount * 3);
        
        // Initial positions
        for(let j=0; j<pCount; j++) {
            const t = j / pCount;
            const pt = curve.getPoint(t);
            pPos[j*3] = pt.x;
            pPos[j*3+1] = pt.y;
            pPos[j*3+2] = pt.z;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xffbe0b, size: 0.08, transparent: true, opacity: 0.8 });
        const particles = new THREE.Points(pGeo, pMat);
        // Store curve reference for animation
        particles.userData = { curve: curve, count: pCount };
        scene.add(particles);
    }

    // ANIMATION LOOP
    const animate = (time) => {
        requestAnimationFrame(animate);
        const t = time * 0.001; 

        // Rotate Global Scene
        scene.rotation.y = t * 0.15;

        // Animate Nodes
        nodes.forEach((node, idx) => {
            const offset = idx * 0.5;
            const scale = 1 + Math.sin(t * 2 + offset) * 0.1;
            node.scale.set(scale, scale, scale);
            node.material.emissiveIntensity = 0.3 + Math.sin(t * 2 + offset) * 0.2;
            node.rotation.x += 0.001;
            node.rotation.y += 0.002;
        });

        // Animate Particles
        scene.children.forEach(child => {
            if (child.type === 'Points' && child.userData.curve) {
                const curve = child.userData.curve;
                const count = child.userData.count;
                const positions = child.geometry.attributes.position.array;
                
                for(let i=0; i<count; i++) {
                    const progress = ((i / count) + t * 0.5) % 1; // Speed control
                    const pt = curve.getPoint(progress);
                    positions[i*3] = pt.x;
                    positions[i*3+1] = pt.y;
                    positions[i*3+2] = pt.z;
                }
                child.geometry.attributes.position.needsUpdate = true;
            }
        });

        renderer.render(scene, camera);
    };
    animate(0);

    const handleResize = () => {
        if (!container) return;
        width = container.clientWidth;
        height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        if (container && renderer.domElement) container.removeChild(renderer.domElement);
    };

  }, []);

  // --- PATH ROTATOR ---
  useEffect(() => {
    const paths = [
        { from: "CS", to: "Web Dev" },
        { from: "Biology", to: "AI Research" },
        { from: "Finance", to: "FinTech" },
        { from: "Physics", to: "Game Dev" },
        { from: "Self-Taught", to: "Full-Stack" },
        { from: "Design", to: "UI Engineer" }
    ];
    let idx = 0;
    const interval = setInterval(() => {
        idx = (idx + 1) % paths.length;
        setPathLabel(`${paths[idx].from} → ${paths[idx].to}`);
    }, 8000);
    return () => clearInterval(interval);
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
      <style>{`
        @media (max-width: 768px) {
          .hero-headline { font-size: 2.5rem !important; }
          .pipeline-container { flex-direction: column; gap: 40px; padding-left: 20px; }
          .pipeline-track { width: 4px; height: 100%; left: 40px; top: 0; transform: none; }
          .pipeline-track-fill { width: 100%; height: 50%; }
          .pipeline-node { flex-direction: row; text-align: left; gap: 20px; align-items: flex-start; width: 100%; }
          .pipeline-icon-wrapper { margin-bottom: 0; }
          .proof-grid { flex-direction: column; }
          .holo-card { width: 100%; min-height: auto; }
          .magnetic-btn-wrap button { padding: 16px 40px !important; font-size: 1.1rem !important; width: 100%; }
          .footer-grid { grid-template-columns: 1fr; gap: 40px; }
          .nav-links { display: none; }
          .nav-container { justify-content: space-between; }
          .nav-actions { gap: 10px; }
          .hero-subtext { font-size: 1rem; padding: 0 20px; }
          .cta-container { flex-direction: column; gap: 16px; width: 100%; padding: 0 20px; }
          .btn-primary-cta, .btn-secondary-cta { width: 100%; display: block; text-align: center; }
          
          /* Pipeline vertical adjustments */
          .pipeline-node::before { display: none; } /* Hide connector dots if they exist in CSS */
          .pipeline-step-num { position: static; transform: none; margin-bottom: 4px; display: block; }
          
          /* Holo form mobile */
          .holo-form { grid-template-columns: 1fr; }
        }
      `}</style>
      
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a href="#" className="nav-logo"> _ WHATS-NEXT</a>
          <div className="nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Proof</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="nav-actions">
            <a href="/login" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500 }}>Log In</a>
            <Button variant="primary" onClick={() => navigate('/signup')} size="sm">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* 🏛️ SECTION 1: THE SHRINE (HERO TUNED) */}
      <section className="hero-section">
        <div className="hero-bg-grid"></div>
        <div className="hero-fog"></div>

        {/* Floating Particles (Layer 3) */}
        {['<>', '{}', '[]', '//', '()', ';;'].map((sym, i) => (
            <div key={i} className="particle" style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 90 + 5}%`,
                animationDelay: `${Math.random() * 5}s`,
                fontSize: `${Math.random() * 1.5 + 1}rem`
            }}>
                {sym}
            </div>
        ))}
        
        {/* Accents */}
        <div className="corner-star star-1"></div>
        <div className="corner-star star-2"></div>
        <div className="corner-star star-3"></div>
        <div className="corner-star star-4"></div>
        <div className="corner-star star-5"></div>
        
        {/* Header Ornaments */}
        <div className="header-ornaments">
            <div className="ornament-star"></div>
            <div className="ornament-star"></div>
            <div className="ornament-star"></div>
        </div>

        {/* Headline */}
        <h1 className="hero-headline">
          <span className="headline-line1">ESCAPE TUTORIAL HELL</span>
          <span className="headline-underline"></span>
          <span className="headline-line2">Build Real Skills</span>
        </h1>

        {/* 3D Roadmap Preview */}
        <div className="roadmap-preview-container" ref={roadmapRef}>
            <div className="path-label">{pathLabel}</div>
        </div>

        {/* Subtext */}
        <p className="hero-subtext">
          Stop searching. Start learning.<br/>
          Tomorrow, you start building.
        </p>

        {/* CTAs */}
        <div className="cta-container">
            <a href="/signup" className="btn-primary-cta">
                Start Learning Now
            </a>
            <span className="cta-subtext">It's free to begin</span>
            <br />
            <a href="#how-it-works" className="btn-secondary-cta">
                See How It Works
            </a>
        </div>

      </section>


      {/* 📊 SECTION 2: THE PIPELINE (PROMISE) */}
      <section id="how-it-works" className="section-promise">
         <h2 className="section-header">The Spec-to-Job Pipeline</h2>
         <p className="section-subtext">
           A streamlined infrastructure designed to upgrade your human hardware.
         </p>
         
         <div className="pipeline-container">
            {/* Connecting Line */}
            <div className="pipeline-track">
                <div className="pipeline-track-fill"></div>
            </div>

            {/* Nodes */}
            {[ 
                { icon: "🎯", step: "01", title: "Targeting", desc: "Select your background and dream role." },
                { icon: "🧠", step: "02", title: "Generation", desc: "AI builds your custom curriculum." },
                { icon: "🔨", step: "03", title: "Execution", desc: "Build projects. Verify code." },
                { icon: "🚀", step: "04", title: "Deployment", desc: "Export CV. Get Hired." }
            ].map((node, i) => (
                <div className="pipeline-node" key={i}>
                    <div className="pipeline-icon-wrapper">{node.icon}</div>
                    <span className="pipeline-step-num">STEP {node.step}</span>
                    <h3 className="pipeline-title">{node.title}</h3>
                    <p className="pipeline-desc">{node.desc}</p>
                </div>
            ))}
         </div>
      </section>


      {/* 🎯 SECTION 3: PROOF (HOLOGRAPHIC SHOWCASE) */}
      <section id="features" className="section-proof">
        <h2 className="section-header">Proof of Work</h2>
        <p className="section-subtext">Interact with the system. See what you'll build.</p>
        
        <div className="proof-grid">
            {/* LARGE INTERACTIVE HOLO CARD */}
            <div className="holo-card">
                <div className="holo-header">
                    <span className="holo-tag">LIVE DEMO // V2.4</span>
                    <div style={{ display:'flex', gap:'8px' }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:'#ff5f56' }}></div>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:'#ffbd2e' }}></div>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:'#27c93f' }}></div>
                    </div>
                </div>

                <form className="holo-form" onSubmit={handleDemoSubmit}>
                    <div>
                        <label className="holo-label">CURRENT_STATE</label>
                        <select className="holo-select" value={demoState.studying} onChange={e => setDemoState({...demoState, studying: e.target.value})}>
                            <option value="">[ SELECT ORIGIN ]</option>
                            <option value="cs">CS Student</option>
                            <option value="bio">Non-Tech Degree</option>
                            <option value="self">Self-Taught</option>
                        </select>
                    </div>

                    <div>
                        <label className="holo-label">TARGET_OBJECTIVE</label>
                        <select className="holo-select" value={demoState.wantToBe} onChange={e => setDemoState({...demoState, wantToBe: e.target.value})}>
                            <option value="">[ SELECT DESTINATION ]</option>
                            <option value="web">Full-Stack Engineer</option>
                            <option value="ai">AI Research Scientist</option>
                            <option value="data">Data Analyst</option>
                        </select>
                    </div>

                    <button className="holo-btn" type="submit" disabled={demoState.loading || !demoState.studying}>
                        {demoState.loading ? 'COMPUTING PATH...' : 'INITIALIZE ROADMAP'}
                    </button>
                </form>

                {demoState.result && (
                    <div className="holo-result">
                        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                            <Jada size="sm" />
                            <span style={{ fontSize:'0.9rem', color:'#2ea043', fontWeight:'bold' }}>PATH_OPTIMIZED_SUCCESSFULLY</span>
                        </div>
                        
                        <div className="result-row">
                            <div className="result-stat">
                                <span className="stat-val">142h</span>
                                <span className="stat-label">EST. TIME</span>
                            </div>
                            <div className="result-stat">
                                <span className="stat-val">8</span>
                                <span className="stat-label">PROJECTS</span>
                            </div>
                            <div className="result-stat">
                                <span className="stat-val">+2400</span>
                                <span className="stat-label">EXP GAIN</span>
                            </div>
                        </div>

                        <div style={{ marginTop:'20px', padding:'16px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize:'0.9rem', color:'white', marginBottom:'4px' }}>Recommended Entry:</div>
                            <div style={{ color:'var(--neon-cyan)', fontFamily:'var(--font-mono)', fontSize:'0.85rem' }}>
                                &gt; Module 101: Foundations of {demoState.wantToBe === 'ai' ? 'Neural Networks' : 'Modern Web Systems'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FEATURE CARDS (SMALLER) */}
             <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[
                    { title: "GitHub Verified", desc: "Every project you complete pushes code to your GitHub. Employers see green squares, not certificates." },
                    { title: "Neural Adaptation", desc: "JADA adapts the curriculum as you learn. Struggle with React? Get extra resources automatically." },
                    { title: "Market Aligned", desc: "Curriculum updates weekly based on real job postings from FAANG and startups." }
                ].map((item, i) => (
                    <div key={i} style={{ 
                        padding: '32px', background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' 
                    }}>
                        <h4 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{item.title}</h4>
                        <p style={{ color: '#8b949e', lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                ))}
             </div>
        </div>
      </section>


      {/* 🚀 SECTION 4: INVITATION (STARTUP VIBE) */}
      <section className="section-invitation">
         <h2 className="invite-headline">
            BUILD.<br/>
            SHIP.<br/>
            GET HIRED.
         </h2>
         <p className="invite-sub">
            The only platform that cares about your GitHub graph more than your GPA.
         </p>
         
         <div className="magnetic-btn-wrap">
             <Button variant="primary" size="lg" onClick={() => navigate('/signup')} 
                style={{ 
                    padding: '24px 80px', 
                    fontSize: '1.5rem', 
                    borderRadius: '100px',
                    boxShadow: '0 0 60px rgba(0, 242, 255, 0.3)',
                    border: '1px solid white'
                }}>
                 Start Building Now
             </Button>
         </div>
      </section>

      {/* FOOTER (Using new class) */}
      <footer className="startup-footer">
          {/* ... footer content (keep grid from previous step, just ensure wrapper class matches) ... */}
           <div className="footer-grid">
               {/* Same footer content as before */}
                <div className="footer-brand">
                    <h4>⚡ WHATS-NEXT</h4>
                    <p className="footer-desc">
                        The AI-powered career accelerator for modern developers. Stop consuming tutorials. Start verifying skills.
                    </p>
                </div>
                
                <div className="footer-col">
                    <h5>Platform</h5>
                    <div className="footer-links">
                        <a href="#how">How it Works</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#stories">Success Stories</a>
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
