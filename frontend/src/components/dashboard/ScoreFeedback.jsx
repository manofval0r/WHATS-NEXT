import React from 'react';
import { CheckCircle, XCircle, AlertCircle, ChevronRight, ExternalLink, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ScoreFeedback Component
 * Displays animated verification results with pass/fail checklist
 * 
 * Props:
 * - scoreData: Object from /api/preview-score/ or /api/submit-project/
 * - isLoading: Boolean for loading state
 * - threshold: Minimum score to pass (default 60)
 */
const ScoreFeedback = ({ scoreData, isLoading = false, threshold = 60 }) => {
  if (isLoading) {
    return (
      <div style={{
        padding: '24px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid var(--void-glow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="loading-spinner" style={{
            width: '24px',
            height: '24px',
            border: '2px solid rgba(95, 245, 255, 0.2)',
            borderTop: '2px solid var(--neon-cyan)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            ANALYZING_REPOSITORY...
          </span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!scoreData) return null;

  const { score, passed, checks, suggestions, metadata, valid } = scoreData;
  
  // Check labels for display
  const checkLabels = {
    repo_exists: 'Repository Accessible',
    has_readme: 'README Documentation',
    recent_activity: 'Recent Activity',
    multiple_commits: 'Commit History',
    has_code: 'Source Code Files',
    has_tests: 'Test Suite',
    tech_match: 'Tech Stack Match'
  };

  // Order of checks for display
  const checkOrder = ['repo_exists', 'has_readme', 'has_code', 'multiple_commits', 'recent_activity', 'has_tests', 'tech_match'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: `1px solid ${passed ? 'rgba(46, 160, 67, 0.4)' : valid ? 'rgba(255, 190, 11, 0.4)' : 'rgba(248, 81, 73, 0.4)'}`,
        overflow: 'hidden'
      }}
    >
      {/* HEADER - Score Display */}
      <div style={{
        padding: '20px 24px',
        background: passed 
          ? 'linear-gradient(135deg, rgba(46, 160, 67, 0.15), rgba(46, 160, 67, 0.05))'
          : valid 
            ? 'linear-gradient(135deg, rgba(255, 190, 11, 0.15), rgba(255, 190, 11, 0.05))'
            : 'linear-gradient(135deg, rgba(248, 81, 73, 0.15), rgba(248, 81, 73, 0.05))',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {passed ? (
              <CheckCircle size={32} color="#2ea043" />
            ) : valid ? (
              <AlertCircle size={32} color="#ffbe0b" />
            ) : (
              <XCircle size={32} color="#f85149" />
            )}
          </motion.div>
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: passed ? '#2ea043' : valid ? '#ffbe0b' : '#f85149',
              fontFamily: 'var(--font-display)'
            }}>
              {passed ? 'VERIFICATION_PASSED' : valid ? 'SCORE_BELOW_THRESHOLD' : 'VERIFICATION_FAILED'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {passed 
                ? 'Your project meets all verification requirements!' 
                : valid 
                  ? `Minimum score of ${threshold} required to complete module`
                  : 'Unable to verify repository'}
            </div>
          </div>
        </div>
        
        {/* Score Circle */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: `conic-gradient(
              ${passed ? '#2ea043' : valid ? '#ffbe0b' : '#f85149'} ${score * 3.6}deg, 
              rgba(255,255,255,0.1) 0deg
            )`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'var(--void-deep)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <span style={{
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: passed ? '#2ea043' : valid ? '#ffbe0b' : '#f85149'
            }}>
              {score}
            </span>
            <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>/ 100</span>
          </div>
        </motion.div>
      </div>

      {/* CHECKS LIST */}
      {checks && Object.keys(checks).length > 0 && (
        <div style={{ padding: '16px 24px' }}>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)',
            marginBottom: '12px',
            letterSpacing: '1px'
          }}>
            // VERIFICATION_CHECKS
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence>
              {checkOrder.map((checkKey, index) => {
                const check = checks[checkKey];
                if (!check) return null;
                
                return (
                  <motion.div
                    key={checkKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: check.passed 
                        ? 'rgba(46, 160, 67, 0.08)' 
                        : check.points > 0 
                          ? 'rgba(255, 190, 11, 0.08)'
                          : 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: `1px solid ${
                        check.passed 
                          ? 'rgba(46, 160, 67, 0.2)' 
                          : check.points > 0
                            ? 'rgba(255, 190, 11, 0.2)'
                            : 'rgba(255, 255, 255, 0.08)'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {check.passed ? (
                        <CheckCircle size={16} color="#2ea043" />
                      ) : check.points > 0 ? (
                        <AlertCircle size={16} color="#ffbe0b" />
                      ) : (
                        <XCircle size={16} color="#6e7681" />
                      )}
                      <div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: check.passed ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}>
                          {checkLabels[checkKey] || checkKey}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                          marginTop: '2px'
                        }}>
                          {check.message}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: check.passed ? '#2ea043' : check.points > 0 ? '#ffbe0b' : 'var(--text-tertiary)'
                    }}>
                      +{check.points}/{check.max_points || 15}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* SUGGESTIONS */}
      {suggestions && suggestions.length > 0 && !passed && (
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 190, 11, 0.03)'
        }}>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--neon-gold)',
            marginBottom: '12px',
            letterSpacing: '1px'
          }}>
            // IMPROVEMENT_SUGGESTIONS
          </div>
          
          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {suggestions.map((suggestion, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5
                }}
              >
                <ChevronRight size={14} color="#ffbe0b" style={{ marginTop: '3px', flexShrink: 0 }} />
                {suggestion}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* METADATA */}
      {metadata && (metadata.language || metadata.stars > 0) && (
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '12px',
          color: 'var(--text-tertiary)'
        }}>
          {metadata.language && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--neon-cyan)'
              }} />
              {metadata.language}
            </span>
          )}
          {metadata.stars > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={12} />
              {metadata.stars}
            </span>
          )}
          {metadata.repo_url && (
            <a
              href={metadata.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--neon-cyan)',
                textDecoration: 'none',
                marginLeft: 'auto'
              }}
            >
              View Repository <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ScoreFeedback;
