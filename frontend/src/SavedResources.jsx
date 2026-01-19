import React, { useState, useEffect } from 'react';
import { apiClient } from './api';
import './SavedResources.css';

export default function SavedResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchResources();
  }, [filter, page, searchQuery]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page);

      const response = await apiClient.get(`/resources/saved/?${params}`);
      setResources(response.data.results || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch saved resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    try {
      await apiClient.delete(`/resources/saved/${resourceId}/delete/`);
      setResources(resources.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error('Failed to delete resource:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const resourceIcons = {
    news: '📰',
    video: '📹',
    job: '💼',
    article: '📄',
    documentation: '📚'
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="saved-resources-container">
      <div className="resources-header">
        <h1>Saved Resources</h1>
        <p className="subtitle">Your bookmarked learning materials and opportunities</p>
      </div>

      <div className="resources-controls">
        <input
          type="text"
          placeholder="Search your saved resources..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'news' ? 'active' : ''}`}
            onClick={() => handleFilterChange('news')}
          >
            📰 News
          </button>
          <button
            className={`filter-tab ${filter === 'video' ? 'active' : ''}`}
            onClick={() => handleFilterChange('video')}
          >
            📹 Videos
          </button>
          <button
            className={`filter-tab ${filter === 'job' ? 'active' : ''}`}
            onClick={() => handleFilterChange('job')}
          >
            💼 Jobs
          </button>
          <button
            className={`filter-tab ${filter === 'article' ? 'active' : ''}`}
            onClick={() => handleFilterChange('article')}
          >
            📄 Articles
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔖</div>
          <h2>No saved resources yet</h2>
          <p>Start bookmarking learning materials to see them here!</p>
        </div>
      ) : (
        <>
          <div className="resources-grid">
            {resources.map(resource => (
              <div key={resource.id} className="resource-card glass-card">
                <div className="resource-header-section">
                  <span className="resource-icon">
                    {resourceIcons[resource.type] || '📌'}
                  </span>
                  <span className="resource-type">{resource.type}</span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(resource.id)}
                    title="Delete bookmark"
                  >
                    ×
                  </button>
                </div>

                <h3 className="resource-title">{resource.title}</h3>

                {resource.thumbnail && (
                  <img src={resource.thumbnail} alt={resource.title} className="resource-thumbnail" />
                )}

                {resource.description && (
                  <p className="resource-description">{resource.description}</p>
                )}

                <div className="resource-meta">
                  {resource.source && (
                    <span className="resource-source">📌 {resource.source}</span>
                  )}
                  <span className="resource-date">
                    {new Date(resource.saved_at).toLocaleDateString()}
                  </span>
                </div>

                {resource.tags && resource.tags.length > 0 && (
                  <div className="resource-tags">
                    {resource.tags.map((tag, idx) => (
                      <span key={idx} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}

                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                  Open Resource →
                </a>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="pagination-btn"
              >
                ← Previous
              </button>

              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
