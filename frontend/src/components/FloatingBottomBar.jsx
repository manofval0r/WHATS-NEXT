import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, User, Settings, LogOut } from 'lucide-react';

export default function FloatingBottomBar() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: BookOpen, label: 'Resources', path: '/resources' },
        { icon: Users, label: 'Community', path: '/community' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="floating-bottom-bar">
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
                gap: '8px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '8px 4px',
                                background: active ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                color: active ? 'var(--neon-cyan)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '10px',
                                fontFamily: 'var(--font-code)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    e.currentTarget.style.color = 'var(--text-main)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                }
                            }}
                        >
                            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '8px 4px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'var(--neon-red)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '10px',
                        fontFamily: 'var(--font-code)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(218, 54, 51, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <LogOut size={20} strokeWidth={2} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
