import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, ArrowRight } from 'lucide-react';
import { jadaChatGuest } from '../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './JadaGuestBubble.css';

const GUEST_SESSION_KEY = 'jada_guest_session';

function getOrCreateSessionId() {
  let sid = sessionStorage.getItem(GUEST_SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(GUEST_SESSION_KEY, sid);
  }
  return sid;
}

export function getGuestSessionId() {
  return sessionStorage.getItem(GUEST_SESSION_KEY);
}

export default function JadaGuestBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'jada',
      content:
        "Hey! I'm **JADA**, your AI career consultant. Tell me a bit about yourself and I'll recommend the perfect tech career path for you!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || limitReached) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const sid = getOrCreateSessionId();
      const res = await jadaChatGuest(text, sid, conversationId);
      const data = res.data;

      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      setMessages((prev) => [...prev, { role: 'jada', content: data.reply }]);
    } catch (err) {
      if (err?.response?.status === 429) {
        setLimitReached(true);
        setMessages((prev) => [
          ...prev,
          {
            role: 'jada',
            content:
              "You've reached the guest message limit. **Sign up for free** to continue our conversation and get your personalized roadmap!",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'jada', content: "Sorry, I'm having trouble connecting right now. Try again in a moment!" },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [input, loading, limitReached, conversationId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Bubble Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            className="jada-guest-fab"
            onClick={() => setOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Chat with JADA"
          >
            <Sparkles size={22} />
            <span className="fab-label">Ask JADA</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="jada-guest-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="jada-guest-header">
              <div className="jada-guest-header-info">
                <div className="jada-guest-avatar">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="jada-guest-name">JADA</span>
                  <span className="jada-guest-role">Career Consultant</span>
                </div>
              </div>
              <button className="jada-guest-close" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="jada-guest-messages" ref={scrollRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`jada-guest-msg ${msg.role}`}>
                  {msg.role === 'jada' && (
                    <div className="jada-guest-msg-avatar">
                      <Sparkles size={12} />
                    </div>
                  )}
                  <div className="jada-guest-msg-bubble">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="jada-guest-msg jada">
                  <div className="jada-guest-msg-avatar">
                    <Sparkles size={12} />
                  </div>
                  <div className="jada-guest-msg-bubble typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}

              {limitReached && (
                <div className="jada-guest-signup-cta">
                  <a href="/signup" className="jada-guest-signup-btn">
                    Sign Up Free <ArrowRight size={16} />
                  </a>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="jada-guest-input-bar">
              <input
                ref={inputRef}
                type="text"
                placeholder={limitReached ? 'Sign up to continue...' : 'Ask about career paths...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || limitReached}
                maxLength={2000}
              />
              <button
                className="jada-guest-send"
                onClick={sendMessage}
                disabled={!input.trim() || loading || limitReached}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
