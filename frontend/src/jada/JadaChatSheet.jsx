import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, RotateCcw, Send, ChevronDown, Bot, Sparkles, Settings2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useJada } from './JadaContext';
import api from '../api';
import './JadaChat.css';

const DEFAULT_SUGGESTIONS = [
  'What should I focus on today?',
  'Explain my current module',
  'Quiz me on this topic',
  'Help me plan a project',
];

const AVAILABLE_MODELS = [
  { id: 'auto', label: 'Auto' },
  { id: 'openrouter/aurora-alpha', label: 'Aurora' },
  { id: 'stepfun/step-3.5-flash:free', label: 'Step Flash' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', label: 'Nemotron' },
  { id: 'gemini', label: 'Gemini' },
];

/* ── Custom react-markdown components for chat styling ── */
const markdownComponents = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  ),
  pre: ({ children }) => <pre>{children}</pre>,
  code: ({ inline, className, children, ...props }) => {
    if (inline) return <code {...props}>{children}</code>;
    return <code className={className} {...props}>{children}</code>;
  },
};

export default function JadaChatSheet() {
  const {
    isChatOpen, closeChat, chatMessages, isTyping,
    sendMessage, contextModuleLabel, contextModuleId, startNewChat, suggestions,
    preferredModel, setPreferredModel, lastOptions, setLastOptions, switchModule,
  } = useJada();

  const [input, setInput] = useState('');
  const [showModulePicker, setShowModulePicker] = useState(false);
  const [modules, setModules] = useState(null); // null = not loaded yet
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  /* ── Fetch modules once when chat opens ──────────────── */
  useEffect(() => {
    if (isChatOpen && modules === null) {
      api.post('/api/my-roadmap/', {}, { timeout: 15000 })
        .then((res) => {
          const nodes = res.data?.nodes || res.data?.data?.nodes || [];
          setModules(
            nodes.map((n) => ({
              id: n.id || n.data?.id,
              label: n.data?.label || n.label || 'Module',
              status: n.data?.status || 'active',
            }))
          );
        })
        .catch(() => setModules([]));
    }
  }, [isChatOpen, modules]);

  /* ── Auto-scroll to bottom on new messages ───────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  /* ── Auto-resize textarea ────────────────────────────── */
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [input]);

  /* ── Send handler ────────────────────────────────────── */
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    setLastOptions([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    sendMessage(text);
  }, [input, isTyping, sendMessage, setLastOptions]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleSuggestion = useCallback((text) => {
    setInput('');
    setLastOptions([]);
    sendMessage(text);
  }, [sendMessage, setLastOptions]);

  const handleOptionClick = useCallback((optionText) => {
    setLastOptions([]);
    sendMessage(optionText);
  }, [sendMessage, setLastOptions]);

  const handleModuleSelect = useCallback((mod) => {
    switchModule(mod.id, mod.label);
    setShowModulePicker(false);
  }, [switchModule]);

  if (!isChatOpen) return null;

  const hasMessages = chatMessages.length > 0;

  return (
    <>
      {/* Backdrop (mobile only, CSS hides on desktop) */}
      <motion.div
        className="jada-chat-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeChat}
      />

      {/* Panel */}
      <motion.div
        className="jada-chat-panel"
        role="dialog"
        aria-label="Chat with Jada"
        initial={{ y: '100%', opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 340 }}
      >
        {/* ── Header ───────────────────────────────────── */}
        <div className="jada-chat-header">
          <div className="jada-chat-header-avatar">
            <Bot size={18} color="#fff" />
          </div>
          <div className="jada-chat-header-info">
            <div className="jada-chat-header-title">JADA</div>
            <button
              className="jada-chat-module-pill"
              onClick={() => setShowModulePicker((p) => !p)}
              title="Switch module context"
            >
              <Sparkles size={10} />
              <span>{contextModuleLabel || 'Select module'}</span>
              <ChevronDown size={10} style={{ opacity: 0.6 }} />
            </button>
          </div>
          <div className="jada-chat-header-actions">
            <button
              className="jada-chat-btn"
              onClick={startNewChat}
              title="New conversation"
              aria-label="New conversation"
            >
              <RotateCcw size={14} />
            </button>
            <button
              className="jada-chat-btn"
              onClick={closeChat}
              title="Close chat"
              aria-label="Close chat"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Module Picker Dropdown ───────────────────── */}
        <AnimatePresence>
          {showModulePicker && (
            <motion.div
              className="jada-module-dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {modules && modules.length > 0 ? modules.map((mod) => (
                <button
                  key={mod.id}
                  className={`jada-module-option${String(mod.id) === String(contextModuleId) ? ' active' : ''}`}
                  onClick={() => handleModuleSelect(mod)}
                >
                  <span>{mod.label}</span>
                  <span className={`jada-module-status ${mod.status}`}>{mod.status}</span>
                </button>
              )) : (
                <div style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>
                  {modules === null ? 'Loading modules…' : 'No modules found'}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Messages / Empty state ───────────────────── */}
        {!hasMessages && !isTyping ? (
          <div className="jada-empty">
            <div className="jada-empty-icon">🤖</div>
            <div className="jada-empty-title">Hey, I'm Jada</div>
            <p className="jada-empty-sub">
              Your AI learning companion. Ask me anything about your modules, lessons, or career path.
            </p>
          </div>
        ) : (
          <div className="jada-chat-messages" onClick={() => showModulePicker && setShowModulePicker(false)}>
            {chatMessages.map((msg, i) => (
              <div key={i} className={`jada-msg ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="jada-msg-avatar">
                    <Bot size={13} color="#fff" />
                  </div>
                )}
                <div className="jada-msg-bubble">
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {msg.content || ''}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Interactive option buttons */}
            {lastOptions.length > 0 && !isTyping && (
              <div className="jada-options">
                {lastOptions.map((opt, i) => (
                  <button
                    key={i}
                    className="jada-option-btn"
                    onClick={() => handleOptionClick(opt)}
                  >
                    <span className="jada-option-num">{i + 1}</span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="jada-msg assistant">
                <div className="jada-msg-avatar">
                  <Bot size={13} color="#fff" />
                </div>
                <div className="jada-msg-bubble">
                  <div className="jada-typing-dots">
                    <span className="jada-typing-dot" />
                    <span className="jada-typing-dot" />
                    <span className="jada-typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ── Suggestion chips (horizontal scroll) ─────── */}
        {(() => {
          const chips = (suggestions && suggestions.length > 0)
            ? suggestions
            : (chatMessages.length < 2 ? DEFAULT_SUGGESTIONS : []);
          if (chips.length === 0 || isTyping) return null;
          return (
            <div className="jada-suggestions">
              {chips.map((s) => (
                <button
                  key={s}
                  className="jada-suggestion-chip"
                  onClick={() => handleSuggestion(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          );
        })()}

        {/* ── Model selector row ───────────────────────── */}
        <div className="jada-model-selector">
          <Settings2 size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
          <div className="jada-model-pills">
            {AVAILABLE_MODELS.map((m) => (
              <button
                key={m.id}
                className={`jada-model-pill${preferredModel === m.id ? ' active' : ''}`}
                onClick={() => setPreferredModel(m.id)}
                title={m.id === 'auto' ? 'Auto-select fastest available model' : m.id}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Input area ───────────────────────────────── */}
        <div className="jada-chat-input-area">
          <textarea
            ref={textareaRef}
            className="jada-chat-textarea"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Jada anything..."
            disabled={isTyping}
          />
          <button
            className="jada-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </motion.div>
    </>
  );
}
