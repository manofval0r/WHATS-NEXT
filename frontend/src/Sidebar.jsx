import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  User,
  Settings as SettingsIcon,
  Users,
  BookOpen,
  LogOut,
  Pin,
  PinOff,
  Flame,
  Terminal
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from './api';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [streak, setStreak] = useState(0);
  const [userData, setUserData] = useState(null);
  const sidebarRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fetch User Data & Streak
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/api/profile/');
        setUserData(response.data.profile || response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchStreak = async () => {
      try {
        const response = await api.get('/api/profile/streak/');
        setStreak(response.data.streak);
      } catch (error) {
        console.error("Error fetching streak:", error);
      }
    };

    fetchUserData();
    fetchStreak();
    const interval = setInterval(() => {
      fetchUserData();
      fetchStreak();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-collapse logic
  useEffect(() => {
    if (isPinned) return;

    const handleMouseLeave = () => {
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 500); // 0.5 seconds delay
    };

    const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsExpanded(true);
    };

    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener('mouseenter', handleMouseEnter);
      sidebar.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener('mouseenter', handleMouseEnter);
        sidebar.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPinned]);

  const navItems = [
    { icon: <Layout size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <BookOpen size={20} />, label: 'Resources', path: '/resources' },
    { icon: <Users size={20} />, label: 'Community', path: '/community' },
    { icon: <User size={20} />, label: 'Profile', path: '/profile' },
    { icon: <SettingsIcon size={20} />, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <motion.div
      ref={sidebarRef}
      initial={{ width: '60px' }}
      animate={{ width: isExpanded || isPinned ? '240px' : '64px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        height: '100vh',
        background: '#0d1117', // A solid, consistent dark background
        borderRight: '1px solid #21262d', // A more subtle border
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Brand / Toggle Header */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isExpanded || isPinned ? 'space-between' : 'center',
        padding: isExpanded || isPinned ? '0 20px' : '0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <div style={{
                color: 'var(--neon-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '24px'
            }}>
                <Terminal size={24} style={{ paddingLeft: '8px' }} />
            </div>
             <motion.span 
                animate={{ opacity: isExpanded || isPinned ? 1 : 0 }}
                style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 700, 
                    color: '#e6edf3',
                    whiteSpace: 'nowrap'
                }}
             >
                WHATS-NEXT
             </motion.span>
        </div>
        
        {(isExpanded || isPinned) && (
            <button
            onClick={() => setIsPinned(!isPinned)}
            style={{
                background: 'transparent',
                border: 'none',
                color: isPinned ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                padding: '4px'
            }}
            >
            {isPinned ? <Pin size={16} /> : <PinOff size={16} />}
            </button>
        )}
      </div>

      {/* User Short Info */}
      <div style={{
        padding: isExpanded || isPinned ? '5px' : '5px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isExpanded || isPinned ? 'flex-start' : 'center',
        gap: '12px'
      }}>
         <div style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              borderRadius: '50%',
              background: '#21262d',
              border: '2px solid #30363d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#e6edf3'
            }}>
              {userData?.first_name?.charAt(0).toUpperCase() || userData?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        
        <motion.div 
            animate={{ opacity: isExpanded || isPinned ? 1 : 0 }}
            style={{ display: isExpanded || isPinned ? 'block' : 'none', overflow: 'hidden' }}
        >
             <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                {userData?.username || 'User'}
             </div>
             <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Level 1 Initiate</div>
        </motion.div>
      </div>

      {/* STREAK */}
      <div style={{
        padding: isExpanded || isPinned ? '20px' : '10px 10px 15px 25px',
        display: 'flex',
        justifyContent: isExpanded || isPinned ? 'flex-start' : 'center',
        alignItems: 'center'
      }}>
         <div 
            title="Current Streak"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--neon-orange)' }}
         >
            <Flame size={18} fill={streak > 0 ? "var(--neon-orange)" : "none"} />
            <motion.span
                animate={{ opacity: isExpanded || isPinned ? 1 : 0, width: isExpanded || isPinned ? 'auto' : 0 }}
                style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontWeight: 700, 
                    whiteSpace: 'nowrap',
                    fontSize: '13px',
                    overflow: 'hidden'
                }}
            >
                {streak} Day Streak
            </motion.span>
         </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '44px',
                margin: '0 10px',
                padding: '0 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                position: 'relative',
                color: isActive ? '#e6edf3' : '#8b949e',
                background: isActive ? 'rgba(88, 166, 255, 0.15)' : 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.color = '#e6edf3';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.color = '#8b949e';
                    e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
                {/* Clone icon to apply glow if active */}
                <div style={isActive ? { color: 'var(--neon-cyan)' } : {}}>
                    {item.icon}
                </div>
              </div>

              <motion.span
                animate={{
                  opacity: isExpanded || isPinned ? 1 : 0,
                  x: isExpanded || isPinned ? 0 : -10
                }}
                style={{
                  marginLeft: '16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {item.label}
              </motion.span>
            </div>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div style={{ padding: '20px', borderTop: '1px solid #21262d' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'var(--neon-red)',
            background: 'transparent',
            border: 'none',
            opacity: 0.8,
            transition: 'opacity 0.2s',
            width: '100%',
            padding: '8px 10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
            <LogOut size={20} />
          </div>
          <motion.span
            animate={{
              opacity: isExpanded || isPinned ? 1 : 0,
              x: isExpanded || isPinned ? 0 : -10
            }}
            style={{ marginLeft: '16px', fontFamily: 'var(--font-body)', fontSize: '14px' }}
          >
            Disconnect
          </motion.span>
        </button>
      </div>
    </motion.div>
  );
}
