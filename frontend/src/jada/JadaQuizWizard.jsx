import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trophy, RotateCcw } from 'lucide-react';
import JadaInteractive from './JadaInteractive';
import { useJada } from './JadaContext';

/**
 * JadaQuizWizard — step-through quiz wizard rendered from structured quiz data.
 *
 * Props:
 *   quiz: { title, questions: [{ id, type, question_text, options }] }
 */
export default function JadaQuizWizard({ quiz }) {
  const { sendMessage, setActiveQuiz } = useJada();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const total = quiz.questions.length;

  const handleAnswer = useCallback(
    (answer) => {
      setAnswers((prev) => ({ ...prev, [quiz.questions[step].id]: answer }));
      // Auto-advance after a short delay
      if (step < total - 1) {
        setTimeout(() => setStep((s) => s + 1), 350);
      }
    },
    [step, total, quiz.questions]
  );

  const handleFinish = useCallback(() => {
    setFinished(true);
    // Build a nice summary to send as a message
    const lines = quiz.questions.map((q, i) => {
      const ans = answers[q.id] || '(skipped)';
      return `Q${i + 1}: ${ans}`;
    });
    const summary = `Here are my quiz answers for "${quiz.title}":\n${lines.join('\n')}`;
    sendMessage(summary);
    setTimeout(() => setActiveQuiz(null), 600);
  }, [answers, quiz, sendMessage, setActiveQuiz]);

  const handleReset = useCallback(() => {
    setStep(0);
    setAnswers({});
    setFinished(false);
  }, []);

  const currentQ = quiz.questions[step];
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / total) * 100);

  return (
    <motion.div
      className="jada-quiz"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
    >
      {/* Header */}
      <div className="jada-quiz__header">
        <h4 className="jada-quiz__title">{quiz.title}</h4>
        <span className="jada-quiz__counter">
          {step + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="jada-quiz__progress-track">
        <motion.div
          className="jada-quiz__progress-fill"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step indicators */}
      <div className="jada-quiz__steps">
        {quiz.questions.map((q, i) => (
          <button
            key={q.id}
            className={`jada-quiz__step ${i === step ? 'current' : ''} ${answers[q.id] ? 'done' : ''}`}
            onClick={() => setStep(i)}
            title={`Question ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question area */}
      <AnimatePresence mode="wait">
        {!finished && currentQ && (
          <motion.div
            key={currentQ.id}
            className="jada-quiz__question-area"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <JadaInteractive
              data={{
                type: currentQ.type,
                question_text: currentQ.question_text,
                options: currentQ.options,
                include_other: currentQ.type !== 'boolean',
              }}
              onSubmit={handleAnswer}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="jada-quiz__nav">
        <button
          className="jada-quiz__nav-btn"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ChevronLeft size={16} /> Back
        </button>

        {answered >= total && !finished ? (
          <button className="jada-quiz__nav-btn finish" onClick={handleFinish}>
            <Trophy size={16} /> Finish Quiz
          </button>
        ) : (
          <button
            className="jada-quiz__nav-btn"
            disabled={step >= total - 1}
            onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>

      {finished && (
        <motion.div
          className="jada-quiz__done"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Trophy size={24} />
          <p>Quiz submitted! Jada is reviewing your answers...</p>
          <button className="jada-quiz__nav-btn" onClick={handleReset}>
            <RotateCcw size={14} /> Retake
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
