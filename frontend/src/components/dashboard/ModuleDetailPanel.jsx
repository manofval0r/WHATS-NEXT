import React, { useState } from 'react';
import { X, ExternalLink, PlayCircle, BookOpen, Code, CheckCircle } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Card from '../common/Card';
import LessonCard from './LessonCard';

const ModuleDetailPanel = ({ node, onClose, onSubmitProject, submissionLink, setSubmissionLink, submitting }) => {
  const [showMore, setShowMore] = useState(false);

  if (!node) return null;

  const { data } = node;
  const isCompleted = data.status === 'completed';

  // Lesson handlers (will connect to API later)
  const handleLessonToggle = (lessonId) => {
    console.log('Toggle lesson:', lessonId);
    // TODO: API call to mark lesson complete/incomplete
  };

  const handleConfidenceChange = (lessonId, rating) => {
    console.log('Confidence rating:', lessonId, rating);
    // TODO: API call to update confidence rating
  };

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0,
      width: '600px', maxWidth: '50%',
      background: 'rgba(13, 10, 31, 0.95)', // void-deep with high opacity
      borderLeft: '1px solid var(--void-glow)',
      backdropFilter: 'blur(20px)',
      transform: node ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: 20, display: 'flex', flexDirection: 'column',
      boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h2 style={{
              margin: '0 0 8px 0',
              fontSize: '24px',
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              textTransform: 'uppercase'
            }}>
              Module_{(data.step_order || 0).toString().padStart(2, '0')}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Badge 
                  label={data.status} 
                  variant={isCompleted ? 'gold' : 'cyan'} 
               />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* DESCRIPTION */}
          <div>
            <h3 style={{
              fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px',
              fontFamily: 'var(--font-mono)', letterSpacing: '1px'
            }}>
               // TRANSMISSION_DATA
            </h3>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
              {data.description}
            </p>
          </div>

          {/* LESSONS */}
          {data.lessons && data.lessons.length > 0 && (
            <div>
              <h3 style={{
                fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px',
                fontFamily: 'var(--font-mono)', letterSpacing: '1px'
              }}>
                // MICRO_LEARNING_UNITS
              </h3>
              
              {/* Phase-based organization */}
              {[1, 2, 3].map(phase => {
                const phaseLessons = data.lessons.filter(l => l.phase === phase);
                if (phaseLessons.length === 0) return null;
                
                const phaseNames = {
                  1: 'FOUNDATIONS',
                  2: 'INTERMEDIATE',
                  3: 'ADVANCED'
                };
                
                const phaseColors = {
                  1: '#58a6ff',
                  2: '#bc13fe',
                  3: '#ffbe0b'
                };
                
                return (
                  <div key={phase} style={{ marginBottom: '24px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: phaseColors[phase],
                      marginBottom: '12px',
                      fontWeight: 'bold',
                      letterSpacing: '0.5px'
                    }}>
                      PHASE {phase}: {phaseNames[phase]}
                    </div>
                    
                    {phaseLessons.slice(0, showMore ? undefined : 5).map(lesson => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        isCompleted={lesson.is_completed}
                        onToggleComplete={() => handleLessonToggle(lesson.id)}
                        confidenceRating={lesson.confidence_rating}
                        onConfidenceChange={(rating) => handleConfidenceChange(lesson.id, rating)}
                      />
                    ))}
                    
                    {!showMore && phaseLessons.length > 5 && (
                      <button
                        onClick={() => setShowMore(true)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid #30363d',
                          borderRadius: '6px',
                          color: 'var(--neon-cyan)',
                          fontSize: '12px',
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                          marginTop: '8px'
                        }}
                      >
                        + SHOW {phaseLessons.length - 5} MORE LESSONS
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* RESOURCES */}
          {data.resources && (
            <div>
              <h3 style={{
                 fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px',
                 fontFamily: 'var(--font-mono)', letterSpacing: '1px'
              }}>
                // KNOWLEDGE_BASE
              </h3>

              {/* PRIMARY */}
              {data.resources.primary && data.resources.primary.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                  {data.resources.primary.map((resource, idx) => (
                    <Card key={resource.url || idx} variant="glass" className="resource-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                       <div style={{ color: 'var(--neon-cyan)', opacity: 0.8 }}>
                          {resource.type === 'interactive' && <Code size={24} />}
                          {resource.type === 'docs' && <BookOpen size={24} />}
                          {resource.type === 'video' && <PlayCircle size={24} />}
                          {resource.type === 'course' && <ExternalLink size={24} />}
                       </div>
                       <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{resource.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                             {resource.type.toUpperCase()} • RECOMMENDED
                          </div>
                       </a>
                    </Card>
                  ))}
                </div>
              )}

              {/* ADDITIONAL */}
              {data.resources.additional && data.resources.additional.length > 0 && (
                <>
                  {showMore && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                      {data.resources.additional.map((resource, idx) => (
                        <a key={resource.url || idx} href={resource.url} target="_blank" rel="noopener noreferrer" style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                            background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)',
                            color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.2s'
                        }}>
                             <ExternalLink size={14} />
                             <span style={{ fontSize: '14px' }}>{resource.title}</span>
                        </a>
                      ))}
                      </div>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setShowMore(!showMore)} className="w-full mt-2">
                    {showMore ? '- COLLAPSE_ARCHIVES' : `+ ACCESS_ARCHIVES [${data.resources.additional.length}]`}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* PROJECT SUBMISSION */}
          {data.verification_project && !isCompleted && (
             <div>
                <h3 style={{
                    fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px',
                    fontFamily: 'var(--font-mono)', letterSpacing: '1px'
                 }}>
                   // VERIFICATION_PROTOCOL
                 </h3>
                 <Card variant="elevated">
                    <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--neon-gold)', display: 'block', marginBottom: '8px' }}>Mission Objective:</strong>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{data.verification_project.title || "Build a project demonstrating these skills."}</p>
                    </div>
                    {/* Placeholder for input - simplified for this component */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            placeholder="https://github.com/username/project"
                            value={submissionLink}
                            onChange={(e) => setSubmissionLink(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'var(--void-deep)',
                                border: '1px solid var(--void-glow)',
                                color: 'var(--text-primary)',
                                padding: '10px',
                                borderRadius: 'var(--radius-md)',
                                outline: 'none'
                            }}
                        />
                        <Button variant="primary" onClick={onSubmitProject} disabled={submitting}>
                            {submitting ? 'VERIFYING...' : 'INITIATE'}
                        </Button>
                    </div>
                 </Card>
             </div>
          )}
          
          {isCompleted && (
              <Card variant="standard" style={{ borderColor: 'var(--neon-green)', background: 'rgba(46, 160, 67, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--neon-green)' }}>
                      <CheckCircle size={24} />
                      <span style={{ fontWeight: 600 }}>MODULE_VERIFIED</span>
                  </div>
              </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default ModuleDetailPanel;
