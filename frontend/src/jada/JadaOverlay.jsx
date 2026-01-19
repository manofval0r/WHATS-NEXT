import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useJada } from './JadaContext';
import JadaRouterAvatar from './JadaRouterAvatar';

function anchorStyle(anchor) {
  if (anchor === 'left') {
    return { left: 18, bottom: 18, alignItems: 'flex-start' };
  }
  if (anchor === 'right') {
    return { right: 18, bottom: 18, alignItems: 'flex-end' };
  }
  if (anchor === 'center') {
    return { left: '50%', bottom: 18, transform: 'translateX(-50%)', alignItems: 'center' };
  }
  return { right: 18, bottom: 18, alignItems: 'flex-end' };
}

export default function JadaOverlay() {
  const { mode, speech, anchor, sizePx, isHidden, setSpeech } = useJada();
  const [expanded, setExpanded] = useState(true);

  const rootStyle = useMemo(() => {
    const base = {
      position: 'fixed',
      zIndex: 2500,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    };

    return { ...base, ...anchorStyle(anchor) };
  }, [anchor]);

  if (isHidden) return null;

  return (
    <div style={rootStyle}>
      <AnimatePresence>
        {expanded && speech?.text && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              maxWidth: 280,
              padding: '10px 12px',
              borderRadius: 14,
              background: 'var(--panel-bg, rgba(0,0,0,0.55))',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.14))',
              boxShadow: 'var(--shadow-elev, 0 18px 50px rgba(0,0,0,0.45))',
              backdropFilter: 'blur(var(--glass-blur))',
              color: 'var(--text-primary)',
              fontSize: 13,
              lineHeight: 1.3,
              pointerEvents: 'auto',
            }}
            role="dialog"
            aria-label="JADA message"
            onClick={() => setExpanded(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setExpanded(false);
            }}
            tabIndex={0}
          >
            {speech.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ pointerEvents: 'auto' }}>
        <JadaRouterAvatar
          size={sizePx}
          mode={mode}
          onClick={() => {
            // Toggle bubble; if closed, reopen.
            setExpanded((v) => !v);
            if (!speech?.text) setSpeech('Tap me any time — I\'m watching your progress.', 'warm');
          }}
        />
      </div>

      {/* Tiny helper tip when bubble closed */}
      <AnimatePresence>
        {!expanded && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              pointerEvents: 'auto',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.14))',
              background: 'var(--bg-card, rgba(0,0,0,0.35))',
              color: 'var(--text-secondary)',
              borderRadius: 999,
              padding: '6px 10px',
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-soft, 0 10px 28px rgba(0,0,0,0.35))',
              backdropFilter: 'blur(var(--glass-blur))',
              alignSelf: anchor === 'left' ? 'flex-start' : anchor === 'center' ? 'center' : 'flex-end',
            }}
            onClick={() => setExpanded(true)}
          >
            Show JADA
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
