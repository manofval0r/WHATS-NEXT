import React, { useEffect, useState } from 'react';
import { X, Lock, ExternalLink } from 'lucide-react';
import Button from './common/Button';
import Card from './common/Card';
import LessonCard from './dashboard/LessonCard';
import { usePremium } from '../premium/PremiumContext';
import { useJada } from '../jada/JadaContext';

export default function MobileModuleModal({ node, onClose, onSubmitProject, onMarkComplete }) {
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const { status, checkPremiumAccess } = usePremium();
  const isPremium = status?.is_premium;
  const jada = useJada();

  if (!node) return null;

  useEffect(() => {
    const release = jada.acquireFullscreenOverlay();
    return () => release();
  }, [jada]);

  const { data } = node;
  const isLocked = data.status === 'locked';
  const isCompleted = data.status === 'completed';

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmitProject(submissionLink);
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--void-deep)',
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* HEADER */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--void-glow)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(13, 17, 23, 0.95)', backdropFilter: 'blur(10px)'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
            MODULE_{(data.step_order || 0).toString().padStart(2, '0')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>{data.label}</h2>
             {isLocked && <Lock size={14} color="var(--text-muted)" />}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '100px' }}>
        
        {/* DESCRIPTION */}
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {data.description}
        </p>

        {/* LESSONS (Always Visible) */}
        {data.lessons && data.lessons.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
              // LEARNING_UNITS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.lessons.slice(0, 3).map(lesson => (
                <LessonCard 
                    key={lesson.id} 
                    lesson={lesson} 
                    isCompleted={lesson.is_completed}
                    onToggleComplete={() => {}} // Read-only in mobile preview if locked?
                    confidenceRating={lesson.confidence_rating}
                    onConfidenceChange={() => {}}
                />
              ))}
              {data.lessons.length > 3 && (
                  <div style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      + {data.lessons.length - 3} more lessons
                  </div>
              )}
            </div>
          </div>
        )}

        {/* RESOURCES & ARCHIVES (Blurred if Locked) */}
        <div style={{ position: 'relative' }}>
            
            {/* BLUR OVERLAY */}
            {isLocked && (
                <div style={{
                    position: 'absolute', inset: -10, zIndex: 10,
                    background: 'rgba(5, 0, 20, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ 
                        background: '#0d1117', padding: '16px 24px', borderRadius: '12px', 
                        border: '1px solid var(--neon-red)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        boxShadow: '0 0 20px rgba(255, 0, 60, 0.2)'
                    }}>
                        <Lock size={24} color="var(--neon-red)" />
                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>ACCESS DENIED</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>
                            Complete Module {(data.step_order - 1).toString().padStart(2, '0')} first.
                        </span>
                    </div>
                </div>
            )}

            <div style={{ filter: isLocked ? 'blur(8px)' : 'none', opacity: isLocked ? 0.5 : 1, pointerEvents: isLocked ? 'none' : 'auto' }}>
                <h3 style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                // CLASSIFIED_RESOURCES
                </h3>
                
                {data.resources?.primary?.map((res, i) => {
                  const isPremiumVideo = res.type === 'video';
                  if (isPremiumVideo && !isPremium) {
                    return (
                      <Card
                        key={i}
                        variant="glass"
                        className="premium-locked-card"
                        style={{ padding: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}
                      >
                        <div className="premium-locked-content" style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                          <ExternalLink size={16} color="var(--neon-cyan)" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', color: '#fff', fontWeight: '500' }}>
                              {res.title}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>VIDEO • PREMIUM</div>
                          </div>
                        </div>
                        <div
                          className="premium-locked-overlay"
                          onClick={() => checkPremiumAccess('youtube_module', 'module_detail_mobile')}
                          role="button"
                          aria-label="Premium resource locked"
                        >
                          <Lock size={14} /> Premium resource
                        </div>
                      </Card>
                    );
                  }

                  return (
                    <Card
                      key={i}
                      variant="glass"
                      style={{ padding: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      onClick={() => {
                        if (res.url) window.open(res.url, '_blank');
                      }}
                    >
                      <ExternalLink size={16} color="var(--neon-cyan)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', color: '#fff', fontWeight: '500' }}>{res.title}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{res.type.toUpperCase()}</div>
                      </div>
                    </Card>
                  );
                })}

                <div style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                    // ARCHIVES
                    </h3>
                    <div style={{ padding: '12px', border: '1px dashed var(--border-subtle)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        Additional documentation and legacy code samples available upon unlock.
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* FOOTER ACTION */}
      {!isLocked && !isCompleted && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '16px', background: 'var(--void-deep)', borderTop: '1px solid var(--void-glow)'
          }}>
             {data.verification_project ? (
                 <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                        type="text" 
                        placeholder="github.com/project-link"
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                        style={{
                            flex: 1, background: '#0d1117', border: '1px solid var(--border-subtle)',
                            color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none'
                        }}
                    />
                    <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? '...' : 'VERIFY'}
                    </Button>
                 </div>
             ) : (
                 <Button variant="primary" style={{ width: '100%' }} onClick={() => onMarkComplete(node.id)}>
                    MARK MODULE COMPLETE
                 </Button>
             )}
          </div>
      )}
    </div>
  );
}