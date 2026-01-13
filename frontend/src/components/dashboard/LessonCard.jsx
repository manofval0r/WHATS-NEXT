import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle, ExternalLink, PlayCircle, BookOpen, FileText } from 'lucide-react';

export default function LessonCard({ 
  lesson, 
  isCompleted, 
  onToggleComplete, 
  confidenceRating, 
  onConfidenceChange 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPhaseColor = (phase) => {
    if (phase === 1) return '#58a6ff'; // Cyan for Foundations
    if (phase === 2) return '#bc13fe'; // Violet for Intermediate
    if (phase === 3) return '#ffbe0b'; // Gold for Advanced
    return '#8b949e';
  };

  const getResourceIcon = (type) => {
    switch(type) {
      case 'video': return <PlayCircle size={16} />;
      case 'docs': return <BookOpen size={16} />;
      case 'article': return <FileText size={16} />;
      default: return <ExternalLink size={16} />;
    }
  };

  const confidenceLevels = [
    { value: 25, label: '25%', color: '#ff6b6b' },
    { value: 50, label: '50%', color: '#ffd93d' },
    { value: 75, label: '75%', color: '#6bcf7f' },
    { value: 100, label: '100%', color: '#4ecdc4' }
  ];

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            style={styles.checkbox}
          >
            {isCompleted ? (
              <CheckCircle size={20} color="#238636" />
            ) : (
              <Circle size={20} color="#484f58" />
            )}
          </button>

          {/* Lesson Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ 
                fontSize: '11px', 
                fontFamily: 'JetBrains Mono', 
                color: getPhaseColor(lesson.phase),
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}>
                Phase {lesson.phase}
              </span>
              <span style={{ fontSize: '11px', color: '#484f58' }}>•</span>
              <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#8b949e' }}>
                Lesson {lesson.order}
              </span>
            </div>
            <h4 style={styles.title}>{lesson.title}</h4>
          </div>

          {/* XP Badge */}
          <div style={styles.xpBadge}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>
              +{lesson.xp_reward || 20}
            </span>
            <span style={{ fontSize: '9px', color: '#8b949e' }}>XP</span>
          </div>

          {/* Expand Icon */}
          <button style={styles.expandButton}>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={styles.expandedContent}>
          {/* Description */}
          {lesson.description && (
            <p style={styles.description}>{lesson.description}</p>
          )}

          {/* Resources */}
          {lesson.resources && (
            <div style={{ marginTop: '16px' }}>
              <h5 style={styles.sectionTitle}>Resources</h5>
              
              {/* Primary Resource */}
              {lesson.resources.primary && (
                <a 
                  href={lesson.resources.primary.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.primaryResource}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getResourceIcon(lesson.resources.primary.type)}
                    <span>{lesson.resources.primary.title}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#8b949e', fontFamily: 'JetBrains Mono' }}>
                    PRIMARY
                  </span>
                </a>
              )}

              {/* Supplementary Resources */}
              {lesson.resources.supplementary && lesson.resources.supplementary.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '8px', fontFamily: 'JetBrains Mono' }}>
                    SUPPLEMENTARY
                  </div>
                  {lesson.resources.supplementary.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.supplementaryResource}
                    >
                      {getResourceIcon(resource.type)}
                      <span>{resource.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Confidence Rating */}
          {isCompleted && (
            <div style={{ marginTop: '20px' }}>
              <h5 style={styles.sectionTitle}>Confidence Level</h5>
              <div style={styles.confidenceContainer}>
                {confidenceLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => onConfidenceChange(level.value)}
                    style={{
                      ...styles.confidenceButton,
                      background: confidenceRating === level.value 
                        ? `${level.color}20` 
                        : 'rgba(255,255,255,0.03)',
                      borderColor: confidenceRating === level.value 
                        ? level.color 
                        : 'transparent',
                      color: confidenceRating === level.value 
                        ? level.color 
                        : '#8b949e'
                    }}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Completion Timestamp */}
          {isCompleted && lesson.completed_at && (
            <div style={{ marginTop: '12px', fontSize: '11px', color: '#484f58', fontFamily: 'JetBrains Mono' }}>
              Completed: {new Date(lesson.completed_at).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'rgba(22, 27, 34, 0.6)',
    border: '1px solid #30363d',
    borderRadius: '8px',
    marginBottom: '8px',
    transition: 'all 0.2s ease'
  },
  header: {
    padding: '16px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  checkbox: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s'
  },
  title: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '600',
    color: '#e6edf3',
    lineHeight: '1.4'
  },
  xpBadge: {
    background: 'rgba(255, 190, 11, 0.1)',
    border: '1px solid rgba(255, 190, 11, 0.3)',
    borderRadius: '4px',
    padding: '4px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#ffbe0b'
  },
  expandButton: {
    background: 'none',
    border: 'none',
    color: '#8b949e',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  expandedContent: {
    padding: '0 16px 16px',
    borderTop: '1px solid #21262d'
  },
  description: {
    margin: '16px 0 0 0',
    fontSize: '14px',
    color: '#8b949e',
    lineHeight: '1.6'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono',
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  primaryResource: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    background: 'rgba(0, 242, 255, 0.05)',
    border: '1px solid rgba(0, 242, 255, 0.2)',
    borderRadius: '6px',
    color: '#58a6ff',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  supplementaryResource: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '4px',
    color: '#8b949e',
    textDecoration: 'none',
    fontSize: '13px',
    marginBottom: '6px',
    transition: 'all 0.2s'
  },
  confidenceContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px'
  },
  confidenceButton: {
    padding: '8px',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: 'JetBrains Mono',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};
