import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  disabled = false,
  type = 'button'
}) => {
  
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    border: 'none',
    outline: 'none',
    gap: '8px'
  };

  const variants = {
    primary: {
      background: 'var(--gradient-cta)',
      color: '#fff',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      background: 'transparent',
      border: '1px solid var(--neon-cyan)',
      color: 'var(--neon-cyan)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
    danger: {
        background: 'transparent',
        border: '1px solid var(--neon-red)',
        color: 'var(--neon-red)',
    }
  };

  const sizes = {
    sm: {
      padding: '6px 12px',
      fontSize: '0.8rem',
    },
    md: {
      padding: '10px 20px',
      fontSize: '0.95rem',
    },
    lg: {
      padding: '14px 28px',
      fontSize: '1.1rem',
    }
  };

  const style = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size]
  };

  return (
    <button
      type={type}
      className={`btn-${variant} ${className}`}
      style={style}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled && variant === 'primary') {
             e.currentTarget.style.transform = 'translateY(-2px)';
             e.currentTarget.style.boxShadow = '0 0 15px var(--neon-magenta)';
        }
        if(!disabled && variant === 'secondary') {
            e.currentTarget.style.background = 'rgba(95, 245, 255, 0.1)';
            e.currentTarget.style.boxShadow = '0 0 10px var(--neon-cyan)';
        }
        if(!disabled && variant === 'ghost') {
            e.currentTarget.style.color = 'var(--neon-cyan)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
             e.currentTarget.style.transform = 'translateY(0)';
             e.currentTarget.style.boxShadow = variants[variant].boxShadow || 'none';
             if(variant === 'secondary') e.currentTarget.style.background = 'transparent';
             if(variant === 'ghost') e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {children}
    </button>
  );
};

export default Button;
