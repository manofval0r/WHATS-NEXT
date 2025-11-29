import React from 'react';
import Sidebar from './Sidebar';
import FloatingBottomBar from './components/FloatingBottomBar';
import { useIsMobile } from './hooks/useMediaQuery';

export default function MainLayout({ children }) {
  const isMobile = useIsMobile();

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: 'var(--bg-dark)',
      color: 'var(--text-main)',
      overflow: 'hidden'
    }}>
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && <Sidebar />}

      <div style={{
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        paddingBottom: isMobile ? '80px' : '0' // Space for floating nav
      }}>
        {children}
      </div>

      {/* Floating Bottom Navigation - Mobile only */}
      {isMobile && <FloatingBottomBar />}
    </div>
  );
}
