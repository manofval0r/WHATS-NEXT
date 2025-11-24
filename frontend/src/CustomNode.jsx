import { Handle, Position } from '@xyflow/react';
import { Code, Cpu, Lock, CheckCircle, DollarSign } from 'lucide-react';

export default function CustomNode({ data }) {
  
  // Status Logic
  const isLocked = data.status === 'locked';
  const isActive = data.status === 'active';
  const isDone = data.status === 'completed';

  // Dynamic Neon Styling
  const getBorderColor = () => {
    if (isDone) return '#00ff88'; // Green
    if (isActive) return '#00f2ff'; // Cyan Neon
    return '#333'; // Dark Grey
  };

  const getGlow = () => {
    if (isDone) return '0 0 15px rgba(0, 255, 136, 0.5)';
    if (isActive) return '0 0 20px rgba(0, 242, 255, 0.4)';
    return 'none';
  };

  const getBg = () => {
    if (isActive) return 'linear-gradient(145deg, #0a1a1a, #050505)';
    return '#0a0a0a';
  }

  return (
    <div style={{
      background: getBg(),
      border: `2px solid ${getBorderColor()}`,
      boxShadow: getGlow(),
      borderRadius: '12px',
      padding: '15px',
      minWidth: '160px',
      textAlign: 'center',
      color: isLocked ? '#555' : '#fff',
      transition: 'all 0.3s ease',
      opacity: isLocked ? 0.6 : 1,
      cursor: isLocked ? 'not-allowed' : 'pointer'
    }}>
      {/* Input Handle (Top) */}
      <Handle type="target" position={Position.Bottom} style={{ background: '#fff' }} />
      
      {/* Icon Header */}
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {isLocked && <Lock size={20} />}
        {isDone && <CheckCircle size={20} color="#00ff88" />}
        {isActive && <Cpu size={24} color="#00f2ff" />}
      </div>
      
      {/* Label */}
      <div style={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'sans-serif' }}>
        {data.label}
      </div>

      {/* Market Value Tag */}
      {!isLocked && (
        <div style={{ 
          marginTop: '8px', 
          fontSize: '10px', 
          color: data.market_value === 'High' ? '#ffd700' : '#888',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px'
        }}>
          {data.market_value === 'High' && <DollarSign size={10} />} 
          Val: {data.market_value}
        </div>
      )}

      {/* Output Handle (Bottom) */}
      <Handle type="source" position={Position.Top} style={{ background: '#fff' }} />
    </div>
  );
}