import React from 'react';

const Badge = ({ 
  label, 
  variant = 'cyan', 
  className = '' 
}) => {
  
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    border: '1px solid transparent'
  };

  const variants = {
    cyan: {
      background: 'color-mix(in srgb, var(--neon-cyan), transparent 90%)',
      borderColor: 'var(--neon-cyan)',
      color: 'var(--neon-cyan)',
    },
    gold: {
      background: 'color-mix(in srgb, var(--neon-gold), transparent 90%)',
      borderColor: 'var(--neon-gold)',
      color: 'var(--neon-gold)',
    },
    violet: {
      background: 'color-mix(in srgb, var(--neon-violet), transparent 90%)',
      borderColor: 'var(--neon-violet)',
      color: 'var(--neon-violet)',
    },
    magenta: {
      background: 'color-mix(in srgb, var(--neon-magenta), transparent 90%)',
      borderColor: 'var(--neon-magenta)',
      color: 'var(--neon-magenta)',
    },
    red: {
      background: 'color-mix(in srgb, var(--neon-red), transparent 90%)',
      borderColor: 'var(--neon-red)',
      color: 'var(--neon-red)',
    },
    green: {
      background: 'color-mix(in srgb, var(--neon-green), transparent 90%)',
      borderColor: 'var(--neon-green)',
      color: 'var(--neon-green)',
    },
    mint: {
      background: 'color-mix(in srgb, var(--neon-mint), transparent 90%)',
      borderColor: 'var(--neon-mint)',
      color: 'var(--neon-mint)',
    }
  };

  return (
    <span 
      className={`badge ${className}`}
      style={{ ...baseStyles, ...(variants[variant] || variants.cyan) }}
    >
      {label}
    </span>
  );
};

export default Badge;
