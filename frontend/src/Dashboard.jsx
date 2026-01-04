import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Terminal, Award, BookOpen, X, Send, ExternalLink, PlayCircle, Code, CheckCircle, RotateCw, Zap } from 'lucide-react';
import RoadmapMap from './RoadmapMap';
import MobileRoadmap from './components/MobileRoadmap';
import MobileModuleModal from './components/MobileModuleModal';
import { useIsMobile } from './hooks/useMediaQuery';

// --- HELPER: TYPEWRITER TEXT ---
const TypewriterText = ({ texts }) => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[index % texts.length];
    const speed = isDeleting ? 50 : 100;

    const timer = setTimeout(() => {
      if (!isDeleting && displayText === currentText) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setIndex(prev => prev + 1);
      } else {
        setDisplayText(
          isDeleting
            ? currentText.substring(0, displayText.length - 1)
            : currentText.substring(0, displayText.length + 1)
        );
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, texts]);

  return <span>{displayText}<span className="cursor">|</span></span>;
};

export default function Dashboard() {
  // --- STATE ---
  const [nodes, setNodes] = useState([]); // Raw nodes from backend
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [userData, setUserData] = useState({ level: 'Beginner' });
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showMoreResources, setShowMoreResources] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const navigate = useNavigate();
  const isMobile = useIsMobile(); // Detect mobile viewport

  // --- FETCH ROADMAP ---
  const fetchRoadmap = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/'); return; }

    try {
      const res = await api.post('/api/my-roadmap/', {});

      // Handle the response - ensure nodes is always an array
      const nodeData = res.data.nodes || res.data || [];
      const rawNodes = Array.isArray(nodeData) ? nodeData : [];

      // Deduplicate nodes based on content (label + step_order) to handle backend duplicates with different IDs
      const uniqueNodesMap = new Map();
      rawNodes.forEach(node => {
        // Create a unique key based on content
        const key = `${node.data.step_order}-${node.data.label}`;
        if (!uniqueNodesMap.has(key)) {
          uniqueNodesMap.set(key, node);
        }
      });
      const uniqueNodes = Array.from(uniqueNodesMap.values());

      setNodes(uniqueNodes);

      // If we only got the 3 fallback nodes, it means the endpoint returned a roadmap
      // This is fine - it either comes from DB or from Gemini API

      // AUTO-REGENERATE if fallback detected
      if (res.data.is_fallback && !regenerating) {
        console.log("Fallback roadmap detected. Initiating auto-regeneration...");
        handleRegenerateRoadmap();
      }
    } catch (err) {
      console.error("Load Error", err);
      if (err.response?.data) {
        console.error("BACKEND ERROR DETAILS:", err.response.data);
      }
      if (err.response && err.response.status === 401) {
        navigate('/');
      } else {
        // Set empty array on error to prevent undefined
        setNodes([]);
        alert("Failed to load roadmap. Please check console for details.");
      }
    }
  };

  // --- EFFECT: LOAD ROADMAP ---
  useEffect(() => {
    const loadRoadmap = async () => {
      await fetchRoadmap();
      setLoading(false);
    };
    loadRoadmap();
  }, [navigate]);

  // --- REGENERATE ROADMAP ---
  const handleRegenerateRoadmap = async () => {
    setRegenerating(true);
    setGenerationProgress(0);

    // Progress timer (60 seconds total)
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / 60); // Increment every second for 60 seconds
      });
    }, 1000);

    try {
      const token = localStorage.getItem('access_token');

      // Call the endpoint with force_regenerate flag
      const res = await api.post(
        '/api/my-roadmap/',
        { force_regenerate: true }
      );

      // Check if we got a real roadmap back (not fallback)
      if (res.data.is_fallback) {
        console.warn("Regeneration returned fallback again.");
        // We don't throw error to avoid crashing the UI, but we don't say "Success"
        setNodes(res.data.nodes || []);
        alert("AI is busy. Using offline roadmap. Try again later.");
      } else {
        // Update nodes with the newly generated roadmap
        const nodeData = res.data.nodes || res.data || [];
        setNodes(Array.isArray(nodeData) ? nodeData : []);
        setSelectedNode(null);

        setTimeout(() => {
          // alert("✅ Roadmap regenerated!"); 
        }, 500);
      }

      clearInterval(progressInterval);
      setGenerationProgress(100);

    } catch (err) {
      console.error("Regenerate Error", err);
      clearInterval(progressInterval);
      alert("Failed to regenerate roadmap.");
    } finally {
      setTimeout(() => {
        setRegenerating(false);
        setGenerationProgress(0);
      }, 1000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  // --- DAILY QUIZ LOGIC ---
  const openDailyQuiz = async () => {
    setShowQuiz(true);
    setQuizLoading(true);
    setQuizResult(null);
    setQuizAnswers({});

    try {
      const res = await api.get('/api/daily-quiz/');

      // Check if quiz was already completed
      if (res.data.quiz_completed) {
        alert(res.data.message);
        setShowQuiz(false);
        setQuizCompleted(true);
        return;
      }

      setQuizData(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load quiz. Make sure you have an active module!");
      setShowQuiz(false);
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = async () => {
    // Calculate score locally (simple check) or send to backend
    // Since backend doesn't store ephemeral quiz answers, we just send a "completed" signal
    // But wait, the user wants "first quiz of the day... streak +1".
    // We should at least ensure they answered all questions.

    if (!quizData || Object.keys(quizAnswers).length < quizData.questions.length) {
      alert("Please answer all questions!");
      return;
    }

    try {
      await api.post('/api/daily-quiz/submit/',
        { score: 100 } // We just claim completion for the streak
      );
      setQuizResult("STREAK EXTENDED! 🔥");
      setTimeout(() => {
        setShowQuiz(false);
        setQuizResult(null);
        setQuizCompleted(true);
      }, 2000);
    } catch (e) {
      alert("Error submitting quiz");
    }
  };

  const toggleShowMore = (nodeId) => {
    setShowMoreResources(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // SUBMIT PROJECT 
  const handleSubmitProject = async () => {
    if (!submissionLink) return alert("Please paste a link!");
    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');

      // Call Backend
      const res = await api.post(
        `/api/submit-project/${selectedNode.id}/`,
        { link: submissionLink }
      );

      // UPDATE LOCAL STATE
      setNodes((prevNodes) => prevNodes.map((node) => {
        // 1. Mark current node completed
        if (node.id === selectedNode.id) {
          return { ...node, data: { ...node.data, status: 'completed' } };
        }
        // 2. Unlock next node
        if (res.data.next_node && node.id === res.data.next_node.id) {
          return { ...node, data: { ...node.data, status: 'active' } };
        }
        return node;
      }));

      alert("Project Verified! Next Module Unlocked! 🚀");
      setSelectedNode(null);
      setSubmissionLink('');

    } catch (err) {
      console.error(err);
      alert("Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER ---
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: isMobile ? 'auto' : 'hidden' // Allow scrolling on mobile
    }}>

      {/* UNIFIED LOADING & REGENERATION OVERLAY */}
      {(loading || regenerating) && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '30px'
        }}>
          {/* CYBERPUNK LOADER ANIMATION */}
          <div className="cyber-loader" style={{ position: 'relative', width: '120px', height: '120px' }}>
            <div style={{
              position: 'absolute', inset: 0, border: '4px solid transparent',
              borderTopColor: 'var(--neon-cyan)', borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div style={{
              position: 'absolute', inset: '10px', border: '4px solid transparent',
              borderRightColor: 'var(--electric-purple)', borderRadius: '50%',
              animation: 'spin 1.5s linear infinite reverse'
            }}></div>
            <div style={{
              position: 'absolute', inset: '25px', background: 'rgba(0, 242, 255, 0.1)',
              borderRadius: '50%', boxShadow: '0 0 20px var(--neon-cyan)',
              animation: 'pulse 2s ease-in-out infinite'
            }}></div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontFamily: 'JetBrains Mono',
              color: 'var(--neon-cyan)',
              marginBottom: '10px',
              textShadow: '0 0 10px rgba(0, 242, 255, 0.5)',
              animation: 'glitch 1s infinite alternate'
            }}>
              {regenerating ? 'REGENERATING_SYSTEM...' : 'INITIALIZING_NEURAL_LINK...'}
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              fontFamily: 'JetBrains Mono',
              height: '20px' // Fixed height to prevent layout shift
            }}>
              <TypewriterText
                texts={[
                  "ANALYZING_CAREER_TRENDS...",
                  "CURATING_LEARNING_RESOURCES...",
                  "OPTIMIZING_PATH_MODULES...",
                  "CALIBRATING_DIFFICULTY...",
                  "FINALIZING_ROADMAP..."
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* QUIZ TERMINAL OVERLAY */}
      {showQuiz && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '800px', maxWidth: '95vw', height: '600px', maxHeight: '90vh',
            background: '#0d1117', border: '1px solid #30363d',
            borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {/* TERMINAL HEADER */}
            <div style={{
              background: '#161b22', padding: '10px 20px', borderBottom: '1px solid #30363d',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
              </div>
              <div style={{ color: '#8b949e', fontSize: '12px' }}>user@whatsnext:~/quiz</div>
              <button onClick={() => setShowQuiz(false)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            {/* TERMINAL BODY */}
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto', color: '#c9d1d9' }}>
              {quizLoading ? (
                <div style={{ color: '#58a6ff' }}>
                  <span className="blink">{'>'}</span> INITIALIZING_ASSESSMENT_PROTOCOL...
                </div>
              ) : quizResult ? (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏆</div>
                  <h2 style={{ color: '#2ea043', marginBottom: '10px' }}>ASSESSMENT_COMPLETE</h2>
                  <p style={{ color: '#8b949e' }}>{quizResult}</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '30px', borderBottom: '1px solid #30363d', paddingBottom: '20px' }}>
                    <div style={{ color: '#8b949e', fontSize: '12px', marginBottom: '5px' }}>TARGET_MODULE</div>
                    <h2 style={{ color: '#58a6ff', margin: 0 }}>{quizData?.module}</h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {quizData?.questions.map((q, i) => (
                      <div key={i} style={{ opacity: 1, transition: 'opacity 0.3s' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                          <span style={{ color: '#2ea043' }}>➜</span>
                          <span style={{ fontWeight: 'bold' }}>{q.question}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '25px' }}>
                          {q.options.map((opt, optI) => (
                            <label key={optI} style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '12px', borderRadius: '6px',
                              background: quizAnswers[i] === optI ? 'rgba(56, 139, 253, 0.15)' : 'transparent',
                              border: quizAnswers[i] === optI ? '1px solid #58a6ff' : '1px solid #30363d',
                              cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                              <div style={{
                                width: '16px', height: '16px', borderRadius: '50%',
                                border: quizAnswers[i] === optI ? '4px solid #58a6ff' : '2px solid #30363d',
                                background: 'none'
                              }}></div>
                              <span style={{ fontSize: '13px' }}>{opt}</span>
                            </label>
                          ))}
                        </div>

                        {/* HINT SECTION (Simulated) */}
                        <div style={{ marginTop: '15px', paddingLeft: '25px', fontSize: '12px', color: '#8b949e' }}>
                          <span style={{ color: '#d29922' }}>[?] HINT:</span> Review the {quizData?.module} documentation for details on this concept.
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #30363d', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={submitQuiz}
                      style={{
                        background: '#238636', color: '#fff', border: '1px solid rgba(240,246,252,0.1)',
                        padding: '10px 24px', borderRadius: '6px', cursor: 'pointer',
                        fontFamily: 'JetBrains Mono', fontWeight: 'bold'
                      }}
                    >
                      ./SUBMIT_ANSWERS.sh
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>

        {/* TOP BAR - DESKTOP ONLY */}
        {!isMobile && (
          <div style={{
            position: 'absolute', top: 20, left: 20, right: 20, zIndex: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            pointerEvents: 'none' // Let clicks pass through to map
          }}>
            {/* CYBERPUNK PROGRESS TRACKER */}
            <div style={{
              background: 'rgba(22, 27, 34, 0.9)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-subtle)', borderRadius: '16px',
              padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', pointerEvents: 'auto'
            }}>

              {/* Level Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={14} color="var(--neon-cyan)" />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                    SYS.LEVEL_{userData.level === 'Beginner' ? '01' : '02'}
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Inter' }}>
                  {userData.level.toUpperCase()} CLASS
                </span>
              </div>

              {/* Vertical Divider */}
              <div style={{ width: '1px', height: '32px', background: 'var(--border-subtle)' }}></div>

              {/* Progress Bar Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    MASTERY_PROGRESS
                  </span>
                  <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>
                    {nodes && nodes.length > 0 ? Math.round((nodes.filter(n => n.data.status === 'completed').length / Math.max(nodes.length, 1)) * 100) : 0}%
                  </span>
                </div>

                {/* The Bar */}
                <div style={{
                  height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)',
                  borderRadius: '3px', overflow: 'hidden', position: 'relative'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(nodes.filter(n => n.data.status === 'completed').length / Math.max(nodes.length, 1)) * 100}%`,
                    background: 'linear-gradient(90deg, var(--neon-cyan), var(--electric-purple))',
                    boxShadow: '0 0 10px var(--neon-cyan)',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}></div>
                </div>
              </div>

              {/* XP Badge */}
              <div style={{
                background: 'rgba(188, 19, 254, 0.1)', border: '1px solid rgba(188, 19, 254, 0.3)',
                borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <Award size={14} color="var(--electric-purple)" />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--electric-purple)', fontWeight: 'bold' }}>
                  1,240 XP
                </span>
              </div>

              {/* DAILY QUIZ BUTTON */}
              {!quizCompleted && (
                <button
                  onClick={openDailyQuiz}
                  style={{
                    background: 'rgba(255, 165, 0, 0.1)',
                    border: '1px solid orange',
                    color: 'orange',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                  }}
                >
                  <Zap size={14} />
                  DAILY_QUIZ
                </button>
              )}



            </div>
          </div>
        )}

        {/* MOBILE HEADER */}
        {isMobile && (
          <div style={{
            position: 'fixed', top: 10, left: 10, right: 10, zIndex: 100,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{
              background: 'rgba(22, 27, 34, 0.9)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-subtle)', borderRadius: '12px',
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px',
              pointerEvents: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={12} color="var(--neon-cyan)" />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>
                  LVL_{userData.level === 'Beginner' ? '01' : '02'}
                </span>
              </div>
              <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--neon-cyan)', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>
                  {nodes && nodes.length > 0 ? Math.round((nodes.filter(n => n.data.status === 'completed').length / Math.max(nodes.length, 1)) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Mobile Daily Quiz Button */}
            {!quizCompleted && (
              <button
                onClick={openDailyQuiz}
                style={{
                  background: 'rgba(255, 165, 0, 0.1)', border: '1px solid orange',
                  color: 'orange', borderRadius: '8px', padding: '8px',
                  cursor: 'pointer', pointerEvents: 'auto', display: 'flex', alignItems: 'center'
                }}
              >
                <Zap size={16} />
              </button>
            )}
          </div>
        )}

        {/* ROADMAP - Conditional Rendering (Mobile vs Desktop) */}
        {isMobile ? (
          <MobileRoadmap
            nodes={nodes}
            onNodeClick={(node) => setSelectedNode(node)}
          />
        ) : (
          <RoadmapMap
            nodes={nodes}
            onNodeClick={(e, node) => setSelectedNode(node)}
          />
        )}

      </div>

      {/* MOBILE MODULE MODAL (Full-screen on mobile) */}
      {isMobile && selectedNode && (
        <MobileModuleModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSubmitProject={handleSubmitProject}
          onMarkComplete={async (nodeId) => {
            try {
              await api.post(`/api/submit-project/${nodeId}/`, { project_link: 'completed' });
              await fetchRoadmap();
              setSelectedNode(null);
            } catch (error) {
              console.error('Mark complete error:', error);
            }
          }}
        />
      )}

      {/* SLIDE-OUT PANEL (Right) - Desktop Only */}
      {!isMobile && (
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: '600px', maxWidth: '50%', // Wider panel
          background: '#0d1117', // Solid dark background (Clean Tech)
          borderLeft: '1px solid #30363d', // Subtle border
          transform: selectedNode ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 20, display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
          fontFamily: 'Inter, sans-serif'
        }}>
          {selectedNode ? (
            <>
              <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                  <div>
                    <h2 style={{
                      margin: '0 0 8px 0',
                      fontSize: '24px',
                      color: '#c9d1d9',
                      fontFamily: 'JetBrains Mono',
                      fontWeight: '600',
                      letterSpacing: '-0.5px'
                    }}>
                      MODULE_{(selectedNode.data.step_order || 0).toString().padStart(2, '0')}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: selectedNode.data.status === 'completed' ? '#238636' : '#2f81f7'
                      }}></div>
                      <span style={{
                        color: '#8b949e',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono',
                        textTransform: 'uppercase'
                      }}>
                        STATUS: {selectedNode.data.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    style={{
                      background: 'none',
                      border: '1px solid #30363d',
                      borderRadius: '6px',
                      color: '#8b949e',
                      cursor: 'pointer',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b949e'; e.currentTarget.style.color = '#c9d1d9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#8b949e'; }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                  {/* DESCRIPTION */}
                  <div>
                    <h3 style={{
                      fontSize: '13px',
                      color: '#8b949e',
                      marginBottom: '12px',
                      fontFamily: 'JetBrains Mono',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                       // SYSTEM_DESCRIPTION
                    </h3>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: '#c9d1d9' }}>
                      {selectedNode.data.description}
                    </p>
                  </div>

                  {/* RESOURCES PREVIEW */}
                  {selectedNode?.data?.resources && (
                    <div>
                      <h3 style={{
                        fontSize: '13px',
                        color: '#8b949e',
                        marginBottom: '16px',
                        fontFamily: 'JetBrains Mono',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        // LEARNING_RESOURCES
                      </h3>

                      {/* PRIMARY RESOURCES (Always shown) */}
                      {selectedNode.data.resources.primary && selectedNode.data.resources.primary.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                          {selectedNode.data.resources.primary.map((resource, idx) => (
                            <a
                              key={idx}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px',
                                background: '#161b22',
                                border: '1px solid #30363d',
                                borderRadius: '6px',
                                color: '#c9d1d9',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#8b949e';
                                e.currentTarget.style.transform = 'translateX(4px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#30363d';
                                e.currentTarget.style.transform = 'translateX(0)';
                              }}
                            >
                              <span style={{ fontSize: '18px', opacity: 0.8 }}>
                                {resource.type === 'interactive' && '🎮'}
                                {resource.type === 'docs' && '📖'}
                                {resource.type === 'video' && '🎥'}
                                {resource.type === 'course' && '🎓'}
                              </span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{resource.title}</div>
                                <div style={{ fontSize: '12px', color: '#8b949e', fontFamily: 'JetBrains Mono' }}>
                                  {resource.type.toUpperCase()} • {idx === 0 ? 'RECOMMENDED' : 'ALTERNATIVE'}
                                </div>
                              </div>
                              <ExternalLink size={16} color="#8b949e" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* SHOW MORE BUTTON */}
                      {selectedNode.data.resources.additional && selectedNode.data.resources.additional.length > 0 && (
                        <>
                          {!showMoreResources[selectedNode.id] && (
                            <button
                              onClick={() => toggleShowMore(selectedNode.id)}
                              style={{
                                width: '100%',
                                padding: '10px',
                                background: 'transparent',
                                border: '1px dashed #30363d',
                                borderRadius: '6px',
                                color: '#8b949e',
                                cursor: 'pointer',
                                fontFamily: 'JetBrains Mono',
                                fontSize: '12px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b949e'; e.currentTarget.style.color = '#c9d1d9'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#8b949e'; }}
                            >
                              + EXPAND_ADDITIONAL_RESOURCES ({selectedNode.data.resources.additional.length})
                            </button>
                          )}

                          {/* ADDITIONAL RESOURCES (Shown when expanded) */}
                          {showMoreResources[selectedNode.id] && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                              {selectedNode.data.resources.additional.map((resource, idx) => (
                                <a
                                  key={idx}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px',
                                    background: '#161b22', // Slightly lighter surface
                                    border: '1px solid #30363d',
                                    borderRadius: '6px',
                                    color: '#8b949e',
                                    textDecoration: 'none',
                                    fontSize: '13px',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#8b949e';
                                    e.currentTarget.style.color = '#c9d1d9';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#30363d';
                                    e.currentTarget.style.color = '#8b949e';
                                  }}
                                >
                                  <span style={{ fontSize: '14px', opacity: 0.7 }}>
                                    {resource.type === 'interactive' && '🎮'}
                                    {resource.type === 'docs' && '📖'}
                                    {resource.type === 'video' && '🎥'}
                                    {resource.type === 'course' && '🎓'}
                                  </span>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{resource.title}</div>
                                    <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', opacity: 0.7 }}>
                                      {resource.type}
                                    </div>
                                  </div>
                                  <ExternalLink size={14} />
                                </a>
                              ))}

                              <button
                                onClick={() => toggleShowMore(selectedNode.id)}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  background: 'none',
                                  border: 'none',
                                  color: '#8b949e',
                                  cursor: 'pointer',
                                  fontFamily: 'JetBrains Mono',
                                  fontSize: '11px',
                                  marginTop: '4px',
                                  textDecoration: 'underline'
                                }}
                              >
                                COLLAPSE_RESOURCES

                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {/* VIEW ALL IN RESOURCES HUB */}
                      <button
                        onClick={() => navigate('/resources')}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'linear-gradient(90deg, var(--neon-cyan), var(--electric-purple))',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#000',
                          cursor: 'pointer',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        VIEW_ALL_IN_RESOURCES_HUB →
                      </button>
                    </div>
                  )}

                  {/* PROJECT SUBMISSION */}
                  <div style={{ opacity: selectedNode.data.status === 'locked' ? 0.5 : 1 }}>
                    <h3 style={{ fontSize: '14px', color: 'var(--text-header)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Code size={16} color="var(--success-green)" /> MISSION_OBJECTIVE
                    </h3>

                    <div style={{ background: 'rgba(22, 27, 34, 0.8)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        Build a project demonstrating your mastery of this module. Submit your GitHub repository link below.
                      </p>

                      <input
                        type="text"
                        placeholder="https://github.com/username/project"
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                        disabled={selectedNode.data.status === 'locked' || selectedNode.data.status === 'completed'}
                        style={{
                          width: '100%', padding: '12px', background: '#0d1117',
                          border: '1px solid var(--border-subtle)', borderRadius: '8px',
                          color: '#fff', fontFamily: 'JetBrains Mono', fontSize: '13px',
                          marginBottom: '15px', outline: 'none'
                        }}
                      />

                      <button
                        onClick={handleSubmitProject}
                        disabled={selectedNode.data.status === 'locked' || selectedNode.data.status === 'completed'}
                        style={{
                          width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                          background: selectedNode.data.status === 'completed' ? 'var(--success-green)' : 'var(--neon-cyan)',
                          color: '#000', fontWeight: 'bold', cursor: 'pointer',
                          opacity: selectedNode.data.status === 'locked' ? 0.5 : 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        {selectedNode.data.status === 'completed' ? (
                          <> <CheckCircle size={16} /> MISSION COMPLETE </>
                        ) : (
                          <> <Send size={16} /> SUBMIT_PROJECT </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a module to view details
            </div>
          )}
        </div>
      )}

    </div>
  );
}
