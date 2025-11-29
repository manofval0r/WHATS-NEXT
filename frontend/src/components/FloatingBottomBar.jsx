import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, User } from 'lucide-react';

export default function FloatingBottomBar() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: BookOpen, label: 'Roadmap', path: '/resources' },
        { icon: Users, label: 'Community', path: '/community' },
        { icon: User, label: 'Profile', path: '/profile' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(19, 16, 34, 0.8)',
            backdropFilter: 'blur(10px)',
            paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '12px 8px 16px 8px',
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
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                color: active ? '#3713ec' : 'rgba(255, 255, 255, 0.6)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '11px',
                                fontWeight: active ? '600' : '500',
                                minWidth: '60px'
                            }}
                        >
                            <Icon
                                size={24}
                                strokeWidth={active ? 2.5 : 2}
                                fill={active ? '#3713ec' : 'none'}
                            />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
