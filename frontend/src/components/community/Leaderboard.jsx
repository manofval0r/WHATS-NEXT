import { useState, useEffect } from 'react';
import api from '../../api';
import { Trophy, Medal, TrendingUp, MessageSquare, MessageCircle } from 'lucide-react';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    // The timeframe selector was removed: the backend has always served a
    // single all-time board, so offering Weekly/Monthly implied a
    // granularity that did not exist.
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      // The route is /api/community/leaderboard/. This requested
      // /api/leaderboard/, which is not in the URL conf, so every load 404'd
      // and fell through to the mock generator below -- which rendered ten
      // randomly generated accounts with random XP as if they were real
      // community members.
      const res = await api.get('/api/community/leaderboard/');
      setLeaders(res.data.leaders || []);
      setUserRank(res.data.user_rank ?? null);
    } catch (e) {
      // Show the failure. Inventing plausible-looking users here would be the
      // worst possible bug on a portfolio piece: a reviewer sees a full
      // leaderboard of strangers and concludes the product has users.
      setLeaders([]);
      setError(
        e?.response?.status === 404
          ? 'The leaderboard endpoint is not available.'
          : 'Could not load the leaderboard. Check your connection and retry.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={24} color="#e0a33c" />;
    if (rank === 2) return <Medal size={24} color="#a8aeb8" />;
    if (rank === 3) return <Medal size={24} color="#b0764a" />;
    return <span style={{ fontSize: '16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#{rank}</span>;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '3px', height: '28px', background: 'var(--accent)' }} />
          <h1 style={styles.title}>Community leaderboard</h1>
        </div>
        <p style={styles.subtitle}>
          All-time community XP — earned by posting, replying and reviewing.
        </p>
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
        <div style={styles.loading}>Loading rankings...</div>
      ) : error ? (
        <div style={styles.loading} role="alert">{error}</div>
      ) : leaders.length === 0 ? (
        /* An honest empty state. The previous version filled this space with
           ten invented users, which reads as a populated product. */
        <div style={styles.loading}>
          <div style={{ marginBottom: 8, color: 'var(--text-secondary)' }}>
            Nobody has earned community XP yet.
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Post a question or reply to someone else to appear here.
          </div>
        </div>
      ) : (
        <div style={styles.listContainer}>
          {leaders.map((leader, idx) => (
            <div
              key={leader.username ?? idx}
              style={{
                ...styles.leaderCard,
                borderColor:
                  leader.rank === 1 ? 'var(--warning)'
                  : leader.rank === 2 ? 'var(--border-strong)'
                  : leader.rank === 3 ? 'var(--border-strong)'
                  : 'var(--border-subtle)'
              }}
            >
              {/* Rank Icon */}
              <div style={styles.rankIcon}>
                {getRankIcon(leader.rank)}
              </div>

              {/* User Info. The backend returns username, xp, posts and
                  replies — it never returned modules_completed or streak,
                  so those two pills always rendered as "undefined modules"
                  and "undefined day streak". */}
              <div style={{ flex: 1 }}>
                <div style={styles.username}>{leader.username}</div>
                <div style={styles.stats}>
                  <span><MessageSquare size={14} /> {leader.posts ?? 0} posts</span>
                  <span>•</span>
                  <span><MessageCircle size={14} /> {leader.replies ?? 0} replies</span>
                </div>
              </div>

              {/* XP */}
              <div style={styles.xpBadge}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                  {leader.xp?.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>XP</div>
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
