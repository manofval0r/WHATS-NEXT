import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Terminal } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';

const DailyQuizModal = ({ quizData, onClose, onSubmit, quizLoading, quizResult, quizCompleted }) => {
  const [answers, setAnswers] = useState({});

  const handleOptionSelect = (qIndex, optIndex) => {
    setAnswers(prev => ({
      ...prev,
      [qIndex]: optIndex
    }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  if (quizCompleted) return null; // Or show summary

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Card variant="elevated" style={{ width: '800px', maxWidth: '95vw', height: 'auto', maxHeight: '90vh', display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden' }}>
        
        {/* HEADER */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid var(--void-glow)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--void-deep)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Terminal size={20} color="var(--neon-gold)" />
             <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--neon-gold)' }}>DAILY_ASSESSMENT_PROTOCOL</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X size={20} /></Button>
        </div>

        {/* BODY */}
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
            {quizLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>
                    LOADING_NEURAL_PATTERNS...
                </div>
            ) : quizResult ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-gold)' }}>STREAK EXTENDED</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Knowledge integration successful.</p>
                </div>
            ) : (
                <>
                    <Badge label={quizData?.module || 'GENERAL_KNOWLEDGE'} variant="violet" className="mb-6" />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {quizData?.questions?.map((q, qIdx) => (
                            <div key={qIdx} style={{ animation: `fadeIn 0.5s ease forwards ${qIdx * 0.1}s`, opacity: 0 }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                                    <span style={{ color: 'var(--neon-cyan)', marginRight: '8px' }}>{qIdx + 1}.</span>
                                    {q.question}
                                </h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {q.options.map((opt, optIdx) => (
                                        <div 
                                            key={optIdx}
                                            onClick={() => handleOptionSelect(qIdx, optIdx)}
                                            style={{
                                                padding: '16px',
                                                border: answers[qIdx] === optIdx ? '1px solid var(--neon-cyan)' : '1px solid var(--void-glow)',
                                                borderRadius: 'var(--radius-md)',
                                                background: answers[qIdx] === optIdx ? 'rgba(95, 245, 255, 0.1)' : 'var(--void-mid)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', gap: '12px'
                                            }}
                                        >
                                            <div style={{
                                                width: '16px', height: '16px', borderRadius: '50%',
                                                border: answers[qIdx] === optIdx ? '4px solid var(--neon-cyan)' : '2px solid var(--text-secondary)',
                                                flexShrink: 0
                                            }} />
                                            <span style={{ color: answers[qIdx] === optIdx ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="primary" onClick={handleSubmit} size="lg">
                            SUBMIT ASSESSMENT
                        </Button>
                    </div>
                </>
            )}
        </div>
      </Card>
    </div>
  );
};

export default DailyQuizModal;
