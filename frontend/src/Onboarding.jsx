import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function Onboarding() {
    const [niche, setNiche] = useState('');
    const [universityCourse, setUniversityCourse] = useState('');
    const [budget, setBudget] = useState('FREE');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('GENERATING_ROADMAP...');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!niche.trim()) {
            setError('Career path is required');
            return;
        }

        setLoading(true);
        setError('');
        setLoadingMessage('GENERATING_ROADMAP...');

        try {
            await api.post('/api/complete-onboarding/', {
                niche: niche.trim(),
                university_course: universityCourse.trim(),
                budget
            });

            // Show success message before redirect
            setLoadingMessage('ROADMAP_CREATED! Loading dashboard...');
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Redirect to dashboard after successful onboarding
            navigate('/dashboard');
        } catch (err) {
            console.error('Onboarding error:', err);
            setError(err.response?.data?.error || 'Failed to complete onboarding. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '500px',
                background: 'rgba(22, 27, 34, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 242, 255, 0.2)',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontFamily: 'JetBrains Mono',
                        color: 'var(--neon-cyan)',
                        margin: '0 0 10px 0',
                        textShadow: '0 0 10px rgba(0, 242, 255, 0.5)'
                    }}>
                        COMPLETE_PROFILE
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        margin: 0
                    }}>
                        Tell us about your goals to generate your personalized roadmap
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Career Path */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono',
                            color: 'var(--neon-cyan)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Career Path <span style={{ color: '#ff4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            placeholder="e.g., Full Stack Developer, Data Scientist"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(0, 242, 255, 0.3)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                fontFamily: 'Inter',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--neon-cyan)';
                                e.target.style.boxShadow = '0 0 10px rgba(0, 242, 255, 0.3)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(0, 242, 255, 0.3)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* University Course (Optional) */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono',
                            color: 'var(--neon-cyan)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            University Course <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(Optional)</span>
                        </label>
                        <input
                            type="text"
                            value={universityCourse}
                            onChange={(e) => setUniversityCourse(e.target.value)}
                            placeholder="e.g., Computer Science, Self-taught"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(0, 242, 255, 0.3)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                fontFamily: 'Inter',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--neon-cyan)';
                                e.target.style.boxShadow = '0 0 10px rgba(0, 242, 255, 0.3)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(0, 242, 255, 0.3)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* Budget Preference */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono',
                            color: 'var(--neon-cyan)',
                            marginBottom: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Resource Preference
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['FREE', 'PAID'].map((option) => (
                                <label key={option} style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: budget === option ? 'rgba(0, 242, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                                    border: budget === option ? '1px solid var(--neon-cyan)' : '1px solid rgba(0, 242, 255, 0.3)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    fontFamily: 'JetBrains Mono',
                                    color: budget === option ? 'var(--neon-cyan)' : 'var(--text-main)',
                                    transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="radio"
                                        name="budget"
                                        value={option}
                                        checked={budget === option}
                                        onChange={(e) => setBudget(e.target.value)}
                                        style={{ display: 'none' }}
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '12px',
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#ff4444',
                            fontSize: '14px',
                            fontFamily: 'Inter'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading ? 'rgba(0, 242, 255, 0.3)' : 'linear-gradient(90deg, var(--neon-cyan), var(--electric-purple))',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#000',
                            fontSize: '14px',
                            fontFamily: 'JetBrains Mono',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            transition: 'all 0.2s',
                            boxShadow: loading ? 'none' : '0 4px 15px rgba(0, 242, 255, 0.4)'
                        }}
                    >
                        {loading ? loadingMessage : 'START_JOURNEY'}
                    </button>
                </form>
            </div>
        </div>
    );
}
