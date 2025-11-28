import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Terminal, Award, BookOpen, X, Send, ExternalLink, PlayCircle, Code, CheckCircle, RotateCw, Zap } from 'lucide-react';
import RoadmapMap from './RoadmapMap';

export default function Dashboard() {
  // --- STATE ---
  const [nodes, setNodes] = useState([]); // Raw nodes from backend
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
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

  // --- FETCH ROADMAP ---
  const fetchRoadmap = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/'); return; }

    try {
      const res = await api.post('/api/my-roadmap/', {});

      // Handle the response - ensure nodes is always an array
      const nodeData = res.data.nodes || res.data || [];
      setNodes(Array.isArray(nodeData) ? nodeData : []);

      // If we only got the 3 fallback nodes, it means the endpoint returned a roadmap
      // This is fine - it either comes from DB or from Gemini API
    } catch (err) {
      console.error("Load Error", err);
      if (err.response && err.response.status === 401) {
        navigate('/');
      } else {
        // Set empty array on error to prevent undefined
        setNodes([]);
        alert("Failed to load roadmap. Please try again.");
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
    try {
      const token = localStorage.getItem('access_token');

      // Call the endpoint with force_regenerate flag
      const res = await api.post(
        '/api/my-roadmap/',
        { force_regenerate: true }
      );

      // Update nodes with the newly generated roadmap
      const nodeData = res.data.nodes || res.data || [];
      setNodes(Array.isArray(nodeData) ? nodeData : []);
      setSelectedNode(null); // Close any open panel
      alert("✅ Roadmap regenerated!");
    } catch (err) {
      console.error("Regenerate Error", err);
      alert("Failed to regenerate roadmap.");
    } finally {
      setRegenerating(false);
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
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* LOADING OVERLAY */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="terminal-loader">
            <div className="text">INITIALIZING_SYSTEM...</div>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {showQuiz && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '500px', maxHeight: '80vh', overflowY: 'auto',
            background: 'var(--bg-card)', border: '1px solid var(--neon-cyan)',
            borderRadius: '16px', padding: '30px', position: 'relative',
            boxShadow: '0 0 30px rgba(0, 242, 255, 0.2)'
          }}>
            <button
              onClick={() => setShowQuiz(false)}
              style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            {quizLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Generating Quiz...</div>
            ) : quizResult ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--success-green)', fontSize: '24px', fontWeight: 'bold' }}>
                {quizResult}
              </div>
            ) : (
              <>
                <h2 style={{ margin: '0 0 20px 0', color: 'var(--neon-cyan)', fontFamily: 'JetBrains Mono' }}>
                  DAILY_QUIZ: {quizData?.module}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {quizData?.questions.map((q, i) => (
                    <div key={i}>
                      <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>{i + 1}. {q.question}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options.map((opt, optI) => (
                          <label key={optI} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px', borderRadius: '8px',
                            background: quizAnswers[i] === optI ? 'rgba(0, 242, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                            border: quizAnswers[i] === optI ? '1px solid var(--neon-cyan)' : '1px solid transparent',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="radio"
                              name={`q-${i}`}
                              checked={quizAnswers[i] === optI}
                              onChange={() => setQuizAnswers({ ...quizAnswers, [i]: optI })}
                              style={{ accentColor: 'var(--neon-cyan)' }}
                            />
                            <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={submitQuiz}
                    style={{
                      marginTop: '20px', padding: '12px', background: 'var(--neon-cyan)',
                      border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    SUBMIT & EXTEND STREAK
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>

        {/* TOP BAR */}
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

            {/* Regenerate Button (Dev) */}
            <button
              onClick={handleRegenerateRoadmap}
              disabled={regenerating}
              style={{
                background: 'rgba(0, 242, 255, 0.1)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: regenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                opacity: regenerating ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!regenerating) {
                  e.target.style.background = 'rgba(0, 242, 255, 0.2)';
                  e.target.style.boxShadow = '0 0 12px rgba(0, 242, 255, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 242, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <RotateCw size={14} style={{ animation: regenerating ? 'spin 1s linear infinite' : 'none' }} />
              {regenerating ? 'REGENERATING...' : 'REGEN_ROADMAP'}
            </button>

          </div>
        </div>

        {/* ROADMAP MAP (D3) */}
        <RoadmapMap
          nodes={nodes}
          onNodeClick={(e, node) => setSelectedNode(node)}
        />

      </div>

      {/* SLIDE-OUT PANEL (Right) */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: '400px', background: 'rgba(22, 27, 34, 0.95)',
        backdropFilter: 'blur(20px)', borderLeft: '1px solid var(--border-active)',
        transform: selectedNode ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 20, display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
      }}>
        {selectedNode ? (
          <>
            <div style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
              {/* HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', color: '#fff', fontFamily: 'JetBrains Mono' }}>
                    MODULE_{selectedNode.data.step_order}
                  </h2>
                  <span style={{ color: selectedNode.data.status === 'completed' ? 'var(--success-green)' : 'var(--neon-cyan)', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>
                    STATUS: {selectedNode.data.status.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                {/* DESCRIPTION */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-header)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={16} color="var(--neon-cyan)" /> SYSTEM_DESCRIPTION
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                    {selectedNode.data.description}
                  </p>
                </div>

                {/* RESOURCES PREVIEW */}
                {selectedNode?.data?.resources && (
                  <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '14px', color: 'var(--text-header)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={16} color="var(--electric-purple)" /> LEARNING_RESOURCES
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
                              gap: '10px',
                              padding: '12px',
                              background: 'rgba(0, 242, 255, 0.05)',
                              border: '1px solid rgba(0, 242, 255, 0.2)',
                              borderRadius: '8px',
                              color: 'var(--neon-cyan)',
                              textDecoration: 'none',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 242, 255, 0.1)';
                              e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 242, 255, 0.05)';
                              e.currentTarget.style.borderColor = 'rgba(0, 242, 255, 0.2)';
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>
                              {resource.type === 'interactive' && '🎮'}
                              {resource.type === 'docs' && '📖'}
                              {resource.type === 'video' && '🎥'}
                              {resource.type === 'course' && '🎓'}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{resource.title}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                {resource.type} • {idx === 0 ? 'RECOMMENDED' : 'ALTERNATIVE'}
                              </div>
                            </div>
                            <ExternalLink size={14} />
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
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '8px',
                              color: 'var(--text-main)',
                              cursor: 'pointer',
                              fontFamily: 'JetBrains Mono',
                              fontSize: '12px',
                              marginBottom: '12px'
                            }}
                          >
                            SHOW_MORE ({selectedNode.data.resources.additional.length} more resources)
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
                                  padding: '10px',
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: '8px',
                                  color: 'var(--text-main)',
                                  textDecoration: 'none',
                                  fontSize: '13px',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                }}
                              >
                                <span style={{ fontSize: '14px' }}>
                                  {resource.type === 'interactive' && '🎮'}
                                  {resource.type === 'docs' && '📖'}
                                  {resource.type === 'video' && '🎥'}
                                  {resource.type === 'course' && '🎓'}
                                </span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '13px' }}>{resource.title}</div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    {resource.type}
                                  </div>
                                </div>
                                <ExternalLink size={12} />
                              </a>
                            ))}

                            <button
                              onClick={() => toggleShowMore(selectedNode.id)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                background: 'none',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '8px',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontFamily: 'JetBrains Mono',
                                fontSize: '11px',
                                marginTop: '4px'
                              }}
                            >
                              SHOW_LESS
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

    </div>
  );
}
