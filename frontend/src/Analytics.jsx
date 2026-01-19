import React, { useState, useEffect } from 'react';
import { apiClient } from './api';
import './Analytics.css';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/analytics/');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-container">
        <div className="error-state">
          <p>Failed to load analytics. Please try again.</p>
        </div>
      </div>
    );
  }

  const { summary, weekly_xp_trend, quiz_stats, community_leaderboard } = analytics;
  const maxXp = Math.max(...weekly_xp_trend.map(d => d.xp), 50);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Your Learning Analytics</h1>
        <p className="subtitle">Track your progress and growth</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <p className="stat-label">Total XP</p>
            <p className="stat-value">{summary.total_xp.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <p className="stat-label">Current Streak</p>
            <p className="stat-value">{summary.current_streak} days</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Modules Completed</p>
            <p className="stat-value">{summary.completed_modules}</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <p className="stat-label">Learning Hours</p>
            <p className="stat-value">{summary.total_hours}</p>
          </div>
        </div>
      </div>

      {/* Weekly XP Chart */}
      <div className="chart-section glass-card">
        <h2>Weekly Activity</h2>
        <div className="bar-chart">
          {weekly_xp_trend.map((data, idx) => {
            const height = maxXp > 0 ? (data.xp / maxXp) * 100 : 0;
            const date = new Date(data.date);
            const dayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
            
            return (
              <div key={idx} className="bar-item">
                <div className="bar-container">
                  <div
                    className="bar"
                    style={{ height: `${height}%` }}
                    title={`${data.xp} XP`}
                  ></div>
                </div>
                <p className="bar-label">{dayLabel}</p>
                <p className="bar-value">{data.xp}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz Stats */}
      <div className="stats-grid">
        <div className="quiz-stat glass-card">
          <h3>Quiz Performance</h3>
          <div className="quiz-stat-row">
            <span className="quiz-stat-label">Average Score</span>
            <span className="quiz-stat-value">
              {quiz_stats.average_score ? `${Math.round(quiz_stats.average_score)}%` : 'No attempts'}
            </span>
          </div>
          <div className="quiz-stat-row">
            <span className="quiz-stat-label">Total Attempts</span>
            <span className="quiz-stat-value">{quiz_stats.total_attempts}</span>
          </div>
        </div>

        <div className="recent-activity glass-card">
          <h3>Recent Projects</h3>
          <div className="recent-list">
            {analytics.recent_projects && analytics.recent_projects.length > 0 ? (
              analytics.recent_projects.map((project, idx) => (
                <div key={idx} className="recent-item">
                  <span className="project-label">{project.label}</span>
                  <a href={project.submission_link} target="_blank" rel="noopener noreferrer" className="project-link">
                    View →
                  </a>
                </div>
              ))
            ) : (
              <p className="no-data">No projects submitted yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '20px' }}>
        <h3>Community XP Leaderboard</h3>
        <div className="recent-list">
          {community_leaderboard && community_leaderboard.length > 0 ? (
            community_leaderboard.map((leader, idx) => (
              <div key={leader.username} className="recent-item" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{idx + 1}.</strong> {leader.username}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#b3c0cc' }}>
                  <span>{leader.xp} XP</span>
                  <span>• {leader.posts} posts</span>
                  <span>• {leader.replies} replies</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No leaderboard data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
