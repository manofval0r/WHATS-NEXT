import React from 'react';
import { motion } from 'framer-motion';

const Jada = ({ size = 'md', className = '' }) => {
  // Map sizes to pixel values
  const sizeMap = {
    sm: 40,
    md: 80,
    lg: 120,
    xl: 200
  };

  const pxSize = sizeMap[size] || 80;

  // Artifact path for the image provided by user
  const jadaImage = "file:///C:/Users/User/.gemini/antigravity/brain/93427d9d-ec81-4090-8e6d-b2dc2ca130d5/uploaded_image_1768259783435.png";

  return (
    <div className={`jada-wrapper ${className}`} style={{ width: pxSize, height: pxSize, position: 'relative' }}>
      
      {/* Outer Glow Ring */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
          rotate: 360
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          top: -10,
          left: -10,
          right: -10,
          bottom: -10,
          borderRadius: '50%',
          border: '2px dashed var(--neon-cyan)',
          pointerEvents: 'none'
        }}
      />

       {/* Inner Pulse */}
       <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--neon-violet) 0%, transparent 70%)',
          filter: 'blur(10px)',
          zIndex: 0
        }}
      />

      {/* The Mascot Image */}
      <motion.img 
        src={jadaImage} 
        alt="JADA AI" 
        initial={{ y: 0 }}
        animate={{ 
            y: [-5, 5, -5] 
        }}
        transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          filter: 'drop-shadow(0 0 10px rgba(0, 242, 255, 0.5))'
        }}
      />
      
      {/* Status Indicator Dot */}
      <div style={{
          position: 'absolute',
          bottom: 2,
          right: 2,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#2ea043',
          border: '2px solid #000',
          zIndex: 2,
          boxShadow: '0 0 8px #2ea043'
      }}></div>
    </div>
  );
};

export default Jada;
