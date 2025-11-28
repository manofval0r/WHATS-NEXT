import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('access');
        const refreshToken = params.get('refresh');

        if (accessToken && refreshToken) {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            // Redirect to dashboard
            navigate('/dashboard', { replace: true });
        } else {
            // Handle error or redirect to login
            navigate('/auth?error=oauth_failed', { replace: true });
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
