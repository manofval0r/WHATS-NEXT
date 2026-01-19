import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Terminal, Award, Zap, Sparkles } from 'lucide-react';
import RoadmapMap from './RoadmapMap';
import MobileModuleModal from './components/MobileModuleModal';
import { useIsMobile } from './hooks/useMediaQuery';

// Neon Components
import ModuleDetailPanel from './components/dashboard/ModuleDetailPanel';
import DailyQuizModal from './components/dashboard/DailyQuizModal';
import Card from './components/common/Card';
import Badge from './components/common/Badge';
import { useJada } from './jada/JadaContext';

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
  const [hasAttemptedRegen, setHasAttemptedRegen] = useState(false); // Prevent infinite regen loops
  const [userData, setUserData] = useState({ level: 'Beginner' });
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const navigate = useNavigate();
  const isMobile = useIsMobile(); // Detect mobile viewport
  const jada = useJada();

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
      
      // Fetch lessons dynamically for each module
      const enrichedNodes = await Promise.all(
        uniqueNodes.map(async (node) => {
          const outline = node?.data?.resources?.lesson_outline;
          if (outline && outline.length > 0) {
            const lessons = outline.map((lesson, index) => ({
              id: `${node.id}-lesson-${index}`,
              title: lesson.title,
              description: lesson.description,
              phase: lesson.phase || 1,
              order: lesson.order || index + 1,
              xp_reward: 20,
              estimated_minutes: lesson.estimated_minutes || 30,
              is_completed: false,
              confidence_rating: null,
              completed_at: null
            }));

            return {
              ...node,
              data: {
                ...node.data,
                lessons
              }
            };
          }

          try {
            // Try to fetch AI-generated lessons
            const lessonRes = await api.post(`/api/modules/${node.id}/generate-lessons/`, {
              platform: 'freeCodeCamp' // Can be made dynamic based on user preference
            });
            
            return {
              ...node,
              data: {
                ...node.data,
                lessons: lessonRes.data.lessons || []
              }
            };
          } catch (error) {
            console.log(`Failed to generate lessons for module ${node.id}, using fallback`);
            // Fallback to basic lesson structure if AI fails
            return {
              ...node,
              data: {
                ...node.data,
                lessons: generateFallbackLessons(node.data.label, node.data.description)
              }
            };
          }
        })
      );
      
      setNodes(enrichedNodes);

      // AUTO-REGENERATE if fallback detected (only once per session)
      if (res.data.is_fallback && !regenerating && !hasAttemptedRegen) {
        console.log("Fallback roadmap detected. Initiating auto-regeneration...");
        setHasAttemptedRegen(true);
        handleRegenerateRoadmap();
      }
    } catch (err) {
      console.error("Load Error", err);
      if (err.response && err.response.status === 401) {
        navigate('/');
      } else {
        setNodes([]);
        alert("Failed to load roadmap. Please check console for details.");
      }
    } finally {
      // Always ensure loading state is cleared
      setLoading(false);
    }
  };

  // Fallback lesson generator (used if AI fails)
  const generateFallbackLessons = (moduleTitle, moduleDescription) => {
    return [
      {
        id: Math.random(),
        title: `Introduction to ${moduleTitle}`,
        description: `Get started with ${moduleTitle}. ${moduleDescription?.slice(0, 100) || ''}`,
        phase: 1,
        order: 1,
        xp_reward: 20,
        estimated_minutes: 30,
        is_completed: false,
        confidence_rating: null,
        completed_at: null,
        resources: {
          primary: {
            title: "Official Documentation",
            url: "https://developer.mozilla.org",
            type: "docs"
          },
          supplementary: [
            { title: "Video Tutorial", url: "https://youtube.com", type: "video" },
            { title: "Interactive Exercise", url: "https://codecademy.com", type: "interactive" }
          ]
        }
      }
    ];
  };

  // --- EFFECT: LOAD ROADMAP ---
  useEffect(() => {
    const loadRoadmap = async () => {
      await fetchRoadmap();
      setLoading(false);
    };
    loadRoadmap();
  }, [navigate]);

  useEffect(() => {
    if (loading || regenerating) {
      jada.setMode('thinking');
      jada.setSpeech(regenerating ? 'Regenerating your roadmap…' : 'Initializing your roadmap…', 'neutral');
    } else {
      jada.setMode('idle');
      jada.setSpeech(null);
    }
  }, [jada, loading, regenerating]);

  // --- REGENERATE ROADMAP ---
  const handleRegenerateRoadmap = async () => {
    setRegenerating(true);
    
    try {
      // Call the endpoint with force_regenerate flag
      const res = await api.post(
        '/api/my-roadmap/',
        { force_regenerate: true }
      );

      // Check if we got a real roadmap back (not fallback)
      if (res.data.is_fallback) {
        console.warn("Regeneration returned fallback again.");
        setNodes(res.data.nodes || []);
        alert("AI is busy. Using offline roadmap. Try again later.");
      } else {
        // Update nodes with the newly generated roadmap
        const nodeData = res.data.nodes || res.data || [];
        setNodes(Array.isArray(nodeData) ? nodeData : []);
        setSelectedNode(null);
      }

    } catch (err) {
      console.error("Regenerate Error", err);
      alert("Failed to regenerate roadmap.");
    } finally {
      setTimeout(() => {
        setRegenerating(false);
      }, 1000);
    }
  };

  // --- DAILY QUIZ LOGIC ---
  const openDailyQuiz = async () => {
    setShowQuiz(true);
    setQuizLoading(true);
    setQuizResult(null);

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

  const submitQuiz = async (answers) => {
    if (!quizData || Object.keys(answers).length < quizData.questions.length) {
      alert("Please answer all questions!");
      return;
    }

    try {
      await api.post('/api/daily-quiz/submit/',
        { score: 100 } // We just claim completion for the streak
      );
      setQuizResult("STREAK EXTENDED");
      jada.celebrate('Streak extended. Keep going.');
      setTimeout(() => {
        setShowQuiz(false);
        setQuizResult(null);
        setQuizCompleted(true);
      }, 2000);
    } catch (e) {
      alert("Error submitting quiz");
    }
  };

  // SUBMIT PROJECT 
  const handleSubmitProject = async (linkOverride) => {
    const linkToUse = linkOverride || submissionLink;
    if (!linkToUse) return alert("Please paste a link!");
    setSubmitting(true);

    try {
      // Call Backend
      const res = await api.post(
        `/api/submit-project/${selectedNode.id}/`,
        { link: linkToUse }
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

      alert("Project Verified! Next Module Unlocked.");
      jada.celebrate('Project verified. Next module unlocked.');
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
      overflow: isMobile ? 'auto' : 'hidden', // Allow scrolling on mobile
      background: 'var(--bg-dark)'
    }}>

      {/* UNIFIED LOADING & REGENERATION OVERLAY */}
      {(loading || regenerating) && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'var(--overlay-bg)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '30px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontFamily: 'var(--font-display)',
              color: 'var(--neon-cyan)',
              marginBottom: '10px',
              textShadow: '0 0 10px rgba(95, 245, 255, 0.5)',
              animation: 'pulseGlow 2s infinite alternate'
            }}>
              {regenerating ? 'REGENERATING SYSTEM...' : 'INITIALIZING NEURAL LINK...'}
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              height: '20px' // Fixed height
            }}>
              <TypewriterText
                texts={[
                  "ANALYZING CAREER TRENDS...",
                  "CURATING RESOURCES...",
                  "OPTIMIZING PATH...",
                  "CALIBRATING..."
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {showQuiz && (
        <DailyQuizModal 
           quizData={quizData} 
           onClose={() => setShowQuiz(false)} 
           onSubmit={submitQuiz}
           quizLoading={quizLoading}
           quizResult={quizResult}
           quizCompleted={quizCompleted}
        />
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
             {/* HEADER DASHBOARD */}
             <Card variant="glass" style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '32px', pointerEvents: 'auto', borderRadius: 'var(--radius-full)' }}>
                {/* LEVEL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Terminal size={16} color="var(--neon-cyan)" />
                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', letterSpacing: '1px' }}>SYSTEM LEVEL</span>
                       <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{userData.level === 'Beginner' ? '01' : '02'}</span>
                   </div>
                </div>
                
                {/* VERTICAL SEPARATOR */}
                <div style={{ width: '1px', height: '24px', background: 'var(--void-glow)' }}></div>

                {/* PROGRESS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>MASTERY</span>
                          <span style={{ fontSize: '10px', color: 'var(--neon-violet)' }}>
                             {nodes && nodes.length > 0 ? Math.round((nodes.filter(n => n.data.status === 'completed').length / Math.max(nodes.length, 1)) * 100) : 0}%
                          </span>
                       </div>
                       <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                           <div style={{
                               height: '100%',
                               width: `${(nodes.filter(n => n.data.status === 'completed').length / Math.max(nodes.length, 1)) * 100}%`,
                               background: 'var(--gradient-mastery)',
                               transition: 'width 1s ease'
                           }}></div>
                       </div>
                    </div>
                </div>

                 {/* XP */}
                 <Badge label="1,240 XP" variant="violet" />

                 {/* DAILY QUIZ TRIGGER */}
                 {!quizCompleted && (
                    <button 
                       onClick={openDailyQuiz}
                       style={{ 
                          background: 'rgba(255, 190, 11, 0.1)', border: '1px solid var(--neon-gold)', 
                          color: 'var(--neon-gold)', borderRadius: 'var(--radius-full)', padding: '6px 16px',
                          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                          fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
                          transition: 'all 0.2s',
                          animation: 'pulseGlow 3s infinite'
                       }}
                       onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 190, 11, 0.2)'}
                       onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 190, 11, 0.1)'}
                    >
                       <Zap size={14} fill="var(--neon-gold)" />
                       DAILY_CHALLENGE
                    </button>
                 )}
             </Card>
          </div>
        )}

        {/* MOBILE HEADER */}
        {isMobile && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            padding: '12px 16px',
            background: 'var(--panel-bg)', backdropFilter: 'blur(var(--glass-blur))',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <Badge label={`LVL ${userData.level === 'Beginner' ? '01' : '02'}`} variant="cyan" />
                </div>
                 <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                   {nodes && nodes.length > 0 ? Math.round((nodes.filter(n => n.data.status === 'completed').length / Math.max(nodes.length, 1)) * 100) : 0}%
                 </span>
            </div>

            {!quizCompleted && (
              <button
                onClick={openDailyQuiz}
                style={{
                  background: 'rgba(255, 190, 11, 0.1)', border: '1px solid var(--neon-gold)',
                  color: 'var(--neon-gold)', borderRadius: '50%', width: '40px', height: '40px',
                  cursor: 'pointer', pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(255, 190, 11, 0.3)'
                }}
              >
                <Zap size={20} fill="var(--neon-gold)" />
              </button>
            )}
          </div>
        )}

        {/* ROADMAP - Unified Interactive Map */}
        <RoadmapMap
          nodes={nodes}
          onNodeClick={(e, node) => setSelectedNode(node)}
          isMobile={isMobile}
        />

      </div>

      {/* MOBILE MODULE MODAL (Full-screen on mobile) */}
      {isMobile && selectedNode && (
        <MobileModuleModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSubmitProject={handleSubmitProject}
          onMarkComplete={async (nodeId) => {
            try {
              await api.post(`/api/submit-project/${nodeId}/`, { link: 'completed' });
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
        <ModuleDetailPanel 
             node={selectedNode}
             onClose={() => setSelectedNode(null)}
             onSubmitProject={handleSubmitProject}
             submissionLink={submissionLink}
             setSubmissionLink={setSubmissionLink}
             submitting={submitting}
        />
      )}

    </div>
  );
}
