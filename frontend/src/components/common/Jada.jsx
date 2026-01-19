import React from 'react';
import JadaRouterAvatar from '../../jada/JadaRouterAvatar';

const SIZE_MAP = {
  sm: 40,
  md: 80,
  lg: 120,
  xl: 200,
};

function modeFromState(state) {
  if (!state) return 'idle';
  if (state === 'working' || state === 'thinking') return 'thinking';
  if (state === 'success') return 'success';
  if (state === 'error') return 'error';
  return 'idle';
}

const Jada = ({ size = 'md', state, mode, className = '' }) => {
  const pxSize = SIZE_MAP[size] || 80;
  const resolvedMode = mode || modeFromState(state);

  return (
    <div className={className} style={{ width: pxSize, height: pxSize }}>
      <JadaRouterAvatar size={pxSize} mode={resolvedMode} />
    </div>
  );
};

export default Jada;
