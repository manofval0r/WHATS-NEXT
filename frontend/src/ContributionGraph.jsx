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

  // Generate last 100 days (10x10 grid approximately)
  const days = [];
  const today = new Date();
  for (let i = 99; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const getColor = (count) => {
    if (!count) return '#161b22'; // Empty day (Tech dark)
    if (count === 1) return '#0e4429'; // Low
    if (count === 2) return '#006d32'; // Med
    if (count === 3) return '#26a641'; // High
    return '#39d353'; // Max (GitHub green standard)
  };

  if (loading) return <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>LOADING_LOG...</div>;

  return (
    <div style={{
      background: '#0d1117', border: '1px solid #30363d',
      borderRadius: '6px', padding: '20px', marginBottom: '30px',
      overflowX: 'auto'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#c9d1d9', fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>
        CONTRIBUTION_LOG (LAST 100 DAYS)
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(20, 1fr)', // 5 rows of 20 = 100 days, or just wrap
        gap: '4px',
        maxWidth: '100%'
      }}>
        {days.map(date => (
          <div
            key={date}
            title={`${date}: ${activity[date] || 0} contributions`}
            style={{
              width: '100%',
              aspectRatio: '1/1', // Square
              borderRadius: '2px',
              background: getColor(activity[date]),
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.1s'
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', fontSize: '10px', color: '#8b949e', justifyContent: 'flex-end', fontFamily: 'JetBrains Mono' }}>
        <span>OFFLINE</span>
        <div style={{ width: '10px', height: '10px', background: '#161b22', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
        <div style={{ width: '10px', height: '10px', background: '#0e4429', borderRadius: '2px' }}></div>
        <div style={{ width: '10px', height: '10px', background: '#26a641', borderRadius: '2px' }}></div>
        <div style={{ width: '10px', height: '10px', background: '#39d353', borderRadius: '2px' }}></div>
        <span>ACTIVE</span>
      </div>
    </div>
  );
}
