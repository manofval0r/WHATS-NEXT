import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MessageSquare, ThumbsUp, Activity } from 'lucide-react';

export default function ActivityLog() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchActivity();
    }, []);

    const fetchActivity = async () => {
        try {
            const res = await api.get('/api/profile/activity/');
            setActivities(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'module_completed': return <CheckCircle size={18} color="var(--neon-green)" />;
            case 'review_given': return <ThumbsUp size={18} color="var(--neon-cyan)" />;
            case 'comment_added': return <MessageSquare size={18} color="var(--electric-purple)" />;
            default: return <Activity size={18} color="var(--text-muted)" />;
        }
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <button onClick={() => navigate('/settings')} style={backBtnStyle}>
                    <ArrowLeft size={18} /> Back to Settings
                </button>

                <h1 style={{ color: 'var(--text-header)', marginBottom: '30px', fontFamily: 'var(--font-code)' }}>Activity Log</h1>

                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading activity...</div>
                ) : (
                    <div style={listStyle}>
                        {activities.length > 0 ? activities.map((act, i) => (
                            <div key={i} style={itemStyle}>
                                <div style={iconContainerStyle}>
                                    {getIcon(act.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '14px' }}>{act.title}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(act.date).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>{act.details}</p>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No recent activity found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- STYLES ---
const pageStyle = { minHeight: '100vh', background: 'var(--bg-dark)', padding: '40px', fontFamily: 'var(--font-body)' };
const containerStyle = { maxWidth: '600px', margin: '0 auto' };
const backBtnStyle = { background: 'none', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontFamily: 'var(--font-code)' };
const listStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const itemStyle = {
    display: 'flex', gap: '15px', padding: '15px',
    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
    borderRadius: '8px', alignItems: 'start'
};
const iconContainerStyle = {
    padding: '8px', background: 'var(--bg-dark)', borderRadius: '50%',
    border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center'
};
