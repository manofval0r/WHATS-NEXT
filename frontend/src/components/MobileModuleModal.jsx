import { X, ExternalLink, CheckCircle, Send } from 'lucide-react';
import { useState } from 'react';

export default function MobileModuleModal({ node, onClose, onSubmitProject, onMarkComplete }) {
    const [submissionLink, setSubmissionLink] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!node) return null;

    const { data } = node;
    const isCompleted = data.status === 'completed';
    const isActive = data.status === 'active';
    const isLocked = data.status === 'locked';

    const handleSubmit = async () => {
        if (!submissionLink.trim()) {
            alert('Please enter a project link');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmitProject(node.id, submissionLink);
            setSubmissionLink('');
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkComplete = async () => {
        try {
            await onMarkComplete(node.id);
        } catch (error) {
            console.error('Mark complete error:', error);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-dark)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
        }}>
            {/* Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                background: 'rgba(13, 17, 23, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 10
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--neon-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontFamily: 'var(--font-code)',
                        padding: '8px'
                    }}
                >
                    <span style={{ fontSize: '20px' }}>←</span>
                    <span>Back to Roadmap</span>
                </button>

                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        padding: '8px'
                    }}
                >
                    <X size={24} />
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '24px 16px' }}>
                {/* Module Icon & Title */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 16px',
                        background: isCompleted ? 'rgba(138, 92, 254, 0.2)' :
                            isActive ? 'rgba(0, 242, 255, 0.1)' :
                                'var(--bg-surface)',
                        border: isCompleted ? '3px solid var(--neon-purple)' :
                            isActive ? '3px solid var(--neon-cyan)' :
                                '3px solid var(--border-subtle)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px'
                    }}>
                        {isCompleted ? '✓' : isActive ? '▶' : '🔒'}
                    </div>

                    <h1 style={{
                        fontSize: '24px',
                        fontFamily: 'var(--font-code)',
                        color: 'var(--text-header)',
                        marginBottom: '8px'
                    }}>
                        {data.label}
                    </h1>

                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-body)'
                    }}>
                        {data.description || 'Introduction to this module'}
                    </p>
                </div>

                {/* Resources Section */}
                {data.resources && Object.keys(data.resources).length > 0 && (
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{
                            fontSize: '14px',
                            fontFamily: 'var(--font-code)',
                            color: 'var(--text-header)',
                            marginBottom: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Resources
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {Object.entries(data.resources).map(([key, value]) => (
                                <a
                                    key={key}
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px',
                                        background: 'var(--bg-panel)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: 'var(--text-main)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                                        e.currentTarget.style.background = 'rgba(0, 242, 255, 0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                        e.currentTarget.style.background = 'var(--bg-panel)';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            background: 'var(--bg-dark)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px'
                                        }}>
                                            🔗
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: 'var(--text-header)',
                                                marginBottom: '2px'
                                            }}>
                                                {key}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: 'var(--text-muted)'
                                            }}>
                                                External Resource
                                            </div>
                                        </div>
                                    </div>
                                    <ExternalLink size={20} color="var(--neon-cyan)" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description Section */}
                {data.project_prompt && (
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{
                            fontSize: '16px',
                            fontFamily: 'var(--font-code)',
                            color: 'var(--text-header)',
                            marginBottom: '12px'
                        }}>
                            Description
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: 'var(--text-main)',
                            lineHeight: '1.6',
                            fontFamily: 'var(--font-body)'
                        }}>
                            {data.project_prompt}
                        </p>
                    </div>
                )}

                {/* Project Submission (for active modules) */}
                {isActive && !isCompleted && (
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{
                            fontSize: '14px',
                            fontFamily: 'var(--font-code)',
                            color: 'var(--text-header)',
                            marginBottom: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Submit Your Project
                        </h3>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="url"
                                value={submissionLink}
                                onChange={(e) => setSubmissionLink(e.target.value)}
                                placeholder="https://github.com/your-project"
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'var(--bg-panel)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '8px',
                                    color: 'var(--text-main)',
                                    fontSize: '14px',
                                    fontFamily: 'var(--font-body)',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--neon-cyan)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !submissionLink.trim()}
                                style={{
                                    padding: '12px 16px',
                                    background: submitting || !submissionLink.trim() ? 'var(--bg-panel)' : 'var(--neon-cyan)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: submitting || !submissionLink.trim() ? 'var(--text-muted)' : '#000',
                                    cursor: submitting || !submissionLink.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontFamily: 'var(--font-code)',
                                    fontWeight: 'bold'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Action Button */}
            <div style={{
                position: 'sticky',
                bottom: 0,
                background: 'rgba(13, 17, 23, 0.95)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--border-subtle)',
                padding: '16px',
                zIndex: 10
            }}>
                {!isLocked && (
                    <button
                        onClick={handleMarkComplete}
                        disabled={isCompleted}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: isCompleted ? 'var(--bg-surface)' :
                                'linear-gradient(90deg, var(--neon-cyan), var(--electric-purple))',
                            border: isCompleted ? '1px solid var(--border-subtle)' : 'none',
                            borderRadius: '12px',
                            color: isCompleted ? 'var(--text-muted)' : '#000',
                            fontSize: '16px',
                            fontFamily: 'var(--font-code)',
                            fontWeight: 'bold',
                            cursor: isCompleted ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            boxShadow: isCompleted ? 'none' : '0 4px 20px rgba(0, 242, 255, 0.4)'
                        }}
                    >
                        <CheckCircle size={20} />
                        {isCompleted ? 'Completed' : 'Mark Complete'}
                    </button>
                )}
            </div>
        </div>
    );
}
