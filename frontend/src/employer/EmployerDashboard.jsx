import React, { useState, useEffect } from 'react';
import { apiClient } from '../api';
import './EmployerDashboard.css';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total_jobs: 0,
    total_applications: 0,
    active_listings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const fetchEmployerData = async () => {
    try {
      setLoading(true);
      // Fetch employer jobs and stats
      const jobsResponse = await apiClient.get('/employer/jobs/');
      const jobsList = Array.isArray(jobsResponse.data) 
        ? jobsResponse.data 
        : jobsResponse.data.results || [];
      
      setJobs(jobsList);
      
      // Calculate stats
      const totalApplications = jobsList.reduce(
        (sum, job) => sum + (job.applications?.length || 0),
        0
      );
      
      setStats({
        total_jobs: jobsList.length,
        total_applications: totalApplications,
        active_listings: jobsList.filter(j => j.is_active).length,
      });
    } catch (error) {
      console.error('Failed to fetch employer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="employer-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading employer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-dashboard">
      <div className="employer-header">
        <div className="header-content">
          <h1>Employer Dashboard</h1>
          <p>Manage job postings and applications</p>
        </div>
        <a href="/employer/post-job" className="btn btn-primary">
          + Post New Job
        </a>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <p className="stat-label">Total Jobs Posted</p>
            <p className="stat-value">{stats.total_jobs}</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <p className="stat-label">Total Applications</p>
            <p className="stat-value">{stats.total_applications}</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <p className="stat-label">Active Listings</p>
            <p className="stat-value">{stats.active_listings}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Job Postings
        </button>
        <button
          className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
      </div>

      {/* Job Listings */}
      {activeTab === 'jobs' && (
        <div className="jobs-section">
          {jobs.length === 0 ? (
            <div className="empty-state">
              <p>No job postings yet. Create one to start receiving applications!</p>
              <a href="/employer/post-job" className="btn btn-secondary">
                Post First Job
              </a>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map(job => (
                <div key={job.id} className="job-card glass-card">
                  <div className="job-header">
                    <div>
                      <h3>{job.title}</h3>
                      <p className="job-level">{job.level}</p>
                    </div>
                    <div className="job-meta">
                      <span className={`badge ${job.is_active ? 'active' : 'inactive'}`}>
                        {job.is_active ? '🟢 Active' : '⚫ Inactive'}
                      </span>
                      {!job.is_approved && (
                        <span className="badge pending">⏳ Pending Approval</span>
                      )}
                    </div>
                  </div>

                  <p className="job-description">{job.description.substring(0, 100)}...</p>

                  <div className="job-details">
                    <span>📍 {job.location}</span>
                    <span>💼 {job.level}</span>
                    {job.salary_range && <span>💰 {job.salary_range}</span>}
                  </div>

                  <div className="job-skills">
                    {job.required_skills && job.required_skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">#{skill}</span>
                    ))}
                  </div>

                  <div className="job-actions">
                    <span className="app-count">
                      👥 {job.applications?.length || 0} applications
                    </span>
                    <div className="action-buttons">
                      <a href={`/employer/job/${job.id}`} className="btn btn-small">
                        View Details
                      </a>
                      <a href={`/employer/applicants/${job.id}`} className="btn btn-small">
                        View Applicants
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications */}
      {activeTab === 'applications' && (
        <div className="applications-section">
          {jobs.flatMap(job => 
            (job.applications || []).map(app => (
              <div key={`${job.id}-${app.id}`} className="application-card glass-card">
                <div className="app-header">
                  <div className="applicant-info">
                    <h4>{app.candidate?.username || 'Unknown'}</h4>
                    <p className="job-title">Applied for: {job.title}</p>
                  </div>
                  <span className={`status-badge status-${app.status}`}>
                    {app.status}
                  </span>
                </div>

                <div className="skill-match">
                  <span className="match-label">Skill Match</span>
                  <div className="match-bar">
                    <div 
                      className="match-fill"
                      style={{ width: `${app.match_score}%` }}
                    ></div>
                  </div>
                  <span className="match-percent">{app.match_score}%</span>
                </div>

                <div className="app-actions">
                  <a href={`/profile/${app.candidate?.username}`} className="btn btn-small">
                    View Profile
                  </a>
                  <button className="btn btn-small">Message</button>
                </div>
              </div>
            ))
          ) || (
            <div className="empty-state">
              <p>No applications yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
