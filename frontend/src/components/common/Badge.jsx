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
      background: 'rgba(95, 245, 255, 0.1)',
      borderColor: 'var(--neon-cyan)',
      color: 'var(--neon-cyan)',
    },
    gold: {
      background: 'rgba(255, 190, 11, 0.1)',
      borderColor: 'var(--neon-gold)',
      color: 'var(--neon-gold)',
    },
    violet: {
      background: 'rgba(167, 139, 250, 0.1)',
      borderColor: 'var(--neon-violet)',
      color: 'var(--neon-violet)',
    },
    magenta: {
      background: 'rgba(255, 46, 136, 0.1)',
      borderColor: 'var(--neon-magenta)',
      color: 'var(--neon-magenta)',
    },
    red: {
      background: 'rgba(255, 0, 85, 0.1)',
      borderColor: 'var(--neon-red)',
      color: 'var(--neon-red)',
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
