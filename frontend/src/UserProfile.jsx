import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    User,
    MapPin,
    Briefcase,
    Github,
    Linkedin,
    Award,
    Calendar,
    Code,
    ExternalLink,
    MessageSquare,
    ThumbsUp,
    Terminal
} from 'lucide-react';

export default function UserProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_BASE_URL}/api/profile/${encodeURIComponent(username)}/`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            setProfile(response.data);
        } catch (err) {
            console.error("Error fetching profile:", err);
            if (err.response?.data) {
                console.error("BACKEND ERROR DETAILS:", err.response.data);
            }
            if (err.response?.status === 401) setError('This profile is community-only. Sign in to view it.');
            else if (err.response?.status === 403) setError('This profile is private.');
            else if (err.response?.status === 404) setError('User not found');
            else setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
                <div className="terminal-loader">
                    <div className="text">LOADING_PROFILE...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--error-red)' }}>
                <h2>404: USER_NOT_FOUND</h2>
                <button onClick={() => navigate(-1)} style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', cursor: 'pointer' }}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', height: '100%', overflowY: 'auto', background: 'var(--bg-dark)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* PROFILE HEADER CARD */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-subtle)',
                    padding: '20px',
                    marginBottom: '30px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                        background: 'linear-gradient(90deg, var(--neon-cyan), var(--electric-purple))'
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>

                        {/* Avatar */}
                        <div style={{
                            width: '100px', height: '100px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                            border: '2px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            overflow: 'hidden'
                        }}>
                            <img
                                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${profile.avatar_seed || profile.username}`}
                                alt={`@${profile.username} avatar`}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>

                        {/* Info */}
                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <h1 style={{ margin: 0, fontSize: '32px', color: '#fff', fontFamily: 'JetBrains Mono' }}>
                                    @{profile.username}
                                </h1>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '20px',
                                    background: 'rgba(0, 242, 255, 0.1)',
                                    color: 'var(--neon-cyan)', border: '1px solid rgba(0, 242, 255, 0.3)',
                                    fontSize: '12px', fontWeight: 'bold'
                                }}>
                                    {profile.market_label}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Briefcase size={16} /> {profile.target_career || "Tech Explorer"}
                                </div>
                                {profile.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success-green)' }} />
                                        Active Learner
                                    </div>
                                )}
                            </div>

                            {/* Stats Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', fontFamily: 'JetBrains Mono' }}>
                                        {profile.progress}%
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Roadmap Progress</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', fontFamily: 'JetBrains Mono' }}>
                                        {profile.completed_projects.length}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Projects Built</div>
                                </div>
                                {/* Socials */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {profile.github && (
                                        <a href={profile.github} target="_blank" rel="noreferrer" style={socialBtnStyle}>
                                            <Github size={18} />
                                        </a>
                                    )}
                                    {profile.linkedin && (
                                        <a href={profile.linkedin} target="_blank" rel="noreferrer" style={socialBtnStyle}>
                                            <Linkedin size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PROJECTS SECTION */}
                <h2 style={{ color: '#fff', fontFamily: 'JetBrains Mono', fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Terminal size={20} color="var(--neon-cyan)" />
                    COMPLETED_PROJECTS
                </h2>

                <div style={{ display: 'grid', gap: '20px' }}>
                    {profile.completed_projects.length > 0 ? (
                        profile.completed_projects.map(project => (
                            <div key={project.id} style={{
                                background: 'rgba(22, 27, 34, 0.6)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '12px', padding: '20px',
                                display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start'
                            }}>
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '10px',
                                    background: 'rgba(0, 242, 255, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--neon-cyan)'
                                }}>
                                    <Code size={24} />
                                </div>

                                <div style={{ width: '100%' }}>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '16px' }}>{project.label}</h3>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} /> {project.submitted_at}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <ThumbsUp size={12} /> {project.verifications} Verifications
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MessageSquare size={12} /> {project.comments_count} Comments
                                        </span>
                                    </div>
                                </div>

                                {project.link && (
                                    <a href={project.link} target="_blank" rel="noreferrer" style={{
                                        padding: '8px 16px', borderRadius: '6px',
                                        background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-main)', textDecoration: 'none', fontSize: '13px', width: '100%', justifyContent: 'center',
                                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                                    }}>
                                        View Code <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
                            No public projects yet.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

const socialBtnStyle = {
    width: '40px', height: '40px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)', transition: 'all 0.2s', cursor: 'pointer'
};
