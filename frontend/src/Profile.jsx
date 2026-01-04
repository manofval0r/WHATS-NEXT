import { useState, useEffect, useRef } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import {
    Download, Award, Hash, Github, Linkedin, Edit2, Check,
    ExternalLink, Briefcase, Terminal, User, FileText, Share2, Settings as SettingsIcon
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import ContributionGraph from './ContributionGraph';
import { useIsMobile } from './hooks/useMediaQuery';


export default function Profile() {
    // --- STATE ---
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'cv'

    // Editing State
    const [editingSocials, setEditingSocials] = useState(false);
    const [socialForm, setSocialForm] = useState({ github: '', linkedin: '' });
    const [editingItem, setEditingItem] = useState(null);
    const [editText, setEditText] = useState('');

    const navigate = useNavigate();
    const cvRef = useRef();
    const isMobile = useIsMobile();

    const handleExportPDF = () => {
        const element = cvRef.current;
        const opt = {
            margin: 10,
            filename: `${data.profile.username}_cv.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).save();
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/api/profile/');
            setData(res.data);
            setSocialForm({
                github: res.data.profile.github || '',
                linkedin: res.data.profile.linkedin || ''
            });
        } catch (err) {
            console.error("Error loading profile:", err);
            if (err.response?.data) {
                console.error("BACKEND ERROR DETAILS:", err.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSocials = async () => {
        try {
            await api.post('/api/profile/socials/', socialForm);
            setData(prev => ({
                ...prev,
                profile: { ...prev.profile, ...socialForm }
            }));
            setEditingSocials(false);
        } catch (err) {
            alert("Failed to save socials");
        }
    };

    const handleSaveCVText = async (itemId) => {
        try {
            await api.post(`/api/profile/cv/${itemId}/`, { text: editText });
            setData(prev => ({
                ...prev,
                projects: prev.projects.map(p => p.id === itemId ? { ...p, cv_text: editText } : p)
            }));
            setEditingItem(null);
        } catch (err) {
            alert("Failed to save text");
        }
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
            <div className="terminal-loader">
                <div className="text">GATHERING DEVELOPER RECORDS...</div>
            </div>
        </div>
    );

    if (!data) return null;

    const { profile, stats, projects } = data;

    return (
        <div style={{
            padding: isMobile ? '16px' : '40px',
            paddingTop: isMobile ? '16px' : '0px',
            height: '100%',
            overflowY: 'auto',
            background: '#05070a',
            paddingBottom: isMobile ? '100px' : '40px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* HEADER (Community Standard) */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 10,
                    background: 'rgba(5, 7, 10, 0.85)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(0, 242, 255, 0.1)',
                    marginBottom: '50px',
                    margin: isMobile ? '-16px -16px 30px -16px' : '-40px -40px 40px -40px',
                    padding: isMobile ? '16px' : '18px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '4px', height: '24px', background: 'var(--neon-cyan)', boxShadow: '0 0 10px var(--neon-cyan)' }}></div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#fff', fontFamily: 'JetBrains Mono', letterSpacing: '-0.5px' }}>
                                DEV_PROFILE
                            </h1>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Inter' }}>
                                YOUR RECORDS
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        {isMobile && (
                            <button
                                onClick={() => navigate('/settings')}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#fff',
                                    border: '1px solid #30363d',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <SettingsIcon size={20} />
                            </button>
                        )}

                        <button
                            onClick={handleExportPDF}
                            style={{
                                background: 'rgba(0, 242, 255, 0.1)',
                                color: 'var(--neon-cyan)',
                                border: '1px solid var(--neon-cyan)',
                                padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: 'JetBrains Mono'
                            }}
                        >
                            <Download size={16} /> {isMobile ? 'CV' : 'EXPORT_CV'}
                        </button>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '350px 1fr',
                    gap: isMobile ? '20px' : '40px'
                }}>

                    {/* LEFT COLUMN: IDENTITY CARD */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{
                            background: '#161b22', // Solid tech dark
                            border: '1px solid #30363d', // Tech border
                            borderRadius: '6px',
                            padding: '30px'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{
                                    width: '120px', height: '120px', borderRadius: '50%',
                                    background: '#0d1117',
                                    border: '2px solid var(--neon-cyan)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#fff', fontFamily: 'JetBrains Mono' }}>
                                        {profile.username[0].toUpperCase()}
                                    </span>
                                </div>

                                <h2 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>{profile.username}</h2>
                                <p style={{ color: 'var(--neon-cyan)', margin: '5px 0 20px 0', fontSize: '14px', fontFamily: 'JetBrains Mono' }}>
                                    {profile.target_career}
                                </p>

                                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                    <div style={statBadgeStyle}>
                                        <Award size={14} color="var(--electric-purple)" />
                                        <span>{profile.market_label}</span>
                                    </div>
                                    <div style={statBadgeStyle}>
                                        <Hash size={14} color="var(--success-green)" />
                                        <span>{stats.completed} Modules</span>
                                    </div>
                                </div>

                                {/* Socials */}
                                <div style={{ width: '100%', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>COMM_LINKS</span>
                                        <button onClick={() => setEditingSocials(!editingSocials)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            {editingSocials ? <Check size={16} color="var(--success-green)" /> : <Edit2 size={14} />}
                                        </button>
                                    </div>

                                    {editingSocials ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input
                                                placeholder="GitHub URL"
                                                value={socialForm.github}
                                                onChange={e => setSocialForm({ ...socialForm, github: e.target.value })}
                                                style={inputStyle}
                                            />
                                            <input
                                                placeholder="LinkedIn URL"
                                                value={socialForm.linkedin}
                                                onChange={e => setSocialForm({ ...socialForm, linkedin: e.target.value })}
                                                style={inputStyle}
                                            />
                                            <button onClick={handleSaveSocials} style={saveBtnStyle}>SAVE_LINKS</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {profile.github ? (
                                                <a href={profile.github} target="_blank" rel="noreferrer" style={socialLinkStyle}>
                                                    <Github size={16} /> GitHub Profile <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                                </a>
                                            ) : <div style={emptySocialStyle}>No GitHub Linked</div>}

                                            {profile.linkedin ? (
                                                <a href={profile.linkedin} target="_blank" rel="noreferrer" style={socialLinkStyle}>
                                                    <Linkedin size={16} /> LinkedIn Profile <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                                </a>
                                            ) : <div style={emptySocialStyle}>No LinkedIn Linked</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CONTENT */}
                    <div>
                        {/* STREAK GRAPH */}
                        <ContributionGraph />

                        {/* TABS */}
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <button
                                onClick={() => setActiveTab('projects')}
                                style={activeTab === 'projects' ? activeTabStyle : tabStyle}
                            >
                                <Terminal size={16} /> MISSION_LOG
                            </button>
                            <button
                                onClick={() => setActiveTab('cv')}
                                style={activeTab === 'cv' ? activeTabStyle : tabStyle}
                            >
                                <FileText size={16} /> CV
                            </button>
                        </div>

                        {/* PROJECTS TAB */}
                        {activeTab === 'projects' && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '20px'
                            }}>
                                {projects.length > 0 ? projects.map(proj => (
                                    <div key={proj.id} style={projectCardStyle}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                            <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>{proj.module_title}</h3>
                                            <button
                                                onClick={() => {
                                                    if (editingItem === proj.id) handleSaveCVText(proj.id);
                                                    else { setEditingItem(proj.id); setEditText(proj.cv_text); }
                                                }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                            >
                                                {editingItem === proj.id ? <Check size={16} color="var(--success-green)" /> : <Edit2 size={14} />}
                                            </button>
                                        </div>

                                        {editingItem === proj.id ? (
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                style={textareaStyle}
                                                rows={4}
                                            />
                                        ) : (
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', flex: 1 }}>
                                                {proj.cv_text}
                                            </p>
                                        )}

                                        {proj.link && (
                                            <a href={proj.link} target="_blank" rel="noreferrer" style={projectLinkStyle}>
                                                <Share2 size={14} /> View Submission
                                            </a>
                                        )}
                                    </div>
                                )) : (
                                    <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
                                        No missions completed yet. Return to Dashboard.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CV TAB */}
                        {activeTab === 'cv' && (
                            <div style={{ animation: 'fadeIn 0.3s' }}>
                                <div ref={cvRef} style={paperStyle}>
                                    {/* CV HEADER */}
                                    <div style={{ borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '25px' }}>
                                        <h1 style={{ margin: 0, fontSize: '32px', color: '#000', textTransform: 'uppercase' }}>{profile.username}</h1>
                                        <p style={{ margin: '5px 0', color: '#555', fontSize: '14px' }}>
                                            {profile.target_career} • {profile.email || 'user@example.com'}
                                        </p>
                                        <div style={{ fontSize: '12px', color: '#000', marginTop: '5px' }}>
                                            {profile.github} • {profile.linkedin}
                                        </div>
                                    </div>

                                    {/* CV SECTIONS */}
                                    <div style={cvSectionStyle}>
                                        <h3 style={cvHeaderStyle}>PROJECT EXPERIENCE</h3>
                                        {projects.length > 0 ? projects.map((proj, i) => (
                                            <div key={i} style={{ marginBottom: '15px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                                                    <span>{proj.module_title}</span>
                                                    <span style={{ color: '#666', fontWeight: 'normal' }}>{proj.date}</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#333' }}>
                                                    • {proj.cv_text}
                                                </p>
                                            </div>
                                        )) : <p style={{ fontSize: '13px', color: '#666' }}>No projects yet.</p>}
                                    </div>

                                    <div style={cvSectionStyle}>
                                        <h3 style={cvHeaderStyle}>TECHNICAL SKILLS</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {projects.flatMap(p => p.tags || []).filter((v, i, a) => a.indexOf(v) === i).map((tag, i) => (
                                                <span key={i} style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: '#333' }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}

// --- STYLES ---
// cardStyle replaced inline with solid tech style

const statBadgeStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(255,255,255,0.05)', padding: '6px 12px',
    borderRadius: '20px', fontSize: '12px', color: '#fff',
    border: '1px solid var(--border-subtle)'
};

const inputStyle = {
    width: '100%', padding: '10px', background: '#0d1117',
    border: '1px solid var(--border-subtle)', borderRadius: '6px',
    color: '#fff', fontSize: '13px', outline: 'none'
};

const saveBtnStyle = {
    width: '100%', padding: '8px', background: 'var(--neon-green)',
    border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px'
};

const socialLinkStyle = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px', background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px', color: 'var(--text-main)', textDecoration: 'none',
    fontSize: '13px', transition: '0.2s', border: '1px solid transparent'
};

const emptySocialStyle = {
    padding: '10px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)',
    border: '1px dashed var(--border-subtle)', borderRadius: '8px'
};

const tabStyle = {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    padding: '10px 0', fontSize: '14px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px',
    borderBottom: '2px solid transparent', transition: '0.2s'
};

const activeTabStyle = {
    ...tabStyle, color: '#fff', borderBottom: '2px solid var(--neon-cyan)'
};

const projectCardStyle = {
    background: 'rgba(22, 27, 34, 0.6)', border: '1px solid var(--border-subtle)',
    borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column'
};

const textareaStyle = {
    width: '100%', background: '#0d1117', border: '1px solid var(--border-active)',
    color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '13px',
    fontFamily: 'inherit', resize: 'vertical'
};

const projectLinkStyle = {
    marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-subtle)',
    display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon-cyan)',
    fontSize: '12px', textDecoration: 'none'
};

// CV Paper Styles
const paperStyle = {
    background: '#fff', color: '#000', padding: '40px',
    borderRadius: '2px', minHeight: '800px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    fontFamily: 'Georgia, serif'
};

const cvSectionStyle = { marginBottom: '30px' };
const cvHeaderStyle = {
    fontSize: '14px', fontWeight: 'bold', color: '#000',
    borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px',
    letterSpacing: '1px'
};