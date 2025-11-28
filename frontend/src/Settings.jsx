import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Save, AlertTriangle, Wallet, LogOut, Trash2, Download, Activity, Palette } from 'lucide-react';
import { initTheme, applyTheme } from './theme';

export default function Settings() {
    const [pivotCareer, setPivotCareer] = useState('');
    const [budget, setBudget] = useState('FREE');
    const [loading, setLoading] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('dark-not-boring');
    const navigate = useNavigate();

    useEffect(() => {
        initTheme();
        const saved = localStorage.getItem('selectedTheme') || 'dark-not-boring';
        setSelectedTheme(saved);
    }, []);

    const handleUpdateBudget = async () => {
        const token = localStorage.getItem('access_token');
        try {
            await axios.post('http://127.0.0.1:8000/api/settings/update/', { budget }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Preferences saved!");
        } catch (e) { alert("Error saving settings"); }
    };

    const handlePivot = async () => {
        if (!pivotCareer) return alert("Enter a new career name");
        if (!window.confirm("Are you sure? This will generate a new roadmap. Completed skills will transfer if they match.")) return;

        setLoading(true);
        const token = localStorage.getItem('access_token');
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/pivot-career/', { new_career: pivotCareer }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Success! ${res.data.transferred_skills} skills transferred to your new path.`);
            navigate('/dashboard');
        } catch (e) {
            console.error(e);
            alert("Pivot failed. Server might be busy.");
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
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete('http://127.0.0.1:8000/api/account/delete/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Account deleted.');
            localStorage.removeItem('access_token');
            navigate('/');
        } catch (e) {
            alert('Error deleting account.');
        }
    };

    const handleExportData = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/account/export/', {
                headers: { Authorization: `Bearer ${token}` },
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
                    <ArrowLeft size={18} /> Back to Map
                </button>

                <h1 style={{ color: 'var(--text-header)', marginBottom: '30px', fontFamily: 'var(--font-code)' }}>Account Settings</h1>

                {/* PREFERENCES CARD */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Wallet size={20} color="var(--neon-cyan)" /> Learning Preferences</h2>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={labelStyle}>Budget Type</label>
                        <select
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="FREE">I need Free Resources</option>
                            <option value="PAID">I can buy courses</option>
                        </select>
                    </div>
                    <button onClick={handleUpdateBudget} style={primaryBtnStyle}>
                        <Save size={16} /> Save Preferences
                    </button>
                </div>

                {/* THEME CARD */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Palette size={20} color="var(--neon-cyan)" /> Appearance</h2>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={labelStyle}>Theme</label>
                        <select
                            value={selectedTheme}
                            onChange={handleThemeChange}
                            style={selectStyle}
                        >
                            <option value="github-dark">GitHub Dark</option>
                            <option value="github-light">GitHub Light</option>
                            <option value="dark-not-boring">Dark Not Boring</option>
                            <option value="serious-light">Serious Light</option>
                        </select>
                    </div>
                </div>

                {/* PIVOT CARD (Danger Zone) */}
                <div style={{ ...cardStyle, border: '1px solid var(--neon-red)' }}>
                    <h2 style={{ ...sectionTitle, color: 'var(--neon-red)' }}><RefreshCw size={20} /> Career Pivot</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                        Fed up with your current path? Enter a new goal. <br />
                        <span style={{ color: 'var(--neon-green)', fontSize: '14px' }}>* We will try to keep your completed skills.</span>
                    </p>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            placeholder="New Career (e.g. Data Scientist)"
                            value={pivotCareer}
                            onChange={(e) => setPivotCareer(e.target.value)}
                            style={inputStyle}
                        />
                        <button
                            onClick={handlePivot}
                            disabled={loading}
                            style={dangerBtnStyle}
                        >
                            {loading ? 'Rebuilding...' : 'Switch Career'}
                        </button>
                    </div>
                </div>

                {/* ACCOUNT ACTIONS CARD */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Activity size={20} color="var(--neon-cyan)" /> Account Actions</h2>
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
const pageStyle = { minHeight: '100vh', background: 'var(--bg-dark)', padding: '40px', fontFamily: 'var(--font-body)' };
const containerStyle = { maxWidth: '600px', margin: '0 auto' };
const cardStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '30px', borderRadius: '12px', marginBottom: '30px' };
const sectionTitle = { display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-header)', fontSize: '20px', marginTop: 0, fontFamily: 'var(--font-code)' };
const labelStyle = { display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' };
const inputStyle = { flex: 1, background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '12px', borderRadius: '6px', outline: 'none', fontFamily: 'var(--font-code)' };
const selectStyle = { width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '12px', borderRadius: '6px', outline: 'none', fontFamily: 'var(--font-code)' };

const primaryBtnStyle = { background: 'var(--neon-cyan)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontFamily: 'var(--font-code)' };
const secondaryBtnStyle = { background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-code)' };
const dangerBtnStyle = { background: 'var(--neon-red)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'var(--font-code)', display: 'flex', alignItems: 'center' };
const backBtnStyle = { background: 'none', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontFamily: 'var(--font-code)' };