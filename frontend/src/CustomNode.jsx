import { Handle, Position } from '@xyflow/react';
import { Code, Cpu, Lock, CheckCircle } from 'lucide-react';

export default function CustomNode({ data }) {
  
  // 1. Dynamic Styling based on Status
  const isLocked = data.status === 'locked';
  const isActive = data.status === 'active';
  const isDone = data.status === 'completed';

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

  return (
    <div style={{
      background: '#0a0a0a',
      border: `2px solid ${getBorderColor()}`,
      boxShadow: getGlow(),
      borderRadius: '12px',
      padding: '15px',
      minWidth: '150px',
      textAlign: 'center',
      color: isLocked ? '#555' : '#fff',
      transition: 'all 0.3s ease',
      opacity: isLocked ? 0.7 : 1
    }}>
      {/* Input Handle (Top) */}
      <Handle type="target" position={Position.Bottom} style={{ background: '#fff' }} />
      
      {/* Icon Header */}
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
        {isLocked && <Lock size={20} />}
        {isDone && <CheckCircle size={20} color="#00ff88" />}
        {isActive && <Cpu size={24} color="#00f2ff" />}
      </div>
      
      {/* Label */}
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
        {data.label}
      </div>

      {/* Mini Tag */}
      {!isLocked && (
        <div style={{ fontSize: '10px', marginTop: '5px', color: '#888' }}>
          Val: {data.market_value}
        </div>
      )}

      {/* Output Handle (Bottom) */}
      <Handle type="source" position={Position.Top} style={{ background: '#fff' }} />
    </div>
  );
}