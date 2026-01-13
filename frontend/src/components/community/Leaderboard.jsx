import { useState, useEffect } from 'react';
import api from '../../api';
import { Trophy, Medal, Award, TrendingUp, Zap, Star } from 'lucide-react';

const TIMEFRAMES = ['Weekly', 'Monthly', 'All-Time'];

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState('Weekly');
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/leaderboard/?timeframe=${timeframe.toLowerCase()}`);
      setLeaders(res.data.leaders || []);
      setUserRank(res.data.user_rank || null);
    } catch (e) {
      console.error(e);
      // Mock data for development
      setLeaders(generateMockLeaders());
    } finally {
      setLoading(false);
    }
  };

  const generateMockLeaders = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      username: `user_${i + 1}`,
      xp: Math.floor(Math.random() * 5000) + 1000,
      modules_completed: Math.floor(Math.random() * 50) + 5,
      streak: Math.floor(Math.random() * 30) + 1
    }));
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={24} color="#ffbe0b" />;
    if (rank === 2) return <Medal size={24} color="#c0c0c0" />;
    if (rank === 3) return <Medal size={24} color="#cd7f32" />;
    return <span style={{ fontSize: '16px', fontFamily: 'JetBrains Mono', color: '#484f58' }}>#{rank}</span>;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '4px', height: '32px', background: 'var(--neon-cyan)', boxShadow: '0 0 10px var(--neon-cyan)' }}></div>
          <h1 style={styles.title}>LEADERBOARD</h1>
        </div>
        <p style={styles.subtitle}>Top performers in the neural network</p>
      </div>

      {/* Timeframe Selector */}
      <div style={styles.timeframeContainer}>
        {TIMEFRAMES.map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            style={{
              ...styles.timeframeButton,
              background: timeframe === tf ? 'rgba(0, 242, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: timeframe === tf ? 'var(--neon-cyan)' : '#8b949e',
              border: timeframe === tf ? '1px solid var(--neon-cyan)' : '1px solid transparent',
              boxShadow: timeframe === tf ? '0 0 15px rgba(0, 242, 255, 0.2)' : 'none'
            }}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* User's Current Rank (if available) */}
      {userRank && (
        <div style={styles.userRankCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={styles.userRankBadge}>
              <TrendingUp size={20} color="var(--neon-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>YOUR RANK</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--neon-cyan)', fontFamily: 'JetBrains Mono' }}>
                #{userRank.rank}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>TOTAL XP</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', fontFamily: 'JetBrains Mono' }}>
              {userRank.xp?.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <div style={styles.loading}>
          <span className="blink">{'>'}</span> LOADING_RANKINGS...
        </div>
      ) : (
        <div style={styles.listContainer}>
          {leaders.map((leader, idx) => (
            <div
              key={idx}
              style={{
                ...styles.leaderCard,
                background: leader.rank <= 3 ? 'rgba(0, 242, 255, 0.05)' : 'rgba(22, 27, 34, 0.6)',
                borderColor: leader.rank === 1 ? '#ffbe0b' : leader.rank === 2 ? '#c0c0c0' : leader.rank === 3 ? '#cd7f32' : '#30363d'
              }}
            >
              {/* Rank Icon */}
              <div style={styles.rankIcon}>
                {getRankIcon(leader.rank)}
              </div>

              {/* User Info */}
              <div style={{ flex: 1 }}>
                <div style={styles.username}>{leader.username}</div>
                <div style={styles.stats}>
                  <span><Zap size={14} /> {leader.modules_completed} modules</span>
                  <span>•</span>
                  <span><Star size={14} /> {leader.streak} day streak</span>
                </div>
              </div>

              {/* XP */}
              <div style={styles.xpBadge}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>
                  {leader.xp?.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#8b949e' }}>XP</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blink Animation */}
      <style>{`
        .blink { animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#05070a',
    padding: '24px',
    fontFamily: 'Inter, sans-serif',
    paddingBottom: '100px'
  },
  header: {
    maxWidth: '900px',
    margin: '0 auto 32px'
  },
  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'JetBrains Mono',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: '#8b949e',
    fontFamily: 'JetBrains Mono'
  },
  timeframeContainer: {
    display: 'flex',
    gap: '12px',
    maxWidth: '900px',
    margin: '0 auto 24px',
    justifyContent: 'center'
  },
  timeframeButton: {
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'JetBrains Mono'
  },
  userRankCard: {
    maxWidth: '900px',
    margin: '0 auto 24px',
    background: 'rgba(0, 242, 255, 0.1)',
    border: '1px solid var(--neon-cyan)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 0 20px rgba(0, 242, 255, 0.1)'
  },
  userRankBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    background: 'rgba(0, 242, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#8b949e',
    fontFamily: 'JetBrains Mono',
    fontSize: '14px'
  },
  listContainer: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  leaderCard: {
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  rankIcon: {
    width: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  username: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '6px'
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#8b949e'
  },
  xpBadge: {
    textAlign: 'right',
    color: 'var(--neon-cyan)'
  }
};
