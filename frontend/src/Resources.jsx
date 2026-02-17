import { useState, useEffect, useCallback, useRef } from 'react';
import api from './api';
import {
  Globe, Briefcase, ExternalLink, Zap, PlayCircle,
  Newspaper, Youtube, Building2, Lock, ChevronDown
} from 'lucide-react';
import { useIsMobile } from './hooks/useMediaQuery';
import { usePremium } from './premium/PremiumContext';

const PAGE_SIZE = 6;

/* ── skeleton placeholder ─────────────────────────────────────────── */
function SkeletonCard({ wide }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      animation: 'pulse 1.4s ease-in-out infinite',
    }}>
      <div style={{ width: '40%', height: 12, background: 'var(--border-subtle)', borderRadius: 4 }} />
      <div style={{ width: wide ? '90%' : '75%', height: 16, background: 'var(--border-subtle)', borderRadius: 4 }} />
      <div style={{ width: '60%', height: 12, background: 'var(--border-subtle)', borderRadius: 4, marginTop: 'auto' }} />
    </div>
  );
}

/* ── premium wall overlay ─────────────────────────────────────────── */
function PremiumWall({ onUpgrade }) {
  return (
    <div style={{
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(180deg, transparent 0%, var(--bg-card) 30%)',
      borderRadius: '12px',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    }}>
      <Lock size={32} color="var(--neon-cyan)" />
      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
        PREMIUM_REQUIRED
      </h3>
      <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: 420, fontSize: 14 }}>
        You've seen the free preview. Upgrade to unlock the full feed — more articles, jobs, and tutorials updated hourly.
      </p>
      <button
        onClick={onUpgrade}
        style={{
          marginTop: 8,
          padding: '10px 24px',
          background: 'var(--neon-cyan)',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontFamily: 'JetBrains Mono',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        JOIN WAITLIST
      </button>
    </div>
  );
}

/* ── main component ───────────────────────────────────────────────── */
export default function Resources() {
  const isMobile = useIsMobile();
  const { status, openGate } = usePremium();

  const [activeTab, setActiveTab] = useState('news');
  const [tabData, setTabData] = useState({
    news:   { items: [], offset: 0, total: 0, hasMore: false, premiumWall: false, loaded: false },
    videos: { items: [], offset: 0, total: 0, hasMore: false, premiumWall: false, loaded: false },
    jobs:   { items: [], offset: 0, total: 0, hasMore: false, premiumWall: false, loaded: false },
  });
  const [loading, setLoading] = useState({});
  const [careerFocus, setCareerFocus] = useState('');
  const loaderRef = useRef(null);

  /* fetch a page for a tab */
  const fetchTab = useCallback(async (tab, offset = 0, append = false) => {
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      const res = await api.get('/api/resources/', {
        params: { tab, offset, limit: PAGE_SIZE },
      });
      const d = res.data;
      if (d.career_focus) setCareerFocus(d.career_focus);

      setTabData(prev => ({
        ...prev,
        [tab]: {
          items: append ? [...prev[tab].items, ...d.items] : d.items,
          offset: offset + d.count,
          total: d.total,
          hasMore: d.has_more,
          premiumWall: d.premium_wall,
          loaded: true,
        },
      }));
    } catch (err) {
      console.error(`[Resources] ${tab} fetch error:`, err);
      if (!append) {
        setTabData(prev => ({
          ...prev,
          [tab]: { ...prev[tab], items: [], loaded: true },
        }));
      }
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, []);

  /* initial load per tab (lazy: only when tab first activated or on mount for 'news') */
  useEffect(() => {
    if (!tabData[activeTab].loaded && !loading[activeTab]) {
      fetchTab(activeTab, 0);
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    const td = tabData[activeTab];
    if (td.hasMore && !loading[activeTab] && !td.premiumWall) {
      fetchTab(activeTab, td.offset, true);
    }
  };

  const tabs = [
    { id: 'news',   label: 'Tech News',      icon: <Newspaper size={18} />, count: tabData.news.total },
    { id: 'videos', label: 'YouTube',         icon: <Youtube size={18} />,   count: tabData.videos.total },
    { id: 'jobs',   label: 'Opportunities',   icon: <Building2 size={18} />, count: tabData.jobs.total },
  ];

  const handleTabKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight') setActiveTab(tabs[(idx + 1) % tabs.length].id);
    if (e.key === 'ArrowLeft') setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length].id);
  };

  const isTabLoading = loading[activeTab] && !tabData[activeTab].loaded;
  const current = tabData[activeTab];

  return (
    <div style={{
      padding: isMobile ? '16px' : '10px',
      height: '100%',
      overflowY: 'auto',
      background: 'var(--bg-dark)',
      paddingBottom: isMobile ? '100px' : '40px',
    }}>
      {/* HEADER */}
      <div style={{
        position: 'sticky', top: '-2%', zIndex: 10,
        background: 'var(--panel-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '30px',
        margin: isMobile ? '-16px -16px 30px -16px' : '-30px 10px 40px -40px',
        padding: isMobile ? '16px' : '30px 40px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: 4, height: 24, background: 'var(--neon-cyan)', boxShadow: '0 0 10px var(--neon-cyan)' }} />
            <h1 style={{
              margin: 0, fontSize: 24, fontWeight: 'bold',
              color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', letterSpacing: '-0.5px',
            }}>
              INTEL_HUB
            </h1>
            {careerFocus && (
              <span style={{
                marginLeft: 'auto', fontSize: 12,
                color: 'var(--text-muted)', fontFamily: 'JetBrains Mono',
              }}>
                {careerFocus}
              </span>
            )}
          </div>

          {/* TABS */}
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
                  padding: '8px 16px', borderRadius: '2px', cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
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
                  padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 'bold',
                }}>
                  {tab.count || '—'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {isTabLoading ? (
          /* skeleton grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 20,
          }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} wide={i % 2 === 0} />)}
          </div>
        ) : (
          <>
            {/* NEWS */}
            {activeTab === 'news' && (
              <div role="tabpanel" id="news-panel" aria-labelledby="news-tab"
                style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}
              >
                {current.items.length > 0 ? current.items.map((item, idx) => (
                  <a key={idx} href={item.link} target="_blank" rel="noreferrer"
                    style={{
                      textDecoration: 'none', background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)', borderRadius: 12,
                      padding: 20, transition: 'all 0.3s',
                      display: 'flex', flexDirection: 'column', gap: 12,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--neon-cyan)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Globe size={14} color="var(--electric-purple)" />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {item.source}
                      </span>
                    </div>
                    <h3 style={{
                      margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)',
                      lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.published}</span>
                      <ExternalLink size={14} color="var(--neon-cyan)" />
                    </div>
                  </a>
                )) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Newspaper size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <p>No news articles available</p>
                  </div>
                )}
                {current.premiumWall && <PremiumWall onUpgrade={() => openGate('resources_feed')} />}
              </div>
            )}

            {/* VIDEOS */}
            {activeTab === 'videos' && (
              <div role="tabpanel" id="videos-panel" aria-labelledby="videos-tab"
                style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}
              >
                {current.items.length > 0 ? current.items.map((video, idx) => (
                  <a key={idx} href={video.url} target="_blank" rel="noreferrer"
                    style={{
                      textDecoration: 'none', background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)', borderRadius: 16,
                      overflow: 'hidden', transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF0000'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                  >
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                      <img src={video.thumbnail} alt={video.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(255,0,0,0.9)', borderRadius: '50%',
                        width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <PlayCircle size={32} color="#fff" fill="#fff" />
                      </div>
                      {video.module_label && (
                        <span style={{
                          position: 'absolute', bottom: 8, left: 8,
                          background: 'rgba(0,0,0,0.75)', color: 'var(--neon-cyan)',
                          fontSize: 10, padding: '3px 8px', borderRadius: 4,
                          fontFamily: 'JetBrains Mono',
                        }}>
                          {video.module_label}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: 16 }}>
                      <h3 style={{
                        margin: '0 0 8px', fontSize: 15, fontWeight: 600,
                        color: 'var(--text-primary)', lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {video.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                        <Youtube size={14} color="#FF0000" />
                        {video.channel}
                      </div>
                    </div>
                  </a>
                )) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Youtube size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <p>No videos available. Add YOUTUBE_API_KEY to your .env file.</p>
                  </div>
                )}
                {current.premiumWall && <PremiumWall onUpgrade={() => openGate('resources_feed')} />}
              </div>
            )}

            {/* JOBS */}
            {activeTab === 'jobs' && (
              <div role="tabpanel" id="jobs-panel" aria-labelledby="jobs-tab"
                style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}
              >
                {current.items.length > 0 ? current.items.map((job, idx) => (
                  <a key={idx} href={job.link} target="_blank" rel="noreferrer"
                    style={{
                      textDecoration: 'none', background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)', borderRadius: 16,
                      padding: 20, transition: 'all 0.3s',
                      display: 'flex', flexDirection: 'column', gap: 12, position: 'relative',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--success-green)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                  >
                    {job.is_hot && (
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'var(--success-green)', color: '#000',
                        padding: '4px 12px', borderRadius: 12,
                        fontSize: 11, fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Zap size={12} fill="#000" />
                        ENTRY LEVEL
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Briefcase size={14} color="var(--success-green)" />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {job.company || 'Remote Company'}
                      </span>
                      {job.source && (
                        <span style={{
                          marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)',
                          background: 'var(--border-subtle)', padding: '2px 6px', borderRadius: 4,
                        }}>
                          {job.source}
                        </span>
                      )}
                    </div>
                    <h3 style={{
                      margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)',
                      lineHeight: 1.4, paddingRight: job.is_hot ? 100 : 0,
                    }}>
                      {job.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: 12, color: 'var(--success-green)', fontWeight: 600 }}>Remote</span>
                      <ExternalLink size={14} color="var(--success-green)" />
                    </div>
                  </a>
                )) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Building2 size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <p>No job opportunities found matching your career path</p>
                  </div>
                )}
                {current.premiumWall && <PremiumWall onUpgrade={() => openGate('resources_feed')} />}
              </div>
            )}

            {/* Load More button */}
            {current.hasMore && !current.premiumWall && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  ref={loaderRef}
                  onClick={loadMore}
                  disabled={!!loading[activeTab]}
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--neon-cyan)',
                    border: '1px solid var(--border-subtle)',
                    padding: '10px 28px', borderRadius: 4, cursor: 'pointer',
                    fontFamily: 'JetBrains Mono', fontSize: 12,
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    opacity: loading[activeTab] ? 0.5 : 1,
                  }}
                >
                  {loading[activeTab] ? 'LOADING...' : <>LOAD_MORE <ChevronDown size={14} /></>}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* pulse animation for skeletons */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}