import React, { useEffect, useState } from 'react';
import { X, Crown, Check, Lock } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { useJada } from '../../jada/JadaContext';

const PremiumGateModal = ({ isOpen, onClose, onJoinWaitlist, feature, status, joining }) => {
  const jada = useJada();
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const release = jada.acquireFullscreenOverlay();
    return () => release();
  }, [isOpen, jada]);

  if (!isOpen) return null;

  const waitlistPending = status?.waitlist_status === 'pending';

  const items = [
    "Unlimited CV/Portfolio Exports",
    "Enhanced JADA AI Support",
    "Embedded Video Lessons",
    "Priority Project Reviews",
    "Early Access to Beta Features"
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(20px)', // Glass blur
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(22, 33, 62, 0.95) 0%, rgba(15, 52, 96, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Accent Top Line */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #F59E0B, #FFD700)' }}></div>

        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', 
            background: 'rgba(245, 158, 11, 0.1)', 
            color: '#F59E0B', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Crown size={32} />
          </div>

          <h2 style={{ margin: '0 0 10px', fontSize: '22px', color: '#fff' }}>Unlock Full Access</h2>
          <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.5' }}>
            {feature?.description || 'This feature requires a premium account. Join the waitlist to get early access.'}
          </p>

          <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
             {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#e0e0e0', fontSize: '14px' }}>
                  <Check size={16} color="#29BC9B" />
                  {item}
                </div>
             ))}
          </div>

          <button
            onClick={onJoinWaitlist}
            disabled={joining || waitlistPending}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '6px',
              border: 'none',
              background: waitlistPending ? 'rgba(255,255,255,0.1)' : '#F59E0B',
              color: waitlistPending ? '#888' : '#000',
              fontWeight: '600',
              fontSize: '15px',
              cursor: waitlistPending ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {waitlistPending ? 'You are on the waitlist' : 'Join Premium Waitlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumGateModal;
