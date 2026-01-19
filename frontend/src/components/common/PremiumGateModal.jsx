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
  const waitlistMessage = waitlistPending
    ? 'You are already on the Premium waitlist. We will notify you when access opens.'
    : 'Premium is in beta. Join the waitlist and we will notify you when upgrades become available.';

  // Premium features comparison
  const premiumFeatures = [
    {
      name: 'Unlimited CV/Portfolio Exports',
      free: '3 exports/month',
      premium: 'Unlimited',
      implemented: true,
    },
    {
      name: 'Premium Themes',
      free: '2 themes (Light/Dark)',
      premium: '5 themes (Monokai, Synthwave, Nord, Dracula, Tokyo Night)',
      implemented: true,
    },
    {
      name: 'YouTube Videos in Modules',
      free: 'Text links only',
      premium: 'Embedded videos',
      implemented: true,
    },
    {
      name: 'Early Access to Features',
      free: '❌',
      premium: '✓ Beta features 30 days early',
      implemented: true,
    },
    {
      name: 'JADA In-Module Chat',
      free: '❌',
      premium: '✓ AI assistant in lessons',
      implemented: false,
      note: 'Coming soon'
    },
    {
      name: 'Priority Project Review',
      free: '3-5 days',
      premium: '24 hours',
      implemented: false,
      note: 'Coming soon'
    },
  ];

  const implementedCount = premiumFeatures.filter(f => f.implemented).length;
  const totalCount = premiumFeatures.length;

  return (
    <div className="premium-gate-overlay">
      <Card variant="elevated" className="premium-gate-card" style={{ padding: 0 }}>
        <div className="premium-gate-header">
          <div className="premium-gate-title">
            <div className="premium-gate-icon">
              <Crown size={24} />
            </div>
            <div>
              <div className="premium-gate-label">Upgrade to Premium</div>
              <div className="premium-gate-feature">Unlock advanced learning tools</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        <div className="premium-gate-body">
          {!showComparison ? (
            <>
              <p className="premium-gate-copy">
                {feature?.description || 'Access powerful tools to accelerate your learning and career growth.'}
              </p>

              <div className="premium-pricing-cards">
                <div className="pricing-card monthly">
                  <div className="price">$9<span className="period">/month</span></div>
                  <button 
                    className="upgrade-btn"
                    onClick={onJoinWaitlist}
                    disabled={joining || waitlistPending}
                  >
                    {waitlistPending ? 'Already on Waitlist' : 'Join Waitlist'}
                  </button>
                </div>

                <div className="pricing-card annual">
                  <div className="savings-badge">Save 17%</div>
                  <div className="price">$90<span className="period">/year</span></div>
                  <button 
                    className="upgrade-btn"
                    onClick={onJoinWaitlist}
                    disabled={joining || waitlistPending}
                  >
                    {waitlistPending ? 'Already on Waitlist' : 'Join Waitlist'}
                  </button>
                </div>
              </div>

              <button 
                className="view-features-btn"
                onClick={() => setShowComparison(true)}
              >
                View all features →
              </button>

              <div className="premium-gate-waitlist">
                <Lock size={14} />
                <span>{waitlistMessage}</span>
              </div>
            </>
          ) : (
            <div className="features-comparison">
              <button 
                className="back-btn"
                onClick={() => setShowComparison(false)}
              >
                ← Back
              </button>

              <h3>Feature Comparison</h3>
              <p className="features-subtitle">
                {implementedCount} of {totalCount} features currently available
              </p>

              <div className="comparison-table">
                <div className="table-header">
                  <div className="feature-name">Feature</div>
                  <div className="feature-free">Free</div>
                  <div className="feature-premium">Premium</div>
                </div>

                {premiumFeatures.map((feature, idx) => (
                  <div key={idx} className={`table-row ${feature.implemented ? 'available' : 'coming-soon'}`}>
                    <div className="feature-name">
                      {feature.name}
                      {!feature.implemented && <span className="coming-label">{feature.note}</span>}
                    </div>
                    <div className="feature-free">
                      {feature.free === '❌' ? '❌' : feature.free}
                    </div>
                    <div className="feature-premium">
                      {feature.premium === '✓ Beta features 30 days early' ? (
                        <><Check size={16} /> {feature.premium.replace('✓ ', '')}</>
                      ) : feature.premium.startsWith('✓') ? (
                        <><Check size={16} /> {feature.premium.replace('✓ ', '')}</>
                      ) : (
                        feature.premium
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="comparison-cta">
                <Button 
                  variant="primary" 
                  onClick={onJoinWaitlist} 
                  disabled={joining || waitlistPending}
                  fullWidth
                >
                  {waitlistPending ? 'Already on Waitlist' : 'Join Premium Waitlist'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {!showComparison && (
          <div className="premium-gate-actions">
            <Button variant="ghost" onClick={onClose}>Not Now</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PremiumGateModal;
