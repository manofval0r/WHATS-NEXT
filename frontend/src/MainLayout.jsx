import React from 'react';
import Sidebar from './Sidebar';
import FloatingBottomBar from './components/FloatingBottomBar';
import { useIsMobile } from './hooks/useMediaQuery';
import PremiumGateModal from './components/common/PremiumGateModal';
import { usePremium } from './premium/PremiumContext';

export default function MainLayout({ children }) {
  const isMobile = useIsMobile();
  const { gateState, closeGate, joinWaitlist, joining, feature, status } = usePremium();

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: 'transparent',
      color: 'var(--text-primary)',
      overflow: 'hidden'
    }}>
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && <Sidebar />}

      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        paddingBottom: isMobile ? '80px' : '0' // Space for floating nav
      }}>
        {children}
      </div>

      {/* Floating Bottom Navigation - Mobile only */}
      {isMobile && <FloatingBottomBar />}

      <PremiumGateModal
        isOpen={gateState.isOpen}
        onClose={closeGate}
        onJoinWaitlist={joinWaitlist}
        feature={feature}
        status={status}
        joining={joining}
      />
    </div>
  );
}

