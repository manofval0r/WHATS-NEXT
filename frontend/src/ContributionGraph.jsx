import { useState, useEffect } from 'react';
import api from './api';

export default function ContributionGraph() {
  const [activity, setActivity] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get('/api/profile/activity/');
        setActivity(res.data);
      } catch (err) {
        console.error("Failed to load activity", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  // Generate last 365 days
  const days = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const getColor = (count) => {
    if (!count) return 'rgba(255,255,255,0.05)';
    if (count === 1) return 'rgba(0, 242, 255, 0.3)';
    if (count === 2) return 'rgba(0, 242, 255, 0.5)';
    if (count === 3) return 'rgba(0, 242, 255, 0.7)';
    return 'var(--neon-cyan)';
  };

  if (loading) return <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Activity...</div>;

  return (
    <div style={{
      background: 'rgba(22, 27, 34, 0.6)', border: '1px solid var(--border-subtle)',
      borderRadius: '16px', padding: '20px', marginBottom: '30px',
      overflowX: 'auto'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--text-header)', fontFamily: 'JetBrains Mono' }}>
        CONTRIBUTION_LOG (LAST 365 DAYS)
      </h3>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '100%' }}>
        {days.map(date => (
          <div
            key={date}
            title={`${date}: ${activity[date] || 0} contributions`}
            style={{
              width: '10px', height: '10px', borderRadius: '2px',
              background: getColor(activity[date]),
              transition: 'all 0.2s'
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', fontSize: '10px', color: 'var(--text-muted)', justifyContent: 'flex-end' }}>
        <span>Less</span>
        <div style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}></div>
        <div style={{ width: '10px', height: '10px', background: 'rgba(0, 242, 255, 0.3)', borderRadius: '2px' }}></div>
        <div style={{ width: '10px', height: '10px', background: 'rgba(0, 242, 255, 0.7)', borderRadius: '2px' }}></div>
        <div style={{ width: '10px', height: '10px', background: 'var(--neon-cyan)', borderRadius: '2px' }}></div>
        <span>More</span>
      </div>
    </div>
  );
}
