import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api';
import './PostJob.css';

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: [],
    level: 'entry',
    location: 'Remote',
    salary_range: '',
  });
  const [skillInput, setSkillInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.required_skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // This would be a new endpoint to create a job posting
      // For now, we'll assume it works similar to a PATCH/POST
      const response = await apiClient.post('/employer/jobs/create/', formData);
      
      navigate('/employer/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post job. Please try again.');
      console.error('Error posting job:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <div className="post-job-header">
        <h1>Post a New Job</h1>
        <p>Find talented learners to join your team</p>
      </div>

      <form onSubmit={handleSubmit} className="job-form glass-card">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Job Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Junior Frontend Developer"
            className="form-input"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="level">Experience Level *</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="intern">Internship</option>
              <option value="entry">Entry-Level</option>
              <option value="junior">Junior</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Remote, New York, etc."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="salary_range">Salary Range (Optional)</label>
            <input
              type="text"
              id="salary_range"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleInputChange}
              placeholder="$50k - $80k"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Job Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            className="form-textarea"
            rows="8"
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="skillInput">Required Skills</label>
          <div className="skill-input-group">
            <input
              type="text"
              id="skillInput"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g., React, JavaScript, CSS"
              className="form-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(e);
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="btn btn-add-skill"
            >
              Add Skill
            </button>
          </div>

          {formData.required_skills.length > 0 && (
            <div className="skills-list">
              {formData.required_skills.map((skill, idx) => (
                <div key={idx} className="skill-badge">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="remove-skill"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/employer/dashboard')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
