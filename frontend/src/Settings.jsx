import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Wallet, LogOut, Trash2, Download, Activity, Palette, Shield, Bell, Crown, Lock } from 'lucide-react';
import { initTheme, applyTheme } from './theme';
import { useIsMobile } from './hooks/useMediaQuery';
import { usePremium } from './premium/PremiumContext';
import { usePostHogApp } from './PostHogProvider';

export default function Settings() {
    const [username, setUsername] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [usernameSaving, setUsernameSaving] = useState(false);
    const [lastUsernameChangeAt, setLastUsernameChangeAt] = useState(null);
    const [avatarSeed, setAvatarSeed] = useState(null);
    const [gender, setGender] = useState('unspecified');

    const [budget, setBudget] = useState('FREE');
    const [loading, setLoading] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('neon-dojo');
    const [profileVisibility, setProfileVisibility] = useState('public');
    const [allowIndexing, setAllowIndexing] = useState(true);
    const [activityVisibility, setActivityVisibility] = useState({
        show_contribution_graph: true,
        show_activity_feed: true,
        show_achievements: true,
        show_skills: true,
        show_projects: true,
    });
    const [emailNotifications, setEmailNotifications] = useState(true);
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { status, openGate } = usePremium();
    const { reset: resetPostHog, featureFlag } = usePostHogApp();
    const showPremiumCard = featureFlag('show-premium-features') !== false;

    useEffect(() => {
        initTheme();
        const saved = localStorage.getItem('app-theme') || 'standard-dark';
        setSelectedTheme(saved);
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/api/settings/');
            setUsername(res.data.username || localStorage.getItem('username') || '');
            setNewUsername('');
            setLastUsernameChangeAt(res.data.last_username_change_at || null);
            setAvatarSeed(res.data.avatar_seed || null);
            setGender(res.data.gender || 'unspecified');
            setBudget(res.data.budget_preference || 'FREE');
            setProfileVisibility(res.data.profile_visibility || 'public');
            setAllowIndexing(res.data.allow_indexing !== undefined ? res.data.allow_indexing : true);
            setActivityVisibility({
                show_contribution_graph: res.data.activity_visibility?.show_contribution_graph ?? true,
                show_activity_feed: res.data.activity_visibility?.show_activity_feed ?? true,
                show_achievements: res.data.activity_visibility?.show_achievements ?? true,
                show_skills: res.data.activity_visibility?.show_skills ?? true,
                show_projects: res.data.activity_visibility?.show_projects ?? true,
            });
            setEmailNotifications(res.data.email_notifications !== undefined ? res.data.email_notifications : true);
        } catch (e) {
            console.error('Failed to fetch settings');
        }
    };

    const computeUsernameCooldown = () => {
        if (!lastUsernameChangeAt) return { allowed: true, daysRemaining: 0, nextAllowedAt: null };
        const last = new Date(lastUsernameChangeAt);
        const next = new Date(last.getTime() + 20 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const diffMs = next.getTime() - now.getTime();
        if (diffMs <= 0) return { allowed: true, daysRemaining: 0, nextAllowedAt: next };
        const daysRemaining = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
        return { allowed: false, daysRemaining, nextAllowedAt: next };
    };

    const handleUpdateUsername = async () => {
        const desired = (newUsername || '').trim();
        if (!desired) {
            alert('Enter a new username');
            return;
        }
        setUsernameSaving(true);
        try {
            const res = await api.post('/api/account/username/', { username: desired });
            const updated = res.data?.username || desired;
            setUsername(updated);
            setNewUsername('');
            localStorage.setItem('username', updated);
            setLastUsernameChangeAt(res.data?.last_username_change_at || new Date().toISOString());
            alert('Username updated');
        } catch (e) {
            const msg = e?.response?.data?.error || 'Failed to update username';
            const next = e?.response?.data?.next_allowed_at;
            if (next) setLastUsernameChangeAt(lastUsernameChangeAt || new Date().toISOString());
            alert(msg);
        } finally {
            setUsernameSaving(false);
        }
    };

    const handleUpdateSettings = async () => {
        setLoading(true);
        try {
            await api.post('/api/settings/update/', {
                budget,
                gender,
                profile_visibility: profileVisibility,
                allow_indexing: allowIndexing,
                activity_visibility: activityVisibility,
                email_notifications: emailNotifications
            });
            alert("Settings saved!");
        } catch (e) {
            alert("Error saving settings");
        } finally {
            setLoading(false);
        }
    };

    const handleThemeChange = (e) => {
        const theme = e.target.value;
        setSelectedTheme(theme);
        applyTheme(theme);
    };

    const handleLogout = () => {
        resetPostHog();
        localStorage.removeItem('access_token');
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) return;
        try {
            await api.delete('/api/account/delete/');
            alert('Account deleted.');
            localStorage.removeItem('access_token');
            navigate('/');
        } catch (e) {
            alert('Error deleting account.');
        }
    };

    const handleExportData = async () => {
        try {
            const res = await api.get('/api/account/export/', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'account_data.json');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            alert('Error exporting data.');
        }
    };

    const handleActivityLog = () => {
        navigate('/profile/activity');
    };

    return (
        <div style={{
            ...pageStyle,
            padding: isMobile ? '16px' : '40px'
        }}>
            <div style={{
                ...containerStyle,
                maxWidth: isMobile ? '100%' : '700px'
            }}>
                <button onClick={() => navigate('/dashboard')} style={backBtnStyle}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <h1 style={headerStyle}>Settings</h1>

                {/* ACCOUNT CARD */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Shield size={20} /> Account</h2>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'var(--bg-dark)' }}>
                            <img
                                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${avatarSeed || username || 'User'}`}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 600 }}>@{username || 'user'}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Stable, gender-neutral avatar (no uploads needed).</div>
                        </div>
                    </div>

                    {/* Username change */}
                    {(() => {
                        const cd = computeUsernameCooldown();
                        return (
                            <div style={{ marginBottom: '18px' }}>
                                <label style={labelStyle}>Change Username (once every 20 days)</label>
                                <input
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="new_username"
                                    style={{
                                        width: '100%',
                                        background: 'var(--bg-dark)',
                                        border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-main)',
                                        padding: '14px 16px',
                                        borderRadius: '6px',
                                        outline: 'none',
                                        fontSize: '16px',
                                        minHeight: '48px',
                                        marginBottom: 10
                                    }}
                                />
                                {!cd.allowed && (
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>
                                        Next change available in ~{cd.daysRemaining} day(s).
                                    </div>
                                )}
                                <button
                                    onClick={handleUpdateUsername}
                                    disabled={usernameSaving || !computeUsernameCooldown().allowed}
                                    style={{
                                        ...secondaryBtnStyle,
                                        width: '100%',
                                        justifyContent: 'center',
                                        opacity: (usernameSaving || !computeUsernameCooldown().allowed) ? 0.6 : 1
                                    }}
                                >
                                    {usernameSaving ? 'Updating…' : 'Update Username'}
                                </button>
                            </div>
                        );
                    })()}

                    {/* Gender */}
                    <div style={{ marginBottom: '0px' }}>
                        <label style={labelStyle}>Gender (optional)</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="unspecified">Prefer not to say</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="nonbinary">Non-binary</option>
                        </select>
                    </div>
                </div>

                {/* PREMIUM STATUS CARD — hidden when PostHog flag 'show-premium-features' is off */}
                {showPremiumCard && <div style={cardStyle}>
                    <h2 style={sectionTitle}><Crown size={20} /> Premium</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-main)', fontSize: '14px' }}>Current Plan</span>
                            <span style={{
                                background: status.is_premium ? 'rgba(255, 190, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                                color: status.is_premium ? 'var(--neon-gold)' : 'var(--text-muted)',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontFamily: 'var(--font-mono)',
                                border: status.is_premium ? '1px solid rgba(255, 190, 11, 0.4)' : '1px solid var(--border-subtle)'
                            }}>
                                {status.is_premium ? 'PREMIUM' : 'FREE'}
                            </span>
                        </div>
                        {!status.is_premium && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                Premium is in test mode. Join the waitlist to unlock when access opens.
                            </div>
                        )}
                        {!status.is_premium && (
                            <button
                                onClick={() => openGate('general_upgrade', 'settings')}
                                style={{
                                    ...primaryBtnStyle,
                                    background: 'var(--neon-gold)',
                                    color: '#000'
                                }}
                            >
                                Join Premium Waitlist
                            </button>
                        )}
                        {status.waitlist_status === 'pending' && !status.is_premium && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                color: 'var(--neon-gold)', fontSize: '12px',
                                fontFamily: 'var(--font-mono)'
                            }}>
                                <Lock size={14} /> Waitlist status: Pending
                            </div>
                        )}
                    </div>
                </div>}

                {/* PREFERENCES CARD */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Wallet size={20} /> Learning Preferences</h2>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={labelStyle}>Budget Type</label>
                        <select
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="FREE">Free Resources Only</option>
                            <option value="PAID">Can Purchase Courses</option>
                        </select>
                    </div>
                </div>

                {/* THEME CARD */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Palette size={20} /> Appearance</h2>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={labelStyle}>Theme</label>
                        <select
                            value={selectedTheme}
                            onChange={handleThemeChange}
                            style={selectStyle}
                        >
                            <option value="standard-dark">Standard Dark</option>
                            <option value="standard-light">Standard Light</option>
                        </select>
                    </div>
                </div>

                {/* PRIVACY & NOTIFICATIONS CARD */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Shield size={20} /> Privacy & Notifications</h2>

                    <div style={toggleContainer}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <div style={toggleLabel}>Profile Visibility</div>
                                <div style={toggleDescription}>Control who can view your profile inside the app</div>
                            </div>
                            <select
                                value={profileVisibility}
                                onChange={(e) => setProfileVisibility(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="public">Public</option>
                                <option value="community">Community-only</option>
                                <option value="private">Private</option>
                            </select>
                        </div>

                        <div style={toggleRow}>
                            <div>
                                <div style={toggleLabel}>Search Engine Indexing</div>
                                <div style={toggleDescription}>Allow indexing when your profile is Public</div>
                            </div>
                            <label style={switchStyle}>
                                <input
                                    type="checkbox"
                                    checked={allowIndexing}
                                    onChange={(e) => setAllowIndexing(e.target.checked)}
                                    style={{ display: 'none' }}
                                />
                                <span style={allowIndexing ? switchSliderActive : switchSlider}></span>
                            </label>
                        </div>

                        <div style={{
                            paddingTop: '10px',
                            borderTop: '1px solid var(--border-subtle)'
                        }}>
                            <div style={toggleLabel}>Activity Visibility</div>
                            <div style={{ ...toggleDescription, marginBottom: '12px' }}>Show/hide sections on your profile</div>

                            {[
                                ['show_contribution_graph', 'Contribution Graph'],
                                ['show_activity_feed', 'Activity Feed'],
                                ['show_achievements', 'Achievements'],
                                ['show_skills', 'Skills'],
                                ['show_projects', 'Projects'],
                            ].map(([key, label]) => (
                                <div key={key} style={{ ...toggleRow, marginBottom: '12px' }}>
                                    <div style={{ color: 'var(--text-main)', fontSize: '14px' }}>{label}</div>
                                    <label style={switchStyle}>
                                        <input
                                            type="checkbox"
                                            checked={!!activityVisibility[key]}
                                            onChange={(e) => setActivityVisibility(prev => ({ ...prev, [key]: e.target.checked }))}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={activityVisibility[key] ? switchSliderActive : switchSlider}></span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div style={toggleRow}>
                            <div>
                                <div style={toggleLabel}>Email Notifications</div>
                                <div style={toggleDescription}>Receive updates about your progress</div>
                            </div>
                            <label style={switchStyle}>
                                <input
                                    type="checkbox"
                                    checked={emailNotifications}
                                    onChange={(e) => setEmailNotifications(e.target.checked)}
                                    style={{ display: 'none' }}
                                />
                                <span style={emailNotifications ? switchSliderActive : switchSlider}></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* SAVE BUTTON */}
                <button
                    onClick={handleUpdateSettings}
                    disabled={loading}
                    style={{
                        ...primaryBtnStyle,
                        position: isMobile ? 'sticky' : 'static',
                        bottom: isMobile ? '80px' : 'auto',
                        zIndex: isMobile ? 10 : 'auto',
                        minHeight: isMobile ? '56px' : 'auto'
                    }}
                >
                    <Save size={16} /> {loading ? 'Saving...' : 'Save All Settings'}
                </button>

                {/* ACCOUNT ACTIONS CARD */}
                <div style={{ ...cardStyle, marginTop: '40px', borderTop: '2px solid var(--border-subtle)' }}>
                    <h2 style={sectionTitle}><Activity size={20} /> Account Actions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button onClick={handleActivityLog} style={secondaryBtnStyle}>
                            <Activity size={16} /> View Activity Log
                        </button>
                        <button onClick={handleExportData} style={secondaryBtnStyle}>
                            <Download size={16} /> Export Account Data
                        </button>
                        <button onClick={handleLogout} style={secondaryBtnStyle}>
                            <LogOut size={16} /> Log Out
                        </button>
                        <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '10px 0' }}></div>
                        <button onClick={handleDeleteAccount} style={{ ...dangerBtnStyle, width: '100%', justifyContent: 'center' }}>
                            <Trash2 size={16} style={{ marginRight: '8px' }} /> Delete Account
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- STYLES ---
const pageStyle = {
    minHeight: '100vh',
    background: 'var(--bg-dark)',
    padding: '40px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
};

const containerStyle = { maxWidth: '700px', margin: '0 auto' };

const headerStyle = {
    color: 'var(--text-header)',
    marginBottom: '30px',
    fontSize: '32px',
    fontWeight: '600'
};

const cardStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '20px'
};

const sectionTitle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-header)',
    fontSize: '18px',
    marginTop: 0,
    marginBottom: '20px',
    fontWeight: '600'
};

const labelStyle = {
    display: 'block',
    color: 'var(--text-main)',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500'
};

const selectStyle = {
    width: '100%',
    background: 'var(--bg-dark)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-main)',
    padding: '14px 16px', // Larger for mobile
    borderRadius: '6px',
    outline: 'none',
    fontSize: '16px', // Prevent zoom on iOS
    minHeight: '48px' // Touch target
};

const toggleContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
};

const toggleRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const toggleLabel = {
    color: 'var(--text-main)',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px'
};

const toggleDescription = {
    color: 'var(--text-muted)',
    fontSize: '13px'
};

const switchStyle = {
    position: 'relative',
    display: 'inline-block',
    width: '44px',
    height: '24px',
    cursor: 'pointer'
};

const switchSlider = {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--border-subtle)',
    transition: '0.3s',
    borderRadius: '24px',
    display: 'block'
};

const switchSliderActive = {
    ...switchSlider,
    backgroundColor: 'var(--neon-cyan)'
};

const primaryBtnStyle = {
    background: 'var(--neon-cyan)',
    color: '#000',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    width: '100%',
    justifyContent: 'center'
};

const secondaryBtnStyle = {
    background: 'var(--bg-dark)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-subtle)',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500'
};

const dangerBtnStyle = {
    background: 'var(--neon-red)',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px'
};

const backBtnStyle = {
    background: 'none',
    color: 'var(--text-muted)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    padding: '8px 0'
};