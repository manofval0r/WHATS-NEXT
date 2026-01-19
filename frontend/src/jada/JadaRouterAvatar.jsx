import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

function modePalette(mode) {
  // Keep colors theme-driven; fall back to neon variables.
  const base = {
    body: 'var(--bg-card)',
    stroke: 'var(--border-subtle)',
    glow: 'rgba(95, 245, 255, 0.38)',
    accent: 'var(--neon-cyan)',
    accent2: 'var(--neon-violet)',
    warn: 'var(--neon-red)',
    ok: 'var(--neon-green)',
    text: 'var(--text-primary)',
  };

  if (mode === 'error') return { ...base, accent: base.warn, glow: 'rgba(255, 0, 60, 0.25)' };
  if (mode === 'success') return { ...base, accent: base.ok, glow: 'rgba(46, 160, 67, 0.25)' };
  if (mode === 'celebrate') return { ...base, glow: 'rgba(255, 215, 0, 0.25)' };
  if (mode === 'thinking') return { ...base, glow: 'rgba(95, 245, 255, 0.40)' };
  return base;
}

export default function JadaRouterAvatar({ size = 132, mode = 'idle', onClick, title = 'JADA' }) {
  const palette = useMemo(() => modePalette(mode), [mode]);

  const floatAnim =
    mode === 'error'
      ? { x: [0, -3, 3, -2, 2, 0] }
      : { y: [0, -6, 0] };

  const floatTransition =
    mode === 'error'
      ? { duration: 0.35, repeat: 2, ease: 'easeInOut' }
      : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' };

  const corePulse =
    mode === 'thinking'
      ? { opacity: [0.55, 1, 0.55], scale: [1, 1.07, 1] }
      : mode === 'celebrate'
      ? { opacity: [0.7, 1, 0.7], scale: [1, 1.1, 1] }
      : { opacity: [0.45, 0.65, 0.45] };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="JADA"
      title={title}
      style={{
        width: size,
        height: size,
        border: 0,
        padding: 0,
        background: 'transparent',
        cursor: 'pointer',
      }}
      initial={false}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        style={{ display: 'block', filter: `drop-shadow(0 18px 28px ${palette.glow})` }}
        animate={floatAnim}
        transition={floatTransition}
      >
        <defs>
          <linearGradient id="jadaBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(95,245,255,0.22)" />
            <stop offset="48%" stopColor="rgba(168,85,247,0.14)" />
            <stop offset="100%" stopColor="rgba(95,245,255,0.18)" />
          </linearGradient>
          <radialGradient id="jadaFace" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="rgba(95,245,255,0.35)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.10)" />
          </radialGradient>
        </defs>

        {/* Outer halo */}
        <motion.circle
          cx="100"
          cy="102"
          r="76"
          fill="none"
          stroke={palette.accent}
          strokeOpacity="0.45"
          strokeWidth="2"
          strokeDasharray="8 10"
          animate={{ rotate: 360 }}
          transform="rotate(0 100 100)"
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        {/* Glow core */}
        <motion.circle
          cx="100"
          cy="112"
          r="62"
          fill={palette.accent2}
          opacity="0.08"
          animate={corePulse}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Antenna */}
        <path
          d="M100 22 C92 32 92 44 100 54 C108 44 108 32 100 22Z"
          fill={palette.accent}
          opacity="0.9"
        />
        <circle cx="100" cy="20" r="6" fill={palette.accent2} opacity="0.95" />

        {/* Head / router body */}
        <motion.rect
          x="48"
          y="62"
          width="104"
          height="92"
          rx="26"
          fill="url(#jadaBody)"
          stroke={palette.stroke}
          strokeWidth="2"
          animate={
            mode === 'celebrate'
              ? { scale: [1, 1.03, 1] }
              : mode === 'thinking'
              ? { scale: [1, 1.01, 1] }
              : { scale: 1 }
          }
          transform="translate(0 0)"
          transition={{ duration: 1.2, repeat: mode === 'idle' ? Infinity : Infinity, ease: 'easeInOut' }}
        />

        {/* Subtle highlight */}
        <path
          d="M64 80 C70 70 84 64 100 64 C116 64 130 70 136 80"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.65"
        />

        {/* Face panel */}
        <rect
          x="66"
          y="88"
          width="68"
          height="44"
          rx="16"
          fill="url(#jadaFace)"
          stroke="rgba(95,245,255,0.28)"
        />

        {/* Eyes */}
        <motion.circle
          cx="86"
          cy="110"
          r="6"
          fill={palette.accent}
          animate={{ scaleY: [1, 1, 0.15, 1, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.48, 0.5, 0.52, 1] }}
        />
        <motion.circle
          cx="114"
          cy="110"
          r="6"
          fill={palette.accent}
          animate={{ scaleY: [1, 1, 0.15, 1, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.48, 0.5, 0.52, 1] }}
        />

        {/* Cheek glows */}
        <circle cx="74" cy="120" r="6" fill="rgba(255,105,180,0.20)" />
        <circle cx="126" cy="120" r="6" fill="rgba(255,105,180,0.20)" />

        {/* Mouth */}
        <motion.path
          d="M86 126 C92 133 108 133 114 126"
          fill="none"
          stroke={palette.accent2}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={mode === 'error' ? 0.9 : 0.8}
          animate={mode === 'error' ? { d: ['M86 129 C92 122 108 122 114 129', 'M86 129 C92 124 108 124 114 129'] } : {}}
          transition={mode === 'error' ? { duration: 0.25, repeat: 4 } : undefined}
        />

        {/* Router ports */}
        <rect x="70" y="150" width="60" height="10" rx="5" fill="rgba(0,0,0,0.15)" />
        <circle cx="82" cy="155" r="2" fill={palette.accent} opacity="0.9" />
        <circle cx="94" cy="155" r="2" fill={palette.accent} opacity="0.6" />
        <circle cx="106" cy="155" r="2" fill={palette.accent} opacity="0.6" />
        <circle cx="118" cy="155" r="2" fill={palette.accent} opacity="0.6" />

        {/* Celebrate sparkles */}
        {mode === 'celebrate' && (
          <>
            <motion.path
              d="M34 92 L40 92 M37 89 L37 95"
              stroke="rgba(255,215,0,0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ opacity: [0, 1, 0], scale: [0.9, 1.2, 0.9] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d="M166 104 L172 104 M169 101 L169 107"
              stroke="rgba(255,215,0,0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ opacity: [0, 1, 0], scale: [0.9, 1.3, 0.9] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </motion.svg>
    </motion.button>
  );
}
