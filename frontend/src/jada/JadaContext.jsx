import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { emitJadaEvent, onJadaEvent } from './jadaEvents';

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

  const [mode, setMode] = useState('idle'); // idle | thinking | success | error | celebrate
  const [speech, setSpeech] = useState(null); // { text, tone }
  const [anchor, setAnchor] = useState(DEFAULT_ROUTE_PROFILE.anchor);
  const [sizePx, setSizePx] = useState(DEFAULT_ROUTE_PROFILE.sizePx);

  const pendingRequestsRef = useRef(new Set());
  const thinkingDelayRef = useRef(null);

  const fullscreenOverlayCountRef = useRef(0);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const profile = routeProfileForPathname(location.pathname);
    setAnchor(profile.anchor);

    // Slightly shrink on small screens.
    const isSmall = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    setSizePx(isSmall ? clamp(profile.sizePx - 18, 92, 150) : profile.sizePx);

    // Landing gets a little greeting.
    if (location.pathname === '/') {
      setSpeech({ text: 'Build your next move — I\'ll guide you.', tone: 'warm' });
      setMode('idle');
    }
  }, [location.pathname]);

  useEffect(() => {
    const offStart = onJadaEvent('request:start', ({ id, hint }) => {
      if (!id) return;
      pendingRequestsRef.current.add(id);

      // Don’t instantly flip to thinking (avoids flicker on fast requests).
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

    return () => {
      offStart();
      offEnd();
      offSpeak();
    };
  }, []);

  const api = useMemo(() => {
    return {
      mode,
      speech,
      anchor,
      sizePx,
      isHidden,

      setSpeech: (text, tone = 'neutral') => {
        setSpeech(text ? { text, tone } : null);
      },

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

      // For simple toggles (not reference-counted).
      setHidden: (hidden) => {
        fullscreenOverlayCountRef.current = hidden ? Math.max(1, fullscreenOverlayCountRef.current) : 0;
        setIsHidden(hidden);
      },
    };
  }, [anchor, isHidden, mode, sizePx, speech]);

  return <JadaContext.Provider value={api}>{children}</JadaContext.Provider>;
}

export function useJada() {
  const ctx = useContext(JadaContext);
  if (!ctx) {
    throw new Error('useJada must be used within <JadaProvider>');
  }
  return ctx;
}
