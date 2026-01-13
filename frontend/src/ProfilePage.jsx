import React, { useState, useEffect } from 'react';
import api from './api';
import { User, MapPin, Link as LinkIcon, Calendar, Github, Twitter, Award, Zap, GitCommit, CheckCircle, Clock } from 'lucide-react';
import './Profile.css';
// import Navbar from './components/common/Navbar'; // Component to be created later

export default function ProfilePage() {
  const [heatmapData, setHeatmapData] = useState(Array.from({ length: 52 }, () => Array(7).fill(0)));
  const [profileData, setProfileData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, activityRes] = await Promise.all([
          api.get('/api/profile/'),
          api.get('/api/profile/activity/')
        ]);
        setProfileData(profileRes.data);
        
        const acts = activityRes.data;
        setActivities(acts);

        // Process Heatmap Data based on real activities
        const activityMap = {};
        acts.forEach(item => {
            const d = new Date(item.date).toDateString();
            activityMap[d] = (activityMap[d] || 0) + 1;
        });

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (52 * 7));
        // Align to previous Sunday to ensure grid rows match days correctly
        startDate.setDate(startDate.getDate() - startDate.getDay());

        const newHeatmap = [];
        let current = new Date(startDate);

        for (let w = 0; w < 52; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const dateStr = current.toDateString();
                const count = activityMap[dateStr] || 0;
                let level = 0;
                if (count >= 1) level = 1;
                if (count >= 3) level = 2;
                if (count >= 5) level = 3;
                if (count >= 8) level = 4;
                week.push(level);
                current.setDate(current.getDate() + 1);
            }
            newHeatmap.push(week);
        }
        setHeatmapData(newHeatmap);

      } catch (error) {
        console.error("Failed to load profile data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="profile-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>LOADING_PROFILE...</div>
      </div>
    );
  }

  const { profile, stats, projects } = profileData || { profile: {}, stats: {}, projects: [] };

  // Derive skills from project tags
  const derivedSkills = projects?.flatMap(p => p.tags || [])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 10)
    .map(tag => ({ name: tag, icon: '🔹' })) || [];

  // Fallback if no skills yet
  const displaySkills = derivedSkills.length > 0 ? derivedSkills : [{ name: "No Skills Verified Yet", icon: "⚠️" }];

  return (
    <div className="profile-container">
        {/* Placeholder Navbar until properly integrated */}
        <div style={{ position: 'absolute', top: 20, left: 20, color: 'white' }}>
            <a href="/dashboard" style={{ color: '#8b949e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                ← Back to Dashboard
            </a>
        </div>

        <div className="profile-wrapper">
            
            {/* 1. Header Card */}
            <div className="profile-header-card">
                <div className="profile-avatar-wrapper">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'User'}`} 
                      alt="Avatar" 
                      className="profile-avatar" 
                    />
                    <div className="avatar-badge"></div>
                </div>
                
                <div className="profile-info">
                    <div className="profile-name-row">
                        <h1 className="profile-name">{profile?.username || 'Anonymous'}</h1>
                        <span className="profile-tag">{profile?.target_career || 'Developer'}</span>
                    </div>
                    
                    <p className="profile-bio">
                        {profile?.bio || `Building the future, one commit at a time. Currently focused on ${profile?.target_career || 'tech'}.`}
                    </p>
                    
                    <div className="profile-stats-row">
                        <div className="p-stat">
                            <span className="p-stat-val">{stats?.completed || 0}</span>
                            <span className="p-stat-label">Modules</span>
                        </div>
                        <div className="p-stat">
                            <span className="p-stat-val">{stats?.xp || 0}</span>
                            <span className="p-stat-label">XP Earned</span>
                        </div>
                        <div className="p-stat">
                            <span className="p-stat-val">{stats?.streak || 0}</span>
                            <span className="p-stat-label">Streak</span>
                        </div>
                        <div className="p-stat">
                            <span className="p-stat-val">{profile?.market_label || 'N/A'}</span>
                            <span className="p-stat-label">Rank</span>
                        </div>
                    </div>
                </div>

                <div className="profile-actions">
                     {/* Social Links or Edit Profile could go here */}
                </div>
            </div>

            {/* 2. Contribution Graph */}
            <div className="contribution-section">
                <div className="section-header">
                    <h2 className="section-title"><GitCommit size={20} className="text-neon-cyan" /> Contribution Graph</h2>
                    <div className="heatmap-legend">
                        <span>Less</span>
                        <div className="heatmap-cell level-0"></div>
                        <div className="heatmap-cell level-1"></div>
                        <div className="heatmap-cell level-2"></div>
                        <div className="heatmap-cell level-3"></div>
                        <div className="heatmap-cell level-4"></div>
                        <span>More</span>
                    </div>
                </div>
                
                <div className="heatmap-container">
                    {heatmapData.map((week, wIndex) => (
                        <div key={wIndex} className="heatmap-col">
                            {week.map((level, dIndex) => (
                                <div 
                                    key={`${wIndex}-${dIndex}`} 
                                    className={`heatmap-cell level-${level}`}
                                    title={`${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dIndex]} - ${level} contributions`}
                                ></div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Main Grid: Skills & Activity */}
            <div className="profile-main-grid">
                
                {/* Skills */}
                <div className="skills-card">
                    <h2 className="section-title" style={{marginBottom: 24}}>
                        <Zap size={20} color="#ffbe0b" /> Skill Matrix
                    </h2>
                    <div className="skills-grid">
                        {displaySkills.map((skill, i) => (
                            <div key={i} className="skill-badge">
                                <span>{skill.icon}</span>
                                <span>{skill.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-card">
                    <h2 className="section-title" style={{marginBottom: 24}}>
                        <Clock size={20} color="#bc13fe" /> Recent Activity
                    </h2>
                    <div className="activity-list">
                        {activities.length > 0 ? activities.slice(0, 5).map((item, i) => (
                            <div key={i} className="activity-item">
                                <div className="activity-icon">
                                    {item.type === 'module_completed' && <CheckCircle size={18} />}
                                    {item.type === 'project_submitted' && <GitCommit size={18} />}
                                    {item.type === 'review_given' && <Zap size={18} />}
                                    {!['module_completed', 'project_submitted', 'review_given'].includes(item.type) && <Award size={18} />}
                                </div>
                                <div className="activity-content">
                                    <h4>{item.title || item.details}</h4>
                                    <span className="activity-time">{new Date(item.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )) : (
                            <div style={{ color: '#8b949e', fontStyle: 'italic' }}>No recent activity detected.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}
