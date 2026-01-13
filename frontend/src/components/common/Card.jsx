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
      background: 'var(--void-mid)',
      border: '1px solid var(--void-glow)',
    },
    glass: {
      background: 'rgba(26, 19, 53, 0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(95, 245, 255, 0.1)',
    },
    elevated: {
      background: 'var(--void-light)',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--void-glow)',
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
