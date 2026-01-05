import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from './api';

export default function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('access');
        const refreshToken = params.get('refresh');
        const error = params.get('error');

        if (accessToken && refreshToken) {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);

            // Use the token immediately to verify session and check onboarding status
            api.get('/api/profile/')
                .then(response => {
                    const data = response.data;
                    const profile = data.profile || data; // Handle potential structure variations

                    // Store username for UI consistency
                    if (profile.username) {
                        localStorage.setItem('username', profile.username);
                    }

                    // If user hasn't set a target career, send to onboarding
                    if (!profile.target_career) {
                        navigate('/onboarding', { replace: true });
                    } else {
                        navigate('/dashboard', { replace: true });
                    }
                })
                .catch(err => {
                    console.error('Token verification failed:', err);
                    navigate('/auth?error=token_verification_failed', { replace: true });
                });
        } else {
            // Handle error or redirect to login
            navigate(`/auth?error=${error || 'oauth_failed'}`, { replace: true });
        }
    }, [location, navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#0a0a0a',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                <p>Completing authentication...</p>
            </div>
            <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
