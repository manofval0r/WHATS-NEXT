import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Terminal, Award, BookOpen, X, Send, ExternalLink, PlayCircle, Code, CheckCircle } from 'lucide-react';
import RoadmapMap from './RoadmapMap';

export default function Dashboard() {
  // --- STATE ---
  const [nodes, setNodes] = useState([]); // Raw nodes from backend
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ level: 'Beginner' });
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();

  // --- EFFECT: LOAD ROADMAP ---
  useEffect(() => {
    const fetchRoadmap = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { navigate('/'); return; }

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/my-roadmap/', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNodes(res.data.nodes);
      } catch (err) {
        console.error("Load Error", err);
        if (err.response && err.response.status === 401) navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  // SUBMIT PROJECT 
  const handleSubmitProject = async () => {
    if (!submissionLink) return alert("Please paste a link!");
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      // Call Backend
      const res = await axios.post(
        `http://127.0.0.1:8000/api/submit-project/${selectedNode.id}/`, 
        { link: submissionLink },
        { headers: { Authorization: `Bearer ${token}` } }
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
                  {Math.round((nodes.filter(n => n.data.status === 'completed').length / Math.max(nodes.length, 1)) * 100)}%
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
                    <Terminal size={16} color="var(--neon-cyan)"/> SYSTEM_DESCRIPTION
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                    {selectedNode.data.description}
                    </p>
                </div>

                {/* RESOURCES PREVIEW */}
                <div>
                    <h3 style={{ fontSize: '14px', color: 'var(--text-header)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16} color="var(--electric-purple)"/> LEARNING_RESOURCES
                    </h3>
                    
                    {/* YouTube Videos */}
                    {selectedNode.data.resources?.videos && selectedNode.data.resources.videos.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedNode.data.resources.videos.slice(0, 3).map((video, idx) => (
                          <a 
                            key={idx}
                            href={video.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ 
                              display: 'flex', gap: '12px', textDecoration: 'none',
                              background: '#0d1117', border: '1px solid var(--border-subtle)', 
                              borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s',
                              padding: '10px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-subtle)';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            {/* Thumbnail */}
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              style={{ 
                                width: '120px', 
                                height: '68px', 
                                objectFit: 'cover', 
                                borderRadius: '8px',
                                flexShrink: 0
                              }}
                            />
                            
                            {/* Video Info */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                              <div style={{ 
                                fontSize: '13px', 
                                fontWeight: '600', 
                                color: '#fff', 
                                marginBottom: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {video.title}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <PlayCircle size={12} />
                                {video.channel}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      /* Fallback if no videos */
                      <div style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border-subtle)',
                        textAlign: 'center'
                      }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                          📚 Check {selectedNode.data.resources?.main || 'online resources'} for learning materials
                        </p>
                      </div>
                    )}
                </div>

                {/* PROJECT SUBMISSION */}
                <div style={{ opacity: selectedNode.data.status === 'locked' ? 0.5 : 1 }}>
                    <h3 style={{ fontSize: '14px', color: 'var(--text-header)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Code size={16} color="var(--success-green)"/> MISSION_OBJECTIVE
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
