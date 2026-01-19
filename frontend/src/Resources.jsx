import { useState, useEffect } from 'react';
import api from './api';
import { Globe, Briefcase, ExternalLink, Zap, Terminal, Cpu, PlayCircle, Newspaper, Youtube, Building2 } from 'lucide-react';
import { useIsMobile } from './hooks/useMediaQuery';

export default function Resources() {
  const [data, setData] = useState({ career_focus: '', news: [], internships: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('news'); // 'news', 'videos', 'jobs'
  const isMobile = useIsMobile();

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

  const handleTabKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight') {
      const next = (idx + 1) % tabs.length;
      setActiveTab(tabs[next].id);
    }
    if (e.key === 'ArrowLeft') {
      const prev = (idx - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prev].id);
    }
  };

  return (
    <div style={{
      padding: isMobile ? '16px' : '10px',
      height: '100%',
      overflowY: 'auto',
      background: 'var(--bg-dark)', // Theme adaptable
      paddingBottom: isMobile ? '100px' : '40px'
    }}>
      {/* HEADER (Community Standard) */}
      <div style={{
        position: 'sticky', top: '-2%', zIndex: 10,
        background: 'var(--panel-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '30px',
        margin: isMobile ? '-16px -16px 30px -16px' : '-30px 10px 40px -40px', 
        padding: isMobile ? '16px' : '30px 40px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '4px', height: '24px', background: 'var(--neon-cyan)', boxShadow: '0 0 10px var(--neon-cyan)' }}></div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', letterSpacing: '-0.5px' }}>
              INTEL_HUB
            </h1>
          </div>

          {/* TABS (Community Style) */}
          <div
            style={{ display: 'flex', gap: '10px', overflowX: isMobile ? 'auto' : 'visible', scrollbarWidth: 'none' }}
            role="tablist"
            aria-label="Resource categories"
          >
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                style={{
                  background: activeTab === tab.id ? 'rgba(0, 242, 255, 0.15)' : 'var(--bg-surface)',
                  color: activeTab === tab.id ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                  border: activeTab === tab.id ? '1px solid var(--neon-cyan)' : '1px solid transparent',
                  padding: '8px 16px',
                  borderRadius: '2px', // Tech square
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                id={`${tab.id}-tab`}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                {tab.icon}
                {tab.label}
                <span style={{
                  background: activeTab === tab.id ? 'var(--neon-cyan)' : 'var(--border-subtle)',
                  color: activeTab === tab.id ? '#000' : 'var(--text-secondary)',
                  padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'
                }}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
              <div
                role="tabpanel"
                id="news-panel"
                aria-labelledby="news-tab"
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '20px'
                }}
              >
                {data.news && data.news.length > 0 ? data.news.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      background: 'var(--bg-card)', // Theme adaptable
                      border: '1px solid var(--border-subtle)', // Tech border
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.3s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                      const title = e.currentTarget.querySelector('.card-title');
                      if (title) title.style.color = 'var(--neon-cyan)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      const title = e.currentTarget.querySelector('.card-title');
                      if (title) title.style.color = 'var(--text-primary)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={14} color="var(--electric-purple)" />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {item.source}
                      </span>
                    </div>
                    <h3 className="card-title" style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      transition: 'color 0.2s'
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
              <div
                role="tabpanel"
                id="videos-panel"
                aria-labelledby="videos-tab"
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '20px'
                }}
              >
                {data.videos && data.videos.length > 0 ? data.videos.map((video, idx) => (
                  <a
                    key={idx}
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#FF0000';
                      const title = e.currentTarget.querySelector('.card-title');
                      if (title) title.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      const title = e.currentTarget.querySelector('.card-title');
                      if (title) title.style.color = 'var(--text-primary)';
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
                      <h3 className="card-title" style={{
                        margin: '0 0 8px 0',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color 0.2s'
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
              <div
                role="tabpanel"
                id="jobs-panel"
                aria-labelledby="jobs-tab"
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '20px'
                }}
              >
                {data.internships && data.internships.length > 0 ? data.internships.map((job, idx) => (
                  <a
                    key={idx}
                    href={job.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      background: 'var(--bg-card)',
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
                      const title = e.currentTarget.querySelector('.card-title');
                      if (title) title.style.color = 'var(--success-green)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      const title = e.currentTarget.querySelector('.card-title');
                      if (title) title.style.color = 'var(--text-primary)';
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
                    <h3 className="card-title" style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      lineHeight: '1.4',
                      paddingRight: job.is_hot ? '100px' : '0',
                      transition: 'color 0.2s'
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