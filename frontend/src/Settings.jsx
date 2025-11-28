import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Wallet, LogOut, Trash2, Download, Activity, Palette, Shield, Bell } from 'lucide-react';
import { initTheme, applyTheme } from './theme';

export default function Settings() {
    const [budget, setBudget] = useState('FREE');
    const [loading, setLoading] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('dark-not-boring');
    const [isPublic, setIsPublic] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        initTheme();
        const saved = localStorage.getItem('selectedTheme') || 'dark-not-boring';
        setSelectedTheme(saved);
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/api/settings/');
            setBudget(res.data.budget_preference || 'FREE');
            setIsPublic(res.data.is_public !== undefined ? res.data.is_public : true);
            setEmailNotifications(res.data.email_notifications !== undefined ? res.data.email_notifications : true);
        } catch (e) {
            console.error('Failed to fetch settings');
        }
    };

    const handleUpdateSettings = async () => {
        setLoading(true);
        try {
            await api.post('/api/settings/update/', {
                budget,
                is_public: isPublic,
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
        <div style={pageStyle}>
            <div style={containerStyle}>
                <button onClick={() => navigate('/dashboard')} style={backBtnStyle}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <h1 style={headerStyle}>Settings</h1>

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
                            <option value="github-dark">GitHub Dark</option>
                            <option value="github-light">GitHub Light</option>
                            <option value="monokai-pro">Monokai Pro</option>
                            <option value="dark-not-boring">Dark Not Boring</option>
                        </select>
                    </div>
                </div>

                {/* PRIVACY & NOTIFICATIONS CARD */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Shield size={20} /> Privacy & Notifications</h2>

                    <div style={toggleContainer}>
                        <div style={toggleRow}>
                            <div>
                                <div style={toggleLabel}>Public Profile</div>
                                <div style={toggleDescription}>Allow others to view your profile and progress</div>
                            </div>
                            <label style={switchStyle}>
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    style={{ display: 'none' }}
                                />
                                <span style={isPublic ? switchSliderActive : switchSlider}></span>
                            </label>
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
                    style={primaryBtnStyle}
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
    padding: '10px 12px',
    borderRadius: '6px',
    outline: 'none',
    fontSize: '14px'
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