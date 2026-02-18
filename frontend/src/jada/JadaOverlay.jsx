import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useJada } from './JadaContext';
import JadaRouterAvatar from './JadaRouterAvatar';
import JadaChatSheet from './JadaChatSheet';

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
  const { mode, speech, anchor, sizePx, isHidden, setSpeech, isChatOpen, openChat } = useJada();
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
    <>
      {/* Avatar + speech bubble (hidden when chat is open) */}
      {!isChatOpen && (
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
                openChat();
              }}
            />
          </div>
        </div>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isChatOpen && <JadaChatSheet />}
      </AnimatePresence>
    </>
  );
}
