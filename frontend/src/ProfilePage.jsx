export { default } from './ProfilePageV2';

/*

LEGACY PROFILE PAGE (disabled)
--------------------------------
This file previously held the Profile page implementation, but it became
syntactically corrupted during iterative edits. We keep it only as a stable
import path for older imports, while the real implementation lives in
ProfilePageV2.

If you need the legacy code for reference, it's preserved below in this comment.

import React, { useMemo, useRef, useState, useEffect } from 'react';
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
    Shield,
    Twitter,
    X,
    Zap,
} from 'lucide-react';
import './Profile.css';
import html2pdf from 'html2pdf.js';
import { usePremium } from './premium/PremiumContext';

function buildIso(date) {
    return new Date(date).toISOString().slice(0, 10);
}

*/

export default function ProfilePage() {
    const [heatmapData, setHeatmapData] = useState(Array.from({ length: 53 }, () => Array(7).fill(0)));
    const [heatmapMeta, setHeatmapMeta] = useState({});
    const [tooltip, setTooltip] = useState(null);

    const [profileData, setProfileData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const cvRef = useRef(null);
    const { requestCvExport } = usePremium();

                                <Shield size={16} color="var(--text-secondary)" />
                            </div>

                            <div className="profile-actions-form">
                                <label className="profile-actions-label">Profile visibility</label>
                                <select
                                    className="profile-actions-input"
                                    value={privacy.profile_visibility}
                                    onChange={(e) => setPrivacy((p) => ({ ...p, profile_visibility: e.target.value }))}
                                >
                                    <option value="public">Public</option>
                                    <option value="community">Community-only</option>
                                    <option value="private">Private</option>
                                </select>

                                <label className="profile-actions-toggle">
                                    <input
                                        type="checkbox"
                                        checked={privacy.allow_indexing}
                                        onChange={(e) => setPrivacy((p) => ({ ...p, allow_indexing: e.target.checked }))}
                                    />
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
                                        <input
                                            type="checkbox"
                                            checked={!!privacy.activity_visibility[key]}
                                            onChange={(e) =>
                                                setPrivacy((p) => ({
                                                    ...p,
                                                    activity_visibility: { ...p.activity_visibility, [key]: e.target.checked },
                                                }))
                                            }
                                        />
                                        <span>{label}</span>
                                    </label>
                                ))}

                                <button className="profile-action-primary" onClick={handleSavePrivacy} disabled={savingPrivacy}>
                                    {savingPrivacy ? 'Saving…' : 'Save Privacy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', marginBottom: '8px', alignItems: 'center' }}>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={activeTab === 'overview' ? 'tab-button active' : 'tab-button'}
                        style={{
                            background: activeTab === 'overview' ? 'rgba(95, 245, 255, 0.12)' : 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: activeTab === 'overview' ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('cv')}
                        className={activeTab === 'cv' ? 'tab-button active' : 'tab-button'}
                        style={{
                            background: activeTab === 'cv' ? 'rgba(255, 190, 11, 0.12)' : 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: activeTab === 'cv' ? 'var(--neon-gold)' : 'var(--text-secondary)',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }}
                    >
                        Live CV
                    </button>

                    {activeTab === 'cv' && (
                        <button
                            onClick={handleExportCV}
                            style={{
                                marginLeft: 'auto',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255, 190, 11, 0.12)',
                                border: '1px solid rgba(255, 190, 11, 0.3)',
                                color: 'var(--neon-gold)',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                cursor: 'pointer',
                            }}
                        >
                            <Download size={16} /> Export PDF
                        </button>
                    )}
                </div>

                {activeTab === 'overview' && (
                    <>
                        {privacy.activity_visibility.show_contribution_graph && (
                            <div className="contribution-section" style={{ position: 'relative' }}>
                                <div className="section-header">
                                    <h2 className="section-title">
                                        <GitCommit size={20} className="text-neon-cyan" /> Contribution Graph
                                    </h2>
                                    <div className="heatmap-legend">
                                        <span>Less</span>
                                        <div className="heatmap-cell level-0"></div>
                                        <div className="heatmap-cell level-1"></div>
                                        <div className="heatmap-cell level-2"></div>
                                        <div className="heatmap-cell level-3"></div>
                                        <div className="heatmap-cell level-4"></div>
                                        <span>More</span>
                                    </div>
                                </div>

                                <div className="heatmap-summary">
                                    <div>
                                        Total activities this year: <strong>{stats?.total_activities_year || 0}</strong>
                                    </div>
                                    <div>
                                        Longest streak: <strong>{stats?.longest_streak || 0}</strong> days
                                    </div>
                                    <div>
                                        Current streak: <strong>🔥 {stats?.streak || 0}</strong> days
                                    </div>
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
                                                        start.setDate(start.getDate() - (53 * 7));
                                                        start.setDate(start.getDate() - start.getDay());

                                                        const idx = (wIndex * 7) + dIndex;
                                                        const date = new Date(start);
                                                        date.setDate(date.getDate() + idx);
                                                        const iso = buildIso(date);
                                                        const meta = heatmapMeta[iso] || { total: 0, byType: {} };

                                                        setTooltip({
                                                            iso,
                                                            total: meta.total,
                                                            byType: meta.byType,
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
                                                    <div key={k} className="heatmap-tooltip-row">
                                                        <span>{k}</span>
                                                        <span>{v}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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

                        <div className="profile-main-grid">
                            {privacy.activity_visibility.show_skills && (
                                <div className="skills-card">
                                    <h2 className="section-title" style={{ marginBottom: 24 }}>
                                        <Zap size={20} color="#ffbe0b" /> Skills Showcase
                                    </h2>

                                    <div className="skills-subtitle">Verified Skills</div>
                                    <div className="verified-modules">
                                        {(modules?.completed || []).length > 0 ? (
                                            modules.completed.slice(0, 6).map((m) => (
                                                <div key={m.id} className="verified-module">
                                                    <div className="verified-module-top">
                                                        <div className="verified-module-title">{m.label}</div>
                                                        <div className="verified-module-meta">
                                                            Verified {m.submitted_at ? new Date(m.submitted_at).toLocaleDateString() : '—'}
                                                        </div>
                                                    </div>
                                                    <div className="verified-competencies">
                                                        {(m.competencies || []).slice(0, 6).map((c) => (
                                                            <span key={c} className="competency-pill">
                                                                {c}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="verified-links">
                                                        {m.project_submission_link ? (
                                                            <a href={m.project_submission_link} target="_blank" rel="noreferrer" className="verified-link">
                                                                <Github size={14} /> GitHub Repo
                                                            </a>
                                                        ) : (
                                                            <div className="verified-link disabled">
                                                                <Github size={14} /> No repo
                                                            </div>
                                                        )}
                                                        <button className="verified-link btn" onClick={() => setDetailsModule(m)}>
                                                            View Verification Details
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ color: 'var(--text-secondary)' }}>No verified modules yet.</div>
                                        )}
                                    </div>

                                    <div className="skills-subtitle" style={{ marginTop: 18 }}>
                                        In-Progress Modules
                                    </div>
                                    <div className="inprogress-list">
                                        {(modules?.active || []).length > 0 ? (
                                            modules.active.slice(0, 3).map((m) => (
                                                <div key={m.id} className="inprogress-item">
                                                    <div className="inprogress-title">{m.label}</div>
                                                    <div className="inprogress-meta">Lessons: 0/{m.lessons_total || 0} • Status: Active</div>
                                                    <a className="inprogress-cta" href={`/module/${m.id}`}>
                                                        Continue Learning
                                                    </a>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ color: 'var(--text-secondary)' }}>No active module right now.</div>
                                        )}
                                    </div>

                                    <div className="skills-subtitle" style={{ marginTop: 18 }}>
                                        Upcoming Modules
                                    </div>
                                    <div className="upcoming-grid">
                                        {(modules?.locked || []).length > 0 ? (
                                            modules.locked.slice(0, 6).map((m) => (
                                                <div key={m.id} className="upcoming-item">
                                                    <Lock size={14} /> {m.label}
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ color: 'var(--text-secondary)' }}>No upcoming modules found.</div>
                                        )}
                                    </div>

                                    <div className="skills-subtitle" style={{ marginTop: 18 }}>
                                        Tag-derived skills
                                    </div>
                                    <div className="skills-grid">
                                        {displaySkills.map((skill, i) => (
                                            <div key={i} className="skill-badge">
                                                <Circle size={12} />
                                                <span>{skill.name}</span>
                                            </div>
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
                                            <div style={{ color: '#8b949e', fontStyle: 'italic' }}>No recent activity detected.</div>
                                        )}
                                    </div>
                                    <a href="/profile/activity" className="activity-more">
                                        View full history
                                    </a>
                                </div>
                            )}
                        </div>

                        {privacy.activity_visibility.show_achievements && (
                            <div className="achievements-card">
                                <div className="section-header" style={{ marginBottom: 14 }}>
                                    <h2 className="section-title">
                                        <Award size={20} /> Achievements
                                    </h2>
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
                                        <div style={{ color: 'var(--text-secondary)' }}>No badges earned yet.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'cv' && (
                    <div style={{ marginTop: '24px' }}>
                        <div
                            ref={cvRef}
                            style={{
                                background: '#ffffff',
                                color: '#111',
                                borderRadius: '12px',
                                padding: '32px',
                                boxShadow: '0 15px 40px rgba(0,0,0,0.35)',
                            }}
                        >
                            <div style={{ borderBottom: '2px solid #222', paddingBottom: '16px', marginBottom: '20px' }}>
                                <h1 style={{ margin: 0, fontSize: '28px' }}>{profile?.username || 'User'}</h1>
                                <p style={{ margin: '6px 0 0 0', color: '#555', fontSize: '13px' }}>
                                    {profile?.target_career || 'Developer'} • {profile?.email || 'user@example.com'}
                                </p>
                                <p style={{ margin: '6px 0 0 0', color: '#555', fontSize: '12px' }}>
                                    {profile?.github || ''} {profile?.linkedin ? `• ${profile.linkedin}` : ''}
                                </p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444' }}>
                                    Skills
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {displaySkills.map((skill, i) => (
                                        <span
                                            key={i}
                                            style={{ background: '#f1f1f1', color: '#111', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}
                                        >
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444' }}>
                                    Projects
                                </h3>
                                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {projects && projects.length > 0 ? (
                                        projects.map((proj, idx) => (
                                            <div key={idx} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                                                    <span>{proj.module_title}</span>
                                                    <span style={{ color: '#666', fontWeight: 400 }}>{proj.date}</span>
                                                </div>
                                                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#444' }}>• {proj.cv_text}</p>
                                                {proj.link && <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#555' }}>{proj.link}</p>}
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ fontSize: '12px', color: '#666' }}>Complete a module to populate your CV automatically.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                                <div className="verification-row">
                                    <span>Module completion</span>
                                    <span>
                                        {detailsModule.lessons_total || 0}/{detailsModule.lessons_total || 0} lessons
                                    </span>
                                </div>
                                <div className="verification-row">
                                    <span>Project requirements</span>
                                    <span>{detailsModule.project_submission_link ? 'Submitted' : 'Missing repo'}</span>
                                </div>
                                <div className="verification-row">
                                    <span>GitHub analysis</span>
                                    <span>
                                        {detailsModule.verification_status === 'passed'
                                            ? 'PASS'
                                            : detailsModule.verification_status?.toUpperCase?.() || '—'}{' '}
                                        ({detailsModule.github_score || 0})
                                    </span>
                                </div>
                                <div className="verification-row">
                                    <span>Verification code</span>
                                    <span>{detailsModule.certificate_id || `WN-${detailsModule.id}`}</span>
                                </div>
                                <div className="verification-row">
                                    <span>Completed</span>
                                    <span>{detailsModule.submitted_at ? new Date(detailsModule.submitted_at).toLocaleString() : '—'}</span>
                                </div>

                                {detailsModule.score_breakdown?.checks && (
                                    <div className="verification-checks">
                                        <div className="verification-checks-title">GitHub checks</div>
                                        {Object.entries(detailsModule.score_breakdown.checks)
                                            .slice(0, 8)
                                            .map(([k, v]) => (
                                                <div key={k} className="verification-row">
                                                    <span>{k}</span>
                                                    <span>{String(v)}</span>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            <div className="verification-modal-actions">
                                <button
                                    className="profile-action-secondary"
                                    onClick={() => {
                                        if (detailsModule.project_submission_link) window.open(detailsModule.project_submission_link, '_blank');
                                    }}
                                    disabled={!detailsModule.project_submission_link}
                                >
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
                                                        const today = new Date();
                                                        const start = new Date(today);
                                                        start.setDate(start.getDate() - (53 * 7));
                                                        start.setDate(start.getDate() - start.getDay());
                                                        const idx = (wIndex * 7) + dIndex;
                                                        const date = new Date(start);
                                                        date.setDate(date.getDate() + idx);
                                                        const iso = date.toISOString().slice(0, 10);
                                                        const meta = heatmapMeta[iso] || { total: 0, byType: {} };

                                                        setTooltip({
                                                            iso,
                                                            total: meta.total,
                                                            byType: meta.byType,
                                                            x: rect.left - (rootRect?.left || 0) + rect.width / 2,
                                                            y: rect.top - (rootRect?.top || 0) - 10,
                                                        });
                                                    }}
                                                    onMouseLeave={() => setTooltip(null)}
                                    <button
                                        onClick={handleExportCV}
                                        style={{
                                            marginLeft: 'auto',
                                            display: 'inline-flex',

                                {tooltip && (
                                    <div className="heatmap-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                                        <div className="heatmap-tooltip-date">{tooltip.iso}</div>
                                        <div className="heatmap-tooltip-total">Total: {tooltip.total}</div>
                                        <div className="heatmap-tooltip-breakdown">
                                            {Object.keys(tooltip.byType).length === 0 ? (
                                                <div className="heatmap-tooltip-row">No activity</div>
                                            ) : (
                                                Object.entries(tooltip.byType).map(([k, v]) => (
                                                    <div key={k} className="heatmap-tooltip-row">
                                                        <span>{k}</span>
                                                        <span>{v}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                                            alignItems: 'center',
                            )}

                            {/* Overview stats + Achievements */}
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
                                            gap: '8px',
                                            background: 'rgba(255, 190, 11, 0.12)',
                                            border: '1px solid rgba(255, 190, 11, 0.3)',
                                            color: 'var(--neon-gold)',
                                            padding: '8px 14px',
                                {privacy.activity_visibility.show_skills && (
                                <div className="skills-card">
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                    {/* Verified Skills (module-level) */}
                                    <div className="skills-subtitle">Verified Skills</div>
                                    <div className="verified-modules">
                                        {(modules?.completed || []).length > 0 ? (modules.completed.slice(0, 6).map((m) => (
                                            <div key={m.id} className="verified-module">
                                                <div className="verified-module-top">
                                                    <div className="verified-module-title">{m.label}</div>
                                                    <div className="verified-module-meta">Verified {m.submitted_at ? new Date(m.submitted_at).toLocaleDateString() : '—'}</div>
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
                                        ))) : (
                                            <div style={{ color: 'var(--text-secondary)' }}>No verified modules yet.</div>
                                        )}
                                    </div>

                                    {/* In Progress */}
                                    <div className="skills-subtitle" style={{ marginTop: 18 }}>In-Progress Modules</div>
                                    <div className="inprogress-list">
                                        {(modules?.active || []).length > 0 ? modules.active.slice(0, 3).map((m) => (
                                            <div key={m.id} className="inprogress-item">
                                                <div className="inprogress-title">{m.label}</div>
                                                <div className="inprogress-meta">Lessons: 0/{m.lessons_total || 0} • Status: Active</div>
                                                <a className="inprogress-cta" href={`/module/${m.id}`}>Continue Learning</a>
                                            </div>
                                        )) : (
                                            <div style={{ color: 'var(--text-secondary)' }}>No active module right now.</div>
                                        )}
                                    </div>

                                    {/* Upcoming */}
                                    <div className="skills-subtitle" style={{ marginTop: 18 }}>Upcoming Modules</div>
                                    <div className="upcoming-grid">
                                        {(modules?.locked || []).length > 0 ? modules.locked.slice(0, 6).map((m) => (
                                            <div key={m.id} className="upcoming-item">
                                                <Lock size={14} /> {m.label}
                                            </div>
                                        )) : (
                                            <div style={{ color: 'var(--text-secondary)' }}>No upcoming modules found.</div>
                                        )}
                                    </div>
                                </div>
                                )}
                            <>
                                {/* 2. Contribution Graph */}
                                {privacy.activity_visibility.show_activity_feed && (
                                <div className="activity-card">
                <div className="section-header">
                    <h2 className="section-title"><GitCommit size={20} className="text-neon-cyan" /> Contribution Graph</h2>
                    <div className="heatmap-legend">
                        <span>Less</span>
                                        {activities.length > 0 ? activities.slice(0, 10).map((item, i) => (
                        <div className="heatmap-cell level-1"></div>
                        <div className="heatmap-cell level-2"></div>
                        <div className="heatmap-cell level-3"></div>
                        <div className="heatmap-cell level-4"></div>
                        <span>More</span>
                    </div>
                </div>
                
                <div className="heatmap-container">
                    {heatmapData.map((week, wIndex) => (
                        <div key={wIndex} className="heatmap-col">
                            {week.map((level, dIndex) => (
                                <div 
                                    key={`${wIndex}-${dIndex}`} 
                                    className={`heatmap-cell level-${level}`}
                                    title={`${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dIndex]} - ${level} contributions`}

                                    <a href="/profile/activity" className="activity-more">View full history</a>
                                ></div>
                                )}

                            </div>

                            {privacy.activity_visibility.show_achievements && (
                                <div className="achievements-card">
                                    <div className="section-header" style={{ marginBottom: 14 }}>
                                        <h2 className="section-title"><Award size={20} /> Achievements</h2>
                                    </div>
                                    <div className="badge-grid">
                                        {(achievements?.recent || []).length > 0 ? achievements.recent.slice(0, 6).map((b) => (
                                            <div key={b.key} className="badge-item" title={b.category}>
                                                <div className="badge-icon">🏅</div>
                                                <div className="badge-title">{b.title}</div>
                                            </div>
                                        )) : (
                                            <div style={{ color: 'var(--text-secondary)' }}>No badges earned yet.</div>
                                        )}
                                    </div>
                            ))}
                            )}
                </div>
            </div>

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
                                                        <div className="verification-row">
                                                            <span>Module completion</span>
                                                            <span>{detailsModule.lessons_total || 0}/{detailsModule.lessons_total || 0} lessons</span>
                                                        </div>
                                                        <div className="verification-row">
                                                            <span>Project requirements</span>
                                                            <span>{detailsModule.project_submission_link ? 'Submitted' : 'Missing repo'}</span>
                                                        </div>
                                                        <div className="verification-row">
                                                            <span>GitHub analysis</span>
                                                            <span>{detailsModule.verification_status === 'passed' ? 'PASS' : detailsModule.verification_status?.toUpperCase?.() || '—'} ({detailsModule.github_score || 0})</span>
                                                        </div>
                                                        <div className="verification-row">
                                                            <span>Verification code</span>
                                                            <span>{detailsModule.certificate_id || `WN-${detailsModule.id}`}</span>
                                                        </div>
                                                        <div className="verification-row">
                                                            <span>Completed</span>
                                                            <span>{detailsModule.submitted_at ? new Date(detailsModule.submitted_at).toLocaleString() : '—'}</span>
                                                        </div>

                                                        {detailsModule.score_breakdown?.checks && (
                                                            <div className="verification-checks">
                                                                <div className="verification-checks-title">GitHub checks</div>
                                                                {Object.entries(detailsModule.score_breakdown.checks).slice(0, 8).map(([k, v]) => (
                                                                    <div key={k} className="verification-row">
                                                                        <span>{k}</span>
                                                                        <span>{String(v)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="verification-modal-actions">
                                                        <button className="profile-action-secondary" onClick={() => {
                                                            if (detailsModule.project_submission_link) window.open(detailsModule.project_submission_link, '_blank');
                                                        }} disabled={!detailsModule.project_submission_link}>
                                                            <Github size={14} /> Repo
                                                        </button>
                                                        <button className="profile-action-primary" onClick={() => downloadCertificate(detailsModule.id)}>
                                                            <Download size={14} /> Download Certificate
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

            {/* 3. Main Grid: Skills & Activity */}
            <div className="profile-main-grid">
                
                {/* Skills */}
                <div className="skills-card">
                    <h2 className="section-title" style={{marginBottom: 24}}>
                        <Zap size={20} color="#ffbe0b" /> Skill Matrix
                    </h2>
                    <div className="skills-grid">
                        {displaySkills.map((skill, i) => (
                            <div key={i} className="skill-badge">
                                <Circle size={12} />
                                <span>{skill.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-card">
                    <h2 className="section-title" style={{marginBottom: 24}}>
                        <Clock size={20} color="#bc13fe" /> Recent Activity
                    </h2>
                    <div className="activity-list">
                        {activities.length > 0 ? activities.slice(0, 5).map((item, i) => (
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
                        )) : (
                            <div style={{ color: '#8b949e', fontStyle: 'italic' }}>No recent activity detected.</div>
                        )}
                    </div>
                </div>

                        </div>
                            </>
                        )}

                        {activeTab === 'cv' && (
                            <div style={{ marginTop: '24px' }}>
                                <div
                                    ref={cvRef}
                                    style={{
                                        background: '#ffffff',
                                        color: '#111',
                                        borderRadius: '12px',
                                        padding: '32px',
                                        boxShadow: '0 15px 40px rgba(0,0,0,0.35)'
                                    }}
                                >
                                    <div style={{ borderBottom: '2px solid #222', paddingBottom: '16px', marginBottom: '20px' }}>
                                        <h1 style={{ margin: 0, fontSize: '28px' }}>{profile?.username || 'User'}</h1>
                                        <p style={{ margin: '6px 0 0 0', color: '#555', fontSize: '13px' }}>
                                            {profile?.target_career || 'Developer'} • {profile?.email || 'user@example.com'}
                                        </p>
                                        <p style={{ margin: '6px 0 0 0', color: '#555', fontSize: '12px' }}>
                                            {profile?.github || ''} {profile?.linkedin ? `• ${profile.linkedin}` : ''}
                                        </p>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444' }}>Skills</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                            {displaySkills.map((skill, i) => (
                                                <span key={i} style={{ background: '#f1f1f1', color: '#111', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}>
                                                    {skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444' }}>Projects</h3>
                                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {projects && projects.length > 0 ? projects.map((proj, idx) => (
                                                <div key={idx} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                                                        <span>{proj.module_title}</span>
                                                        <span style={{ color: '#666', fontWeight: 400 }}>{proj.date}</span>
                                                    </div>
                                                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#444' }}>
                                                        • {proj.cv_text}
                                                    </p>
                                                    {proj.link && (
                                                        <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#555' }}>{proj.link}</p>
                                                    )}
                                                </div>
                                            )) : (
                                                <p style={{ fontSize: '12px', color: '#666' }}>Complete a module to populate your CV automatically.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
        </div>
    </div>
  );
}
