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
      {/* Floating Bottom Navigation - Mobile only */}
      {isMobile && <FloatingBottomBar />}
    </ div>
      );
}
