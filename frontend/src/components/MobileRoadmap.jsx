import { useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function MobileRoadmap({ nodes, onNodeClick }) {
    const [selectedNode, setSelectedNode] = useState(null);

    // Generate SVG curved path
    const generatePath = () => {
        if (!nodes || nodes.length === 0) return '';

        let path = 'M100 28';

        for (let i = 0; i < nodes.length; i++) {
            const y = 28 + (i * 180);
            const controlX = i % 2 === 0 ? 150 : 50;
            const nextY = y + 180;

            path += ` C ${controlX} ${y + 72}, ${200 - controlX} ${y + 108}, 100 ${nextY}`;
        }

        return path;
    };

    // Get node positioning (left or right)
    const getNodeAlignment = (index) => {
        if (index % 4 === 0) return 'center';
        if (index % 4 === 1) return 'align-right';
        if (index % 4 === 2) return 'center';
        return 'align-left';
    };

    // Get node status class
    const getNodeStatusClass = (node) => {
        if (node.data.status === 'completed') return 'completed';
        if (node.data.status === 'active') return 'active';
        return 'locked';
    };

    // Get progress percentage
    const getProgress = (node) => {
        if (node.data.status === 'completed') return 100;
        if (node.data.status === 'active') return 50; // Could be dynamic
        return 0;
    };

    // Handle node click
    const handleNodeClick = (node) => {
        if (node.data.status === 'locked') return;
        setSelectedNode(node);
        if (onNodeClick) onNodeClick(node);
    };

    if (!nodes || nodes.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No roadmap modules yet. Generate your roadmap to get started!</p>
            </div>
        );
    }

    const pathData = generatePath();
    const svgHeight = nodes.length * 180 + 100;

    return (
        <div className="mobile-roadmap-container">
            {/* SVG Curved Path */}
            <svg
                className="mobile-roadmap-path"
                width="200"
                height={svgHeight}
                viewBox={`0 0 200 ${svgHeight}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d={pathData}
                    stroke="var(--border-subtle)"
                    strokeWidth="2"
                    strokeDasharray="10 5"
                    style={{
                        animation: 'dash 1.6s linear infinite'
                    }}
                />
            </svg>

            {/* Nodes */}
            {nodes.map((node, index) => {
                const statusClass = getNodeStatusClass(node);
                const progress = getProgress(node);
                const alignment = getNodeAlignment(index);

                return (
                    <div
                        key={node.id}
                        className={`mobile-roadmap-node ${alignment}`}
                        style={{ marginTop: index === 0 ? '0' : '0' }}
                    >
                        <div style={{ textAlign: 'center', maxWidth: '240px' }}>
                            {/* Node Badge */}
                            <button
                                className={`node-badge ${statusClass}`}
                                onClick={() => handleNodeClick(node)}
                                disabled={statusClass === 'locked'}
                            >
                                <span style={{ fontSize: '32px', marginBottom: '4px' }}>
                                    {statusClass === 'completed' ? '✓' :
                                        statusClass === 'active' ? '▶' : '🔒'}
                                </span>
                                <span style={{
                                    fontSize: '11px',
                                    lineHeight: '1.2',
                                    fontFamily: 'Inter, sans-serif' // Clean font
                                }}>
                                    {node.data.label}
                                </span>
                            </button>

                            {/* Progress Indicator */}
                            <div className="node-progress">
                                <div className="node-progress-bar">
                                    <div
                                        className={`node-progress-fill ${statusClass}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span style={{
                                    color: statusClass === 'completed' ? 'var(--neon-green)' :
                                        statusClass === 'active' ? 'var(--neon-cyan)' :
                                            'var(--text-muted)',
                                    fontSize: '12px',
                                    fontFamily: 'var(--font-code)'
                                }}>
                                    {statusClass === 'completed' ? '100% Complete' :
                                        statusClass === 'active' ? 'Start lesson' :
                                            'Locked'}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Add keyframe animation for dashed path */}
            <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -30;
          }
        }
      `}</style>
        </div>
    );
}
