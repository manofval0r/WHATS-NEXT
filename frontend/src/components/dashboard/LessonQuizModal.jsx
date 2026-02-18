import React, { useCallback, useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Award, Terminal, Loader } from 'lucide-react';
import { useJada } from '../../jada/JadaContext';
import { startLessonQuiz, submitLessonQuiz } from '../../api';

/**
 * LessonQuizModal — 5-MCQ quiz gate for lesson completion.
 * ≥ 70% = pass → lesson marked complete, +20 XP, Jada celebrates.
 */
export default function LessonQuizModal({ itemId, lessonId, lessonTitle, onClose, onPass }) {
  const jada = useJada();

  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { passed, score, total, explanations }

  /* ── Acquire fullscreen overlay lock ─────────────────────── */
  useEffect(() => {
    const release = jada.acquireFullscreenOverlay();
    return () => release();
  }, [jada]);

  /* ── Load quiz questions ─────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await startLessonQuiz(itemId, lessonId);
        if (!cancelled) setQuestions(res.data.questions || []);
      } catch (err) {
        if (!cancelled) setError('Failed to generate quiz. Try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [itemId, lessonId]);

  /* ── Select answer ───────────────────────────────────────── */
  const handleSelect = useCallback((qIdx, optIdx) => {
    if (result) return; // locked after submit
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  }, [result]);

  /* ── Submit answers ──────────────────────────────────────── */
  const handleSubmit = useCallback(async () => {
    if (!questions) return;
    setSubmitting(true);
    try {
      const res = await submitLessonQuiz(itemId, lessonId, answers);
      const d = res.data;
      setResult({
        passed: d.passed,
        score: d.score,
        total: d.total,
        xp_awarded: d.xp_awarded,
        explanations: d.explanations || [],
      });
      if (d.passed) {
        jada.celebrate('Quiz passed! +20 XP 🎉');
        if (onPass) onPass();
      } else {
        jada.nudge('Almost there — review and try again!', 'warm');
      }
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [questions, answers, itemId, lessonId, jada, onPass]);

  const allAnswered = questions && Object.keys(answers).length === questions.length;

  return (
    <div
      style={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Quiz: ${lessonTitle}`}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Terminal size={18} color="var(--neon-cyan)" />
            <span style={styles.headerTitle}>LESSON_QUIZ</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {lessonTitle && (
              <span style={styles.lessonLabel}>{lessonTitle}</span>
            )}
            <button onClick={onClose} style={styles.closeBtn} aria-label="Close quiz">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {loading ? (
            <div style={styles.center}>
              <Loader size={28} className="spin" color="var(--neon-cyan)" />
              <p style={styles.loadingText}>Generating quiz...</p>
            </div>
          ) : error ? (
            <div style={styles.center}>
              <XCircle size={32} color="var(--neon-red, #ef4444)" />
              <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>{error}</p>
              <button onClick={onClose} style={styles.retryBtn}>Close</button>
            </div>
          ) : result ? (
            /* ── Results ─────────────────────────────────── */
            <div>
              <div style={styles.resultHeader}>
                {result.passed ? (
                  <>
                    <Award size={48} color="var(--neon-gold, #ffbe0b)" />
                    <h3 style={styles.resultTitle}>QUIZ PASSED</h3>
                    <p style={styles.resultSub}>
                      {result.score}/{result.total} correct • +{result.xp_awarded || 20} XP
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle size={48} color="var(--neon-red, #ef4444)" />
                    <h3 style={{ ...styles.resultTitle, color: 'var(--neon-red, #ef4444)' }}>NOT YET</h3>
                    <p style={styles.resultSub}>
                      {result.score}/{result.total} correct — need {Math.ceil(result.total * 0.7)}+ to pass
                    </p>
                  </>
                )}
              </div>

              {/* Explanations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
                {questions.map((q, i) => {
                  const userAnswer = answers[i];
                  const explanation = result.explanations[i];
                  const isCorrect = explanation?.is_correct;
                  return (
                    <div key={i} style={{ ...styles.questionCard, borderColor: isCorrect ? 'rgba(57,211,83,0.3)' : 'rgba(239,68,68,0.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {isCorrect
                          ? <CheckCircle size={16} color="#39d353" />
                          : <XCircle size={16} color="#ef4444" />
                        }
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Q{i + 1}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{q.question}</p>
                      {!isCorrect && explanation?.explanation && (
                        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, fontStyle: 'italic' }}>
                          {explanation.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                {!result.passed && (
                  <button
                    onClick={() => {
                      setResult(null);
                      setAnswers({});
                      setLoading(true);
                      startLessonQuiz(itemId, lessonId)
                        .then(res => setQuestions(res.data.questions || []))
                        .catch(() => setError('Failed to regenerate quiz'))
                        .finally(() => setLoading(false));
                    }}
                    style={styles.retryBtn}
                  >
                    Try Again
                  </button>
                )}
                <button onClick={onClose} style={styles.submitBtn}>
                  {result.passed ? 'Done' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            /* ── Questions ───────────────────────────────── */
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {questions.map((q, qIdx) => (
                  <div key={qIdx} style={styles.questionCard}>
                    <h4 style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--neon-cyan)', marginRight: 6 }}>{qIdx + 1}.</span>
                      {q.question}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} role="radiogroup">
                      {q.options.map((opt, optIdx) => {
                        const selected = answers[qIdx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelect(qIdx, optIdx)}
                            role="radio"
                            aria-checked={selected}
                            style={{
                              ...styles.optionBtn,
                              background: selected ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.03)',
                              borderColor: selected ? 'var(--neon-cyan, #06b6d4)' : 'var(--border-subtle, rgba(255,255,255,0.1))',
                            }}
                          >
                            <div style={{
                              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                              border: selected ? '4px solid var(--neon-cyan)' : '2px solid var(--text-secondary)',
                            }} />
                            <span style={{ color: selected ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 13 }}>
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  style={{
                    ...styles.submitBtn,
                    opacity: (!allAnswered || submitting) ? 0.5 : 1,
                    cursor: (!allAnswered || submitting) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Answers'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 3000,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  panel: {
    width: 700,
    maxWidth: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--panel-bg, rgba(15, 15, 25, 0.95))',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    color: 'var(--neon-cyan, #06b6d4)',
    fontSize: 14,
  },
  lessonLabel: {
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  body: {
    padding: 28,
    overflowY: 'auto',
    flex: 1,
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: 'var(--neon-cyan)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
  },
  resultHeader: {
    textAlign: 'center',
    paddingBottom: 20,
    borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
  },
  resultTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    color: 'var(--neon-gold, #ffbe0b)',
    margin: '12px 0 4px',
  },
  resultSub: {
    margin: 0,
    fontSize: 13,
    color: 'var(--text-secondary)',
  },
  questionCard: {
    padding: 16,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
    borderRadius: 12,
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    border: '1px solid',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
    width: '100%',
  },
  submitBtn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, var(--neon-cyan, #06b6d4), var(--neon-violet, #bc13fe))',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  retryBtn: {
    padding: '12px 28px',
    background: 'transparent',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
    borderRadius: 12,
    color: 'var(--text-primary)',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
};
