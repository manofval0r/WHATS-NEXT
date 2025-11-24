import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Layout, 
  User, 
  Settings as SettingsIcon, 
  Users, 
  BookOpen, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Pin,
  PinOff,
  Flame // Import Flame icon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [streak, setStreak] = useState(0); // Streak state
  const sidebarRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fetch Streak
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const response = await axios.get('http://127.0.0.1:8000/api/profile/streak/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStreak(response.data.streak);
        }
      } catch (error) {
        console.error("Error fetching streak:", error);
      }
    };

    fetchStreak();
    // Refresh streak every minute to keep it updated if user submits something
    const interval = setInterval(fetchStreak, 60000);
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
      animate={{ width: isExpanded || isPinned ? '240px' : '60px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        height: '100vh',
        background: 'rgba(22, 27, 34, 0.8)', // Glassmorphism
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden'
      }}
    >
      {/* Header / Pin Toggle */}
      <div style={{ 
        height: '60px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isExpanded || isPinned ? 'space-between' : 'center',
        padding: isExpanded || isPinned ? '0 20px' : '0',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {(isExpanded || isPinned) && (
          <span style={{ 
            fontFamily: 'JetBrains Mono', 
            fontWeight: 'bold', 
            color: 'var(--neon-cyan)',
            whiteSpace: 'nowrap'
          }}>
            WHAT'S NEXT v1.2
          </span>
        )}
        
        <button 
          onClick={() => setIsPinned(!isPinned)}
          style={{
            background: 'transparent',
            border: 'none',
            color: isPinned ? 'var(--neon-cyan)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }}
        >
          {isPinned ? <Pin size={16} /> : (isExpanded ? <PinOff size={16} /> : <div style={{width: 16, height: 16}} />)}
        </button>
      </div>

      {/* STREAK DISPLAY */}
      <div style={{
        padding: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(255, 165, 0, 0.05)' // Subtle orange tint
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isExpanded || isPinned ? '10px' : '0',
          color: '#FFA500', // Orange color for fire
          fontWeight: 'bold',
          fontFamily: 'JetBrains Mono'
        }}>
          <Flame size={20} fill={streak > 0 ? "#FFA500" : "none"} />
          {(isExpanded || isPinned) ? (
            <span>{streak} Day Streak</span>
          ) : (
            <span style={{ fontSize: '12px', marginLeft: '2px' }}>{streak}</span>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                padding: '0 20px',
                cursor: 'pointer',
                position: 'relative',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                background: isActive ? 'rgba(48, 54, 61, 0.4)' : 'transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-main)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    background: 'var(--neon-cyan)',
                    boxShadow: '0 0 8px var(--neon-cyan)'
                  }}
                />
              )}

              <div style={{ minWidth: '20px', display: 'flex', justifyContent: 'center' }}>
                {item.icon}
              </div>
              
              <motion.span
                animate={{ 
                  opacity: isExpanded || isPinned ? 1 : 0,
                  x: isExpanded || isPinned ? 0 : -10
                }}
                style={{ 
                  marginLeft: '16px', 
                  fontFamily: 'Inter', 
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '400'
                }}
              >
                {item.label}
              </motion.span>
            </div>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)' }}>
        <div
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'var(--error-red)',
            opacity: 0.8,
            transition: 'opacity 0.2s',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          <div style={{ minWidth: '20px', display: 'flex', justifyContent: 'center' }}>
            <LogOut size={20} />
          </div>
          <motion.span
             animate={{ 
                opacity: isExpanded || isPinned ? 1 : 0,
                x: isExpanded || isPinned ? 0 : -10
              }}
            style={{ marginLeft: '16px', fontFamily: 'Inter', fontSize: '14px' }}
          >
            Disconnect
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
