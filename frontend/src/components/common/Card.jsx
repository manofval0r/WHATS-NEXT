import React from 'react';

const Card = ({ 
  children, 
  variant = 'standard', 
  className = '', 
  style = {} 
}) => {
  
  const baseStyles = {
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  };

  const variants = {
    standard: {
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
    },
    glass: {
      background: 'color-mix(in srgb, var(--bg-panel), transparent 40%)',
      backdropFilter: 'blur(var(--glass-blur))',
      WebkitBackdropFilter: 'blur(var(--glass-blur))',
      border: '1px solid var(--border-subtle)',
    },
    elevated: {
      background: 'var(--bg-surface)',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border-subtle)',
    }
  };

  const combinedStyle = {
    ...baseStyles,
    ...variants[variant],
    ...style
  };

  return (
    <div 
      className={`card-${variant} ${className}`}
      style={combinedStyle}
    >
      {children}
    </div>
  );
};

export default Card;
