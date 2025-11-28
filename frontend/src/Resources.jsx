import { useState, useEffect } from 'react';
import api from './api';
import { Globe, Briefcase, ExternalLink, Zap, Terminal, Cpu, PlayCircle, Newspaper, Youtube, Building2 } from 'lucide-react';

export default function Resources() {
  const [data, setData] = useState({ career_focus: '', news: [], internships: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('news'); // 'news', 'videos', 'jobs'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/resources/');
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = [
    { id: 'news', label: 'Tech News', icon: <Newspaper size={18} />, count: data.news?.length || 0 },
    { id: 'videos', label: 'YouTube', icon: <Youtube size={18} />, count: data.videos?.length || 0 },
    { id: 'jobs', label: 'Opportunities', icon: <Building2 size={18} />, count: data.internships?.length || 0 }
  ];

  return (
    <div style={{ padding: '40px', height: '100%', overflowY: 'auto', background: 'radial-gradient(circle at 50% 0%, #1c2128 0%, #0d1117 100%)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(0, 242, 255, 0.1)', border: '1px solid rgba(0, 242, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Cpu size={24} color="var(--neon-cyan)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontFamily: 'JetBrains Mono', color: '#fff' }}>
                INTEL_HUB
              </h1>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                {data.career_focus || 'Technology'} • Real-time market data & opportunities
              </p>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--neon-cyan)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginBottom: '-1px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-main)';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {tab.icon}
                {tab.label}
                <span style={{
                  background: activeTab === tab.id ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)',
                  color: activeTab === tab.id ? '#000' : 'var(--text-muted)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
            <div className="terminal-loader">
              <div className="text">SCANNING_NETWORK...</div>
            </div>
          </div>
        ) : (
          <div>
            {/* NEWS TAB */}
            {activeTab === 'news' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {data.news && data.news.length > 0 ? data.news.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      background: 'rgba(22, 27, 34, 0.6)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '20px',
                      transition: 'all 0.3s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 242, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={14} color="var(--electric-purple)" />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {item.source}
                      </span>
                    </div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#fff',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {item.published}
                      </span>
                      <ExternalLink size={14} color="var(--neon-cyan)" />
                    </div>
                  </a>
                )) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Newspaper size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p>No news articles available</p>
                  </div>
                )}
              </div>
            )}

            {/* YOUTUBE TAB */}
            {activeTab === 'videos' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {data.videos && data.videos.length > 0 ? data.videos.map((video, idx) => (
                  <a
                    key={idx}
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      background: 'rgba(22, 27, 34, 0.6)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#FF0000';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(255, 0, 0, 0.9)',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PlayCircle size={32} color="#fff" fill="#fff" />
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '16px' }}>
                      <h3 style={{
                        margin: '0 0 8px 0',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#fff',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {video.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <Youtube size={14} color="#FF0000" />
                        {video.channel}
                      </div>
                    </div>
                  </a>
                )) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Youtube size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p>No videos available. Add YOUTUBE_API_KEY to your .env file.</p>
                  </div>
                )}
              </div>
            )}

            {/* JOBS TAB */}
            {activeTab === 'jobs' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {data.internships && data.internships.length > 0 ? data.internships.map((job, idx) => (
                  <a
                    key={idx}
                    href={job.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      background: 'rgba(22, 27, 34, 0.6)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '20px',
                      transition: 'all 0.3s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--success-green)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(46, 213, 115, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {job.is_hot && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'var(--success-green)',
                        color: '#000',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Zap size={12} fill="#000" />
                        ENTRY LEVEL
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={14} color="var(--success-green)" />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {job.company}
                      </span>
                    </div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#fff',
                      lineHeight: '1.4',
                      paddingRight: job.is_hot ? '100px' : '0'
                    }}>
                      {job.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: '12px', color: 'var(--success-green)', fontWeight: '600' }}>
                        Remote
                      </span>
                      <ExternalLink size={14} color="var(--success-green)" />
                    </div>
                  </a>
                )) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Building2 size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p>No job opportunities found matching your career path</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}