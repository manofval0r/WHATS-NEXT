import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { emitJadaEvent, onJadaEvent } from './jadaEvents';
import { jadaChat as jadaChatApi, jadaConversationDetail, jadaSwitchContext as jadaSwitchContextApi } from '../api';

const JadaContext = createContext(null);

const DEFAULT_ROUTE_PROFILE = {
  anchor: 'right',
  sizePx: 132,
};

function routeProfileForPathname(pathname) {
  if (pathname === '/') {
    return { anchor: 'right', sizePx: 148 };
  }
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/roadmap') || pathname.startsWith('/module')) {
    return { anchor: 'left', sizePx: 132 };
  }
  if (pathname.startsWith('/community') || pathname.startsWith('/resources')) {
    return { anchor: 'right', sizePx: 124 };
  }
  return DEFAULT_ROUTE_PROFILE;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function JadaProvider({ children }) {
  const location = useLocation();

  const [mode, setMode] = useState('idle');
  const [speech, setSpeech] = useState(null);
  const [anchor, setAnchor] = useState(DEFAULT_ROUTE_PROFILE.anchor);
  const [sizePx, setSizePx] = useState(DEFAULT_ROUTE_PROFILE.sizePx);

  const pendingRequestsRef = useRef(new Set());
  const thinkingDelayRef = useRef(null);
  const fullscreenOverlayCountRef = useRef(0);
  const [isHidden, setIsHidden] = useState(false);

  /* ── Chat state ──────────────────────────────────────────────── */
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [contextModuleId, setContextModuleId] = useState(null);
  const [contextModuleLabel, setContextModuleLabel] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [preferredModel, setPreferredModel] = useState('auto');
  const [lastInteractive, setLastInteractive] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  /* ── Route-based avatar positioning ──────────────────────────── */
  useEffect(() => {
    const profile = routeProfileForPathname(location.pathname);
    setAnchor(profile.anchor);
    const isSmall = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 768px)').matches;
    setSizePx(isSmall ? clamp(profile.sizePx - 18, 92, 150) : profile.sizePx);

    if (location.pathname === '/') {
      setSpeech({ text: 'Build your next move — I\'ll guide you.', tone: 'warm' });
      setMode('idle');
    }
  }, [location.pathname]);

  /* ── Event bus listeners ─────────────────────────────────────── */
  useEffect(() => {
    const offStart = onJadaEvent('request:start', ({ id, hint }) => {
      if (!id) return;
      pendingRequestsRef.current.add(id);
      if (!thinkingDelayRef.current) {
        thinkingDelayRef.current = window.setTimeout(() => {
          thinkingDelayRef.current = null;
          if (pendingRequestsRef.current.size > 0) setMode('thinking');
        }, 250);
      }
      if (hint?.text) setSpeech({ text: hint.text, tone: hint.tone || 'neutral' });
    });

    const offEnd = onJadaEvent('request:end', ({ id, ok }) => {
      if (id) pendingRequestsRef.current.delete(id);
      if (pendingRequestsRef.current.size === 0) {
        if (thinkingDelayRef.current) {
          window.clearTimeout(thinkingDelayRef.current);
          thinkingDelayRef.current = null;
        }
        if (ok === false) {
          setMode('error');
          setSpeech({ text: 'That didn\'t land. Want to try again?', tone: 'error' });
          window.setTimeout(() => setMode('idle'), 1200);
        } else if (ok === true) {
          setMode('success');
          window.setTimeout(() => setMode('idle'), 700);
        } else {
          setMode('idle');
        }
      }
    });

    const offSpeak = onJadaEvent('speech', ({ text, tone }) => {
      if (!text) return;
      setSpeech({ text, tone: tone || 'neutral' });
    });

    return () => { offStart(); offEnd(); offSpeak(); };
  }, []);

  /* ── Chat methods ────────────────────────────────────────────── */

  const openChat = useCallback(async (moduleId = null) => {
    setIsChatOpen(true);
    if (moduleId) setContextModuleId(moduleId);

    if (activeConversationId) {
      try {
        const res = await jadaConversationDetail(activeConversationId);
        setChatMessages(
          (res.data.messages || [])
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role === 'jada' ? 'assistant' : m.role, content: m.content, created_at: m.created_at }))
        );
        if (res.data.module) setContextModuleLabel(res.data.module);
      } catch { /* fresh chat */ }
    }
  }, [activeConversationId]);

  const closeChat = useCallback(() => setIsChatOpen(false), []);

  const toggleExpand = useCallback(() => setIsExpanded((v) => !v), []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    setChatMessages((prev) => [...prev, { role: 'user', content: text, created_at: new Date().toISOString() }]);
    setIsTyping(true);
    setSuggestions([]);
    setLastInteractive(null);
    setActiveQuiz(null);

    try {
      const res = await jadaChatApi(text, activeConversationId, 'general', contextModuleId, preferredModel);
      const d = res.data;
      if (d.conversation_id && d.conversation_id !== activeConversationId) setActiveConversationId(d.conversation_id);
      if (d.module_label) setContextModuleLabel(d.module_label);
      if (d.module_id) setContextModuleId(d.module_id);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: d.reply, created_at: new Date().toISOString() }]);
      if (d.suggestions && d.suggestions.length > 0) setSuggestions(d.suggestions);
      if (d.interactive) setLastInteractive(d.interactive);
      if (d.quiz) setActiveQuiz(d.quiz);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I couldn't connect. Try again shortly.", created_at: new Date().toISOString() }]);
    } finally {
      setIsTyping(false);
    }
  }, [activeConversationId, contextModuleId, preferredModel]);

  const switchModule = useCallback(async (moduleId, moduleLabel = null) => {
    setContextModuleId(moduleId);
    if (moduleLabel) setContextModuleLabel(moduleLabel);
    if (activeConversationId && moduleId) {
      try {
        const res = await jadaSwitchContextApi(activeConversationId, moduleId);
        if (res.data.module_label) setContextModuleLabel(res.data.module_label);
        setChatMessages((prev) => [...prev, { role: 'system', content: `Context switched to: ${res.data.module_label || moduleLabel}`, created_at: new Date().toISOString() }]);
      } catch { /* silent */ }
    }
  }, [activeConversationId]);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setChatMessages([]);
    setSuggestions([]);
    setLastInteractive(null);
    setActiveQuiz(null);
  }, []);

  /* ── Exposed API ─────────────────────────────────────────────── */

  const api = useMemo(() => ({
    mode, speech, anchor, sizePx, isHidden,

    // Chat state
    isChatOpen, chatMessages, activeConversationId, contextModuleId, contextModuleLabel, isTyping, suggestions, preferredModel,
    lastInteractive, activeQuiz, isExpanded,

    // Chat methods
    openChat, closeChat, sendMessage, switchModule, startNewChat, setPreferredModel,
    setLastInteractive, setActiveQuiz, toggleExpand,

    setSpeech: (text, tone = 'neutral') => setSpeech(text ? { text, tone } : null),
    nudge: (text, tone = 'neutral') => emitJadaEvent('speech', { text, tone }),
    setMode: (nextMode) => setMode(nextMode),

    celebrate: (text = 'Nice.') => {
      setMode('celebrate');
      setSpeech({ text, tone: 'success' });
      window.setTimeout(() => setMode('idle'), 1200);
    },

    acquireFullscreenOverlay: () => {
      fullscreenOverlayCountRef.current += 1;
      setIsHidden(true);
      let released = false;
      return () => {
        if (released) return;
        released = true;
        fullscreenOverlayCountRef.current = Math.max(0, fullscreenOverlayCountRef.current - 1);
        if (fullscreenOverlayCountRef.current === 0) setIsHidden(false);
      };
    },

    setHidden: (hidden) => {
      fullscreenOverlayCountRef.current = hidden ? Math.max(1, fullscreenOverlayCountRef.current) : 0;
      setIsHidden(hidden);
    },
  }), [anchor, isHidden, mode, sizePx, speech, isChatOpen, chatMessages, activeConversationId, contextModuleId, contextModuleLabel, isTyping, preferredModel, lastInteractive, activeQuiz, isExpanded, openChat, closeChat, sendMessage, switchModule, startNewChat, toggleExpand]);

  return <JadaContext.Provider value={api}>{children}</JadaContext.Provider>;
}

export function useJada() {
  const ctx = useContext(JadaContext);
  if (!ctx) throw new Error('useJada must be used within <JadaProvider>');
  return ctx;
}
