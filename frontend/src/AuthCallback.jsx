import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { jadaClaimGuest } from './api';
import { getGuestSessionId, clearGuestSessionId } from './jada/guestSession';
import { usePostHogApp } from './PostHogProvider';
import { toast } from './toast';

export default function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { identify, capture } = usePostHogApp();

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
                    const profile = data.profile || data;

                    if (profile.username) {
                        localStorage.setItem('username', profile.username);
                    }

                    // PostHog: identify + capture OAuth signup
                    identify(profile.id || profile.username, {
                        username: profile.username,
                        email: profile.email || '',
                        plan_tier: profile.plan_tier || 'FREE',
                        target_career: profile.target_career || '',
                    });
                    capture('user_signed_up', { method: 'oauth' });

                    // Claim any guest JADA conversations
                    const guestSid = getGuestSessionId();
                    if (guestSid) {
                        jadaClaimGuest(guestSid).catch(() => {});
                        clearGuestSessionId();
                    }

                    toast.success('Signed in successfully!');

                    // Always send to onboarding — the wizard has a skip-guard
                    // that will redirect to /dashboard if user already has a career
                    navigate('/onboarding', { replace: true });
                })
                .catch(err => {
                    console.error('Token verification failed:', err);
                    navigate('/auth?error=token_verification_failed', { replace: true });
                });
        } else {
            // Handle error or redirect to login
            navigate(`/auth?error=${error || 'oauth_failed'}`, { replace: true });
        }
    }, [location, navigate, identify, capture]);

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
