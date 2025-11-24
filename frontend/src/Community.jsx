import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, ThumbsUp, MessageSquare, Code, Users, Terminal } from 'lucide-react';

export default function Community() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/community/feed/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeed(res.data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleVerify = async (itemId) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/community/verify/${itemId}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update UI instantly
      setFeed(feed.map(item => {
        if (item.id === itemId) {
          return { ...item, verifications: res.data.new_count, has_voted: true };
        }
        return item;
      }));
      
      alert(res.data.message);
      
    } catch (e) { alert(e.response?.data?.error || "Error"); }
  };

  return (
    <div style={{ padding: '40px', height: '100%', overflowY: 'auto', background: 'radial-gradient(circle at 50% 0%, #1c2128 0%, #0d1117 100%)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: 'rgba(188, 19, 254, 0.1)', border: '1px solid rgba(188, 19, 254, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Users size={24} color="var(--electric-purple)" />
            </div>
            <div>
                <h1 style={{ margin: 0, fontSize: '28px', fontFamily: 'JetBrains Mono', color: '#fff' }}>
                    COMMUNITY_CODE
                </h1>
                <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Verify projects, earn reputation, and learn from others.
                </p>
            </div>
        </div>

        {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div className="terminal-loader">
                    <div className="text">SYNCING_FEED...</div>
                </div>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                {feed.length > 0 ? feed.map(item => (
                    <div key={item.id} style={cardStyle}>
                        
                        {/* User Header */}
                        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
                            <div style={avatarStyle}>
                                {item.username[0].toUpperCase()}
                            </div>
                            <div>
                                <div style={{fontWeight:'bold', color:'#fff', fontFamily: 'JetBrains Mono', fontSize: '14px'}}>
                                    @{item.username}
                                </div>
                                <div style={{fontSize:'11px', color:'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                    <Terminal size={10} /> {item.career}
                                </div>
                            </div>
                            <span style={{marginLeft:'auto', fontSize:'11px', color:'var(--text-muted)', fontFamily: 'JetBrains Mono'}}>
                                {item.date}
                            </span>
                        </div>

                        {/* Project Info */}
                        <div style={{ marginBottom:'20px', flex: 1 }}>
                            <div style={{ 
                                fontSize:'10px', color:'var(--success-green)', marginBottom:'8px', 
                                textTransform:'uppercase', letterSpacing:'1px', fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                                <div style={{width: 6, height: 6, borderRadius: '50%', background: 'var(--success-green)'}} />
                                COMPLETED MODULE
                            </div>
                            <h3 style={{ margin:'0 0 15px 0', color:'#fff', fontSize:'18px', lineHeight: '1.4' }}>
                                {item.module}
                            </h3>
                            
                            <a href={item.link} target="_blank" rel="noreferrer" style={linkBoxStyle}>
                                <Code size={16} color="var(--neon-cyan)" /> 
                                <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex: 1}}>
                                    View Source Code
                                </span>
                                <ExternalLink size={14} style={{opacity: 0.5}}/>
                            </a>
                        </div>

                        {/* Action Footer */}
                        <div style={{ 
                            borderTop:'1px solid var(--border-subtle)', paddingTop:'15px', marginTop: 'auto',
                            display:'flex', alignItems:'center', justifyContent:'space-between' 
                        }}>
                            <div style={{display:'flex', alignItems:'center', gap:'6px', color:'var(--text-muted)', fontSize:'13px'}}>
                                <ThumbsUp size={14} color={item.has_voted ? 'var(--neon-cyan)' : 'currentColor'} /> 
                                <span style={{ color: item.has_voted ? 'var(--neon-cyan)' : 'inherit' }}>
                                    {item.verifications} Verifications
                                </span>
                            </div>
                            
                            <button 
                                onClick={() => handleVerify(item.id)}
                                disabled={item.has_voted}
                                style={{
                                    ...verifyBtnStyle, 
                                    background: item.has_voted ? 'rgba(255,255,255,0.05)' : 'rgba(0, 242, 255, 0.1)',
                                    color: item.has_voted ? 'var(--text-muted)' : 'var(--neon-cyan)',
                                    border: item.has_voted ? '1px solid transparent' : '1px solid rgba(0, 242, 255, 0.3)',
                                    cursor: item.has_voted ? 'default' : 'pointer'
                                }}
                            >
                                {item.has_voted ? 'VERIFIED' : 'VERIFY_PROJECT'}
                            </button>
                        </div>

                    </div>
                )) : (
                    <div style={{
                        color:'var(--text-muted)', gridColumn:'1/-1', textAlign:'center', padding:'60px',
                        border: '1px dashed var(--border-subtle)', borderRadius: '12px'
                    }}>
                        <Terminal size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <p>No projects submitted yet. Be the first to deploy!</p>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
}

// --- STYLES ---
const cardStyle = { 
    background: 'rgba(22, 27, 34, 0.6)', 
    border: '1px solid var(--border-subtle)', 
    borderRadius: '16px', padding: '24px', 
    display:'flex', flexDirection:'column',
    backdropFilter: 'blur(5px)',
    transition: 'transform 0.2s',
    cursor: 'default'
};

const avatarStyle = { 
    width:'42px', height:'42px', borderRadius:'10px', 
    background:'linear-gradient(135deg, #21262d 0%, #161b22 100%)', 
    border: '1px solid var(--border-subtle)',
    color:'#fff', display:'flex', justifyContent:'center', alignItems:'center', 
    fontWeight:'bold', fontSize: '16px', fontFamily: 'JetBrains Mono'
};

const linkBoxStyle = { 
    display:'flex', alignItems:'center', gap:'12px', 
    background:'rgba(13, 17, 23, 0.5)', padding:'12px 16px', 
    borderRadius:'8px', border:'1px solid var(--border-subtle)', 
    color:'var(--text-main)', textDecoration:'none', fontSize:'13px', 
    transition:'all 0.2s', fontFamily: 'JetBrains Mono'
};

const verifyBtnStyle = { 
    padding:'8px 16px', borderRadius:'6px', fontWeight:'bold', 
    fontSize:'11px', transition:'0.2s', fontFamily: 'JetBrains Mono',
    letterSpacing: '0.5px'
};