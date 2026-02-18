import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ToggleLeft, ToggleRight, Send } from 'lucide-react';
import { useJada } from './JadaContext';

/**
 * JadaInteractive — renders structured interactive question cards.
 *
 * Props:
 *   data: { type: 'single'|'multi'|'boolean', question_text, options: [{label,description}], include_other }
 *   onSubmit(answer: string): called when the user confirms their selection
 */
export default function JadaInteractive({ data, onSubmit }) {
  const { sendMessage, setLastInteractive } = useJada();
  const [selected, setSelected] = useState(data.type === 'multi' ? [] : null);
  const [otherText, setOtherText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = useCallback(
    (label) => {
      if (submitted) return;
      if (data.type === 'multi') {
        setSelected((prev) =>
          prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
        );
      } else {
        setSelected(label);
      }
    },
    [data.type, submitted]
  );

  const handleSubmit = useCallback(() => {
    if (submitted) return;

    let answer = '';
    if (data.type === 'multi') {
      const parts = [...selected];
      if (otherText.trim()) parts.push(otherText.trim());
      if (parts.length === 0) return;
      answer = parts.join(', ');
    } else if (selected === '__other__') {
      if (!otherText.trim()) return;
      answer = otherText.trim();
    } else {
      if (!selected) return;
      answer = selected;
    }

    setSubmitted(true);
    if (onSubmit) {
      onSubmit(answer);
    } else {
      sendMessage(answer);
      setLastInteractive(null);
    }
  }, [submitted, data.type, selected, otherText, onSubmit, sendMessage, setLastInteractive]);

  const isReady =
    data.type === 'multi'
      ? selected.length > 0 || otherText.trim()
      : selected === '__other__'
        ? otherText.trim()
        : !!selected;

  return (
    <motion.div
      className="jada-interactive"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {data.question_text && (
        <p className="jada-interactive__question">{data.question_text}</p>
      )}

      <div className="jada-interactive__options">
        {data.options.map((opt, i) => {
          const isActive =
            data.type === 'multi' ? selected.includes(opt.label) : selected === opt.label;

          return (
            <motion.button
              key={opt.label}
              className={`jada-interactive__card ${isActive ? 'active' : ''} ${submitted ? 'locked' : ''}`}
              onClick={() => handleSelect(opt.label)}
              disabled={submitted}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="jada-interactive__indicator">
                {data.type === 'boolean' ? (
                  isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />
                ) : data.type === 'multi' ? (
                  isActive ? <CheckCircle2 size={18} /> : <Circle size={18} />
                ) : (
                  <span className={`jada-interactive__radio ${isActive ? 'filled' : ''}`} />
                )}
              </span>
              <span className="jada-interactive__label">
                <strong>{opt.label}</strong>
                {opt.description && (
                  <span className="jada-interactive__desc">{opt.description}</span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>

      {data.include_other && !submitted && (
        <motion.div
          className="jada-interactive__other"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: data.options.length * 0.05 + 0.1 }}
        >
          <input
            type="text"
            placeholder="Other — type your answer..."
            value={otherText}
            onChange={(e) => {
              setOtherText(e.target.value);
              if (data.type !== 'multi') setSelected(e.target.value ? '__other__' : null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && isReady && handleSubmit()}
            disabled={submitted}
          />
        </motion.div>
      )}

      {!submitted && (
        <motion.button
          className={`jada-interactive__submit ${isReady ? 'ready' : ''}`}
          onClick={handleSubmit}
          disabled={!isReady}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Send size={14} />
          <span>Submit</span>
        </motion.button>
      )}

      {submitted && (
        <motion.div
          className="jada-interactive__confirmed"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle2 size={16} />
          <span>
            {data.type === 'multi'
              ? `Selected: ${[...selected, otherText.trim()].filter(Boolean).join(', ')}`
              : selected === '__other__'
                ? otherText.trim()
                : selected}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
