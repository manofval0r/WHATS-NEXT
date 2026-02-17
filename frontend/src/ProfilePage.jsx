import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import {
  Award,
  CheckCircle,
  Circle,
  Clock,
  Download,
  ExternalLink,
  GitCommit,
  Github,
  Globe,
  Linkedin,
  Lock,
  Settings,
  Shield,
  Twitter,
  X,
  Zap,
} from 'lucide-react';
import './Profile.css';
import html2pdf from 'html2pdf.js';
import { usePremium } from './premium/PremiumContext';
import { useIsMobile } from './hooks/useMediaQuery';

/* ── helpers ────────────────────────────────────────────────────────── */

function isoDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

/* ── Social / Privacy sidebar card (extracted for reuse) ──────────── */

function SocialPrivacyCard({
  profile,
  editingSocials, setEditingSocials,
  socialForm, setSocialForm,
  savingSocials, handleSaveSocials,
  downloadPortfolioHtml,
  privacy, setPrivacy,
  savingPrivacy, handleSavePrivacy,
}) {
  return (
    <div className="profile-actions-card">
      {/* Social Links */}
      <div className="profile-actions-header">
        <div className="profile-actions-title">Social Links</div>
        <button className="profile-action-btn" onClick={() => setEditingSocials((v) => !v)}>
          {editingSocials ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editingSocials ? (
        <div className="profile-actions-form">
          <label className="profile-actions-label">GitHub</label>
          <input className="profile-actions-input" value={socialForm.github}
            onChange={(e) => setSocialForm((s) => ({ ...s, github: e.target.value }))} placeholder="https://github.com/username" />
          <label className="profile-actions-label">Twitter/X</label>
          <input className="profile-actions-input" value={socialForm.twitter}
            onChange={(e) => setSocialForm((s) => ({ ...s, twitter: e.target.value }))} placeholder="https://x.com/username" />
          <label className="profile-actions-label">LinkedIn</label>
          <input className="profile-actions-input" value={socialForm.linkedin}
            onChange={(e) => setSocialForm((s) => ({ ...s, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/username" />
          <label className="profile-actions-label">Website</label>
          <input className="profile-actions-input" value={socialForm.website}
            onChange={(e) => setSocialForm((s) => ({ ...s, website: e.target.value }))} placeholder="https://your-site.com" />
          <button className="profile-action-primary" onClick={handleSaveSocials} disabled={savingSocials}>
            {savingSocials ? 'Saving…' : 'Save Links'}
          </button>
        </div>
      ) : (
        <div className="profile-actions-links">
          <div className="profile-actions-icons">
            {profile?.github && (
              <a className="profile-social-icon" href={profile.github} target="_blank" rel="noreferrer"><Github size={16} /></a>
            )}
            {profile?.twitter && (
              <a className="profile-social-icon" href={profile.twitter} target="_blank" rel="noreferrer"><Twitter size={16} /></a>
            )}
            {profile?.linkedin && (
              <a className="profile-social-icon" href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /></a>
            )}
            {profile?.website && (
              <a className="profile-social-icon" href={profile.website} target="_blank" rel="noreferrer"><Globe size={16} /></a>
            )}
          </div>
          <button className="profile-action-secondary" onClick={downloadPortfolioHtml}>
            <ExternalLink size={14} /> Project Showcase HTML
          </button>
        </div>
      )}

      <div className="profile-actions-divider" />

      {/* Privacy */}
      <div className="profile-actions-header">
        <div className="profile-actions-title">Privacy</div>
        <Shield size={16} color="var(--text-secondary)" />
      </div>

      <div className="profile-actions-form">
        <label className="profile-actions-label">Profile visibility</label>
        <select className="profile-actions-input" value={privacy.profile_visibility}
          onChange={(e) => setPrivacy((p) => ({ ...p, profile_visibility: e.target.value }))}>
          <option value="public">Public</option>
          <option value="community">Community-only</option>
          <option value="private">Private</option>
        </select>

        <label className="profile-actions-toggle">
          <input type="checkbox" checked={privacy.allow_indexing}
            onChange={(e) => setPrivacy((p) => ({ ...p, allow_indexing: e.target.checked }))} />
          <span>Allow search engine indexing</span>
        </label>

        <div className="profile-actions-subtitle">Activity visibility</div>
        {[
          ['show_contribution_graph', 'Contribution graph'],
          ['show_activity_feed', 'Activity feed'],
          ['show_achievements', 'Achievements'],
          ['show_skills', 'Skills'],
          ['show_projects', 'Projects'],
        ].map(([key, label]) => (
          <label key={key} className="profile-actions-toggle">
            <input type="checkbox" checked={!!privacy.activity_visibility[key]}
              onChange={(e) => setPrivacy((p) => ({
                ...p, activity_visibility: { ...p.activity_visibility, [key]: e.target.checked },
              }))} />
            <span>{label}</span>
          </label>
        ))}

        <button className="profile-action-primary" onClick={handleSavePrivacy} disabled={savingPrivacy}>
          {savingPrivacy ? 'Saving…' : 'Save Privacy'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════ */

export default function ProfilePage() {
  const isMobile = useIsMobile();

  const [heatmapData, setHeatmapData] = useState(Array.from({ length: 53 }, () => Array(7).fill(0)));
  const [heatmapMeta, setHeatmapMeta] = useState({});
  const [tooltip, setTooltip] = useState(null);

  const [profileData, setProfileData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const cvRef = useRef(null);
  const { requestCvExport } = usePremium();

  const [editingSocials, setEditingSocials] = useState(false);
  const [savingSocials, setSavingSocials] = useState(false);
  const [socialForm, setSocialForm] = useState({ github: '', twitter: '', linkedin: '', website: '' });

  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [privacy, setPrivacy] = useState({
    profile_visibility: 'public',
    allow_indexing: true,
    activity_visibility: {
      show_contribution_graph: true,
      show_activity_feed: true,
      show_achievements: true,
      show_skills: true,
      show_projects: true,
    },
  });

  const [detailsModule, setDetailsModule] = useState(null);

  /* ── data fetch ──────────────────────────────────────────────────── */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, activityRes] = await Promise.all([
          api.get('/api/profile/'),
          api.get('/api/profile/activity/'),
        ]);

        const payload = profileRes.data;
        setProfileData(payload);

        const p = payload?.profile || {};
        setSocialForm({ github: p.github || '', twitter: p.twitter || '', linkedin: p.linkedin || '', website: p.website || '' });

        setPrivacy({
          profile_visibility: p.profile_visibility || 'public',
          allow_indexing: p.allow_indexing !== undefined ? p.allow_indexing : true,
          activity_visibility: {
            show_contribution_graph: p.activity_visibility?.show_contribution_graph ?? true,
            show_activity_feed: p.activity_visibility?.show_activity_feed ?? true,
            show_achievements: p.activity_visibility?.show_achievements ?? true,
            show_skills: p.activity_visibility?.show_skills ?? true,
            show_projects: p.activity_visibility?.show_projects ?? true,
          },
        });

        const acts = Array.isArray(activityRes.data) ? activityRes.data : [];
        setActivities(acts);

        // build heatmap
        const meta = {};
        for (const item of acts) {
          const iso = isoDate(item.date);
          if (!meta[iso]) meta[iso] = { total: 0, byType: {} };
          meta[iso].total += 1;
          meta[iso].byType[item.type] = (meta[iso].byType[item.type] || 0) + 1;
        }
        setHeatmapMeta(meta);

        const today = new Date();
        const start = new Date(today);
        start.setDate(start.getDate() - 53 * 7);
        start.setDate(start.getDate() - start.getDay());

        const newHeatmap = [];
        let cur = new Date(start);
        for (let w = 0; w < 53; w++) {
          const week = [];
          for (let d = 0; d < 7; d++) {
            const iso = isoDate(cur);
            const count = meta[iso]?.total || 0;
            let level = 0;
            if (count >= 1) level = 1;
            if (count >= 3) level = 2;
            if (count >= 5) level = 3;
            if (count >= 8) level = 4;
            week.push(level);
            cur.setDate(cur.getDate() + 1);
          }
          newHeatmap.push(week);
        }
        setHeatmapData(newHeatmap);
      } catch (e) {
        console.error('Failed to load profile data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── derived data ────────────────────────────────────────────────── */

  const { profile, stats, projects, modules, achievements } =
    profileData || {
      profile: {}, stats: {}, projects: [],
      modules: { completed: [], active: [], locked: [] },
      achievements: { recent: [], all: [] },
    };

  const sysLevel = useMemo(() => {
    const p = Number(profile?.progress || 0);
    const n = Math.max(1, Math.min(10, Math.ceil(p / 10)));
    return `SYS.LEVEL_${String(n).padStart(2, '0')}`;
  }, [profile?.progress]);

  const displaySkills = useMemo(() => {
    const derived = (projects || [])
      .flatMap((p) => p.tags || [])
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 10)
      .map((tag) => ({ name: tag }));
    return derived.length > 0 ? derived : [{ name: 'No Skills Verified Yet' }];
  }, [projects]);

  /* ── handlers ────────────────────────────────────────────────────── */

  const handleExportCV = async () => {
    const gate = await requestCvExport('profile_live_cv');
    if (!gate.allowed) return;
    const element = cvRef.current;
    if (!element) return;
    html2pdf().from(element).save();
  };

  const handleSaveSocials = async () => {
    setSavingSocials(true);
    try {
      await api.post('/api/profile/socials/', socialForm);
      setProfileData((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...socialForm },
      }));
      setEditingSocials(false);
    } catch {
      alert('Failed to save social links');
    } finally {
      setSavingSocials(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    try {
      await api.post('/api/settings/update/', {
        profile_visibility: privacy.profile_visibility,
        allow_indexing: privacy.allow_indexing,
        activity_visibility: privacy.activity_visibility,
      });
      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          profile_visibility: privacy.profile_visibility,
          allow_indexing: privacy.allow_indexing,
          activity_visibility: privacy.activity_visibility,
        },
      }));
    } catch {
      alert('Failed to save privacy settings');
    } finally {
      setSavingPrivacy(false);
    }
  };

  const downloadPortfolioHtml = async () => {
    try {
      const res = await api.get('/api/profile/export-html/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${profile?.username || 'portfolio'}_portfolio.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to export portfolio HTML');
    }
  };

  const downloadCertificate = async (itemId) => {
    try {
      const res = await api.get(`/api/certificate/${itemId}/generate/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${itemId}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Certificate download failed');
    }
  };

  /* shared sidebar props */
  const sidebarProps = {
    profile, editingSocials, setEditingSocials,
    socialForm, setSocialForm, savingSocials, handleSaveSocials,
    downloadPortfolioHtml, privacy, setPrivacy, savingPrivacy, handleSavePrivacy,
  };

  /* ── loading state ───────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="profile-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>LOADING_PROFILE...</div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════ */

  return (
    <div className="profile-container">
      {/* ── Top navigation bar ──────────────────────────────────────── */}
      <div className="profile-topbar">
        <Link to="/dashboard" className="profile-topbar-link">
          ← {!isMobile && 'Back to '}Dashboard
        </Link>
        <Link to="/settings" className="profile-topbar-link profile-topbar-settings">
          <Settings size={16} />
          {!isMobile && <span>Settings</span>}
        </Link>
      </div>

      <div className="profile-wrapper">
        {/* ── Header card ─────────────────────────────────────────── */}
        <div className="profile-header-card">
          <div className="profile-avatar-wrapper">
            <img
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${profile?.avatar_seed || profile?.username || 'User'}`}
              alt="Avatar"
              className="profile-avatar"
            />
            <div className="avatar-badge" />
          </div>

          <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{profile?.username || 'Anonymous'}</h1>
              <span className="profile-tag">{profile?.target_career || 'Developer'}</span>
              {profile?.plan_tier === 'PREMIUM' && (
                <span className="premium-pill" title="Premium Member">
                  <span className="premium-star">★</span> Premium
                </span>
              )}
            </div>

            <p className="profile-bio">
              {profile?.bio || `Building the future, one commit at a time. Currently focused on ${profile?.target_career || 'tech'}.`}
            </p>

            {/* Stats row — on mobile becomes 2×2 boxed grid via CSS */}
            <div className="profile-stats-row">
              <div className="p-stat">
                <span className="p-stat-label">SYS.LEVEL_01</span>
                <span className="p-stat-val">{sysLevel}</span>
              </div>
              <div className="p-stat">
                <span className="p-stat-label">
                  <Zap size={12} className="p-stat-icon" /> {stats?.xp?.toLocaleString?.() || stats?.xp || 0}
                </span>
                <span className="p-stat-val">TOTAL XP</span>
              </div>
              <div className="p-stat">
                <span className="p-stat-label">
                  🔥 {stats?.streak || 0} days
                </span>
                <span className="p-stat-val">CURRENT STREAK</span>
              </div>
              <div className="p-stat">
                <span className="p-stat-label">{profile?.market_label || 'Tech Explorer'}</span>
                <span className="p-stat-val">RANK</span>
              </div>
            </div>
          </div>

          {/* Desktop-only: sidebar inside header */}
          {!isMobile && (
            <div className="profile-actions">
              <SocialPrivacyCard {...sidebarProps} />
            </div>
          )}
        </div>

        {/* Mobile-only: sidebar rendered as its own full-width card */}
        {isMobile && (
          <div className="profile-actions profile-actions--mobile">
            <SocialPrivacyCard {...sidebarProps} />
          </div>
        )}

        {/* ── Tab bar ─────────────────────────────────────────────── */}
        <div className="profile-tab-bar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('cv')}
            className={`profile-tab ${activeTab === 'cv' ? 'active' : ''}`}
          >
            Live CV
          </button>

          {activeTab === 'cv' && (
            <button onClick={handleExportCV} className="profile-tab export-btn">
              <Download size={16} /> Export PDF
            </button>
          )}
        </div>

        {/* ══ OVERVIEW TAB ════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Contribution heatmap */}
            {privacy.activity_visibility.show_contribution_graph && (
              <div className="contribution-section" style={{ position: 'relative' }}>
                <div className="section-header">
                  <h2 className="section-title">
                    <GitCommit size={20} className="text-neon-cyan" /> Contribution Graph
                  </h2>
                  <div className="heatmap-legend">
                    <span>Less</span>
                    <div className="heatmap-cell level-0" />
                    <div className="heatmap-cell level-1" />
                    <div className="heatmap-cell level-2" />
                    <div className="heatmap-cell level-3" />
                    <div className="heatmap-cell level-4" />
                    <span>More</span>
                  </div>
                </div>

                <div className="heatmap-summary">
                  <div>Total activities this year: <strong>{stats?.total_activities_year || 0}</strong></div>
                  <div>Current streak: <strong>🔥 {stats?.streak || 0}</strong> days</div>
                </div>

                <div className="heatmap-container">
                  {heatmapData.map((week, wIndex) => (
                    <div key={wIndex} className="heatmap-col">
                      {week.map((level, dIndex) => (
                        <div
                          key={`${wIndex}-${dIndex}`}
                          className={`heatmap-cell level-${level}`}
                          onMouseEnter={(e) => {
                            const rootRect = e.currentTarget.closest('.contribution-section')?.getBoundingClientRect();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const today = new Date();
                            const start = new Date(today);
                            start.setDate(start.getDate() - 53 * 7);
                            start.setDate(start.getDate() - start.getDay());
                            const idx = wIndex * 7 + dIndex;
                            const date = new Date(start);
                            date.setDate(date.getDate() + idx);
                            const iso = isoDate(date);
                            const meta = heatmapMeta[iso] || { total: 0, byType: {} };
                            setTooltip({
                              iso, total: meta.total, byType: meta.byType,
                              x: rect.left - (rootRect?.left || 0) + rect.width / 2,
                              y: rect.top - (rootRect?.top || 0) - 10,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {tooltip && (
                  <div className="heatmap-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                    <div className="heatmap-tooltip-date">{tooltip.iso}</div>
                    <div className="heatmap-tooltip-total">Total: {tooltip.total}</div>
                    <div className="heatmap-tooltip-breakdown">
                      {Object.keys(tooltip.byType).length === 0 ? (
                        <div className="heatmap-tooltip-row">No activity</div>
                      ) : (
                        Object.entries(tooltip.byType).map(([k, v]) => (
                          <div key={k} className="heatmap-tooltip-row"><span>{k}</span><span>{v}</span></div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Overview stats grid */}
            <div className="profile-overview-grid">
              <div className="overview-card">
                <div className="overview-k">Lessons completed</div>
                <div className="overview-v">{stats?.lessons_completed || 0}</div>
              </div>
              <div className="overview-card">
                <div className="overview-k">Modules completed</div>
                <div className="overview-v">{stats?.completed || 0}</div>
              </div>
              <div className="overview-card">
                <div className="overview-k">Community posts</div>
                <div className="overview-v">{stats?.community_posts || 0}</div>
              </div>
              <div className="overview-card">
                <div className="overview-k">Activity events</div>
                <div className="overview-v">{stats?.total_activities_year || 0}</div>
              </div>
            </div>

            {/* Skills & Activity two-column grid */}
            <div className="profile-main-grid">
              {privacy.activity_visibility.show_skills && (
                <div className="skills-card">
                  <h2 className="section-title" style={{ marginBottom: 24 }}>
                    <Zap size={20} color="#ffbe0b" /> Skills Showcase
                  </h2>

                  {/* In-Progress Modules */}
                  <div className="skills-subtitle">In-Progress Modules</div>
                  <div className="inprogress-list">
                    {(modules?.active || []).length > 0 ? (
                      modules.active.slice(0, 3).map((m) => (
                        <div key={m.id} className="inprogress-item">
                          <div className="inprogress-title">{m.label}</div>
                          <div className="inprogress-meta">Lessons: 0/{m.lessons_total || 0} • Status: Active</div>
                          <a className="inprogress-cta" href={`/module/${m.id}`}>CONTINUE LEARNING</a>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>No active module right now.</div>
                    )}
                  </div>

                  {/* Upcoming (locked) Modules */}
                  <div className="skills-subtitle" style={{ marginTop: 18 }}>Upcoming Modules</div>
                  <div className="upcoming-grid">
                    {(modules?.locked || []).length > 0 ? (
                      modules.locked.slice(0, 6).map((m) => (
                        <div key={m.id} className="upcoming-item">
                          <Lock size={14} /> {m.label}
                        </div>
                      ))
                    ) : (
                      <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>No upcoming modules found.</div>
                    )}
                  </div>

                  {/* Verified modules */}
                  {(modules?.completed || []).length > 0 && (
                    <>
                      <div className="skills-subtitle" style={{ marginTop: 18 }}>Verified Modules</div>
                      <div className="verified-modules">
                        {modules.completed.slice(0, 6).map((m) => (
                          <div key={m.id} className="verified-module">
                            <div className="verified-module-top">
                              <div className="verified-module-title">{m.label}</div>
                              <div className="verified-module-meta">
                                Verified {m.submitted_at ? new Date(m.submitted_at).toLocaleDateString() : '—'}
                              </div>
                            </div>
                            <div className="verified-competencies">
                              {(m.competencies || []).slice(0, 6).map((c) => (
                                <span key={c} className="competency-pill">{c}</span>
                              ))}
                            </div>
                            <div className="verified-links">
                              {m.project_submission_link ? (
                                <a href={m.project_submission_link} target="_blank" rel="noreferrer" className="verified-link">
                                  <Github size={14} /> GitHub Repo
                                </a>
                              ) : (
                                <div className="verified-link disabled"><Github size={14} /> No repo</div>
                              )}
                              <button className="verified-link btn" onClick={() => setDetailsModule(m)}>
                                View Verification Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Tag-derived skills */}
                  <div className="skills-subtitle" style={{ marginTop: 18 }}>Tag-derived skills</div>
                  <div className="skills-grid">
                    {displaySkills.map((skill, i) => (
                      <div key={i} className="skill-badge"><Circle size={12} /><span>{skill.name}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {privacy.activity_visibility.show_activity_feed && (
                <div className="activity-card">
                  <h2 className="section-title" style={{ marginBottom: 24 }}>
                    <Clock size={20} color="#bc13fe" /> Recent Activity
                  </h2>
                  <div className="activity-list">
                    {activities.length > 0 ? (
                      activities.slice(0, 10).map((item, i) => (
                        <div key={i} className="activity-item">
                          <div className="activity-icon">
                            {item.type === 'module_completed' && <CheckCircle size={18} />}
                            {item.type === 'project_submitted' && <GitCommit size={18} />}
                            {item.type === 'review_given' && <Zap size={18} />}
                            {!['module_completed', 'project_submitted', 'review_given'].includes(item.type) && <Award size={18} />}
                          </div>
                          <div className="activity-content">
                            <h4>{item.title || item.details}</h4>
                            <span className="activity-time">{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#8b949e', fontStyle: 'italic', fontSize: 12, textAlign: 'center', padding: '32px 0' }}>
                        No recent activity detected.
                      </div>
                    )}
                  </div>
                  <Link to="/profile/activity" className="activity-more">View full history</Link>
                </div>
              )}
            </div>

            {/* Achievements */}
            {privacy.activity_visibility.show_achievements && (
              <div className="achievements-card">
                <div className="section-header" style={{ marginBottom: 14 }}>
                  <h2 className="section-title"><Award size={20} /> Achievements</h2>
                </div>
                <div className="badge-grid">
                  {(achievements?.recent || []).length > 0 ? (
                    achievements.recent.slice(0, 6).map((b) => (
                      <div key={b.key} className="badge-item" title={b.category}>
                        <div className="badge-icon">🏅</div>
                        <div className="badge-title">{b.title}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>No badges earned yet.</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ CV TAB ══════════════════════════════════════════════════ */}
        {activeTab === 'cv' && (
          <div style={{ marginTop: 24 }}>
            <div ref={cvRef} style={{
              background: '#ffffff', color: '#111', borderRadius: 12,
              padding: isMobile ? 20 : 32,
              boxShadow: '0 15px 40px rgba(0,0,0,0.35)',
            }}>
              <div style={{ borderBottom: '2px solid #222', paddingBottom: 16, marginBottom: 20 }}>
                <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 28 }}>{profile?.username || 'User'}</h1>
                <p style={{ margin: '6px 0 0 0', color: '#555', fontSize: 13 }}>
                  {profile?.target_career || 'Developer'} • {profile?.email || 'user@example.com'}
                </p>
                <p style={{ margin: '6px 0 0 0', color: '#555', fontSize: 12 }}>
                  {profile?.github || ''} {profile?.linkedin ? `• ${profile.linkedin}` : ''}
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444' }}>Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {displaySkills.map((skill, i) => (
                    <span key={i} style={{ background: '#f1f1f1', color: '#111', padding: '4px 8px', borderRadius: 6, fontSize: 11 }}>
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444' }}>Projects</h3>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {projects && projects.length > 0 ? (
                    projects.map((proj, idx) => (
                      <div key={idx} style={{ borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, flexWrap: 'wrap', gap: 4 }}>
                          <span>{proj.module_title}</span>
                          <span style={{ color: '#666', fontWeight: 400 }}>{proj.date}</span>
                        </div>
                        <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#444' }}>• {proj.cv_text}</p>
                        {proj.link && <p style={{ margin: '6px 0 0 0', fontSize: 11, color: '#555', wordBreak: 'break-all' }}>{proj.link}</p>}
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 12, color: '#666' }}>Complete a module to populate your CV automatically.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Verification details modal ──────────────────────────── */}
        {detailsModule && (
          <div className="verification-modal" role="dialog" aria-label="Verification details">
            <div className="verification-modal-card">
              <div className="verification-modal-header">
                <div>
                  <div className="verification-modal-title">Verification Details</div>
                  <div className="verification-modal-sub">{detailsModule.label}</div>
                </div>
                <button className="verification-close" onClick={() => setDetailsModule(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <div className="verification-modal-body">
                <div className="verification-row"><span>Module completion</span><span>{detailsModule.lessons_total || 0}/{detailsModule.lessons_total || 0} lessons</span></div>
                <div className="verification-row"><span>Project requirements</span><span>{detailsModule.project_submission_link ? 'Submitted' : 'Missing repo'}</span></div>
                <div className="verification-row">
                  <span>GitHub analysis</span>
                  <span>
                    {detailsModule.verification_status === 'passed' ? 'PASS' : detailsModule.verification_status?.toUpperCase?.() || '—'}{' '}
                    ({detailsModule.github_score || 0})
                  </span>
                </div>
                <div className="verification-row"><span>Verification code</span><span>{detailsModule.certificate_id || `WN-${detailsModule.id}`}</span></div>
                <div className="verification-row"><span>Completed</span><span>{detailsModule.submitted_at ? new Date(detailsModule.submitted_at).toLocaleString() : '—'}</span></div>

                {detailsModule.score_breakdown?.checks && (
                  <div className="verification-checks">
                    <div className="verification-checks-title">GitHub checks</div>
                    {Object.entries(detailsModule.score_breakdown.checks).slice(0, 8).map(([k, v]) => (
                      <div key={k} className="verification-row"><span>{k}</span><span>{String(v)}</span></div>
                    ))}
                  </div>
                )}
              </div>

              <div className="verification-modal-actions">
                <button className="profile-action-secondary"
                  onClick={() => { if (detailsModule.project_submission_link) window.open(detailsModule.project_submission_link, '_blank'); }}
                  disabled={!detailsModule.project_submission_link}>
                  <Github size={14} /> Repo
                </button>
                <button className="profile-action-primary" onClick={() => downloadCertificate(detailsModule.id)}>
                  <Download size={14} /> Download Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
