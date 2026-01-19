// Lightweight event bus (no React imports) so non-React modules (like api.js)
// can drive JADA state without circular dependencies.

const listenersByType = new Map();

export function onJadaEvent(type, handler) {
  if (!listenersByType.has(type)) listenersByType.set(type, new Set());
  const listeners = listenersByType.get(type);
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
    if (listeners.size === 0) listenersByType.delete(type);
  };
}

export function emitJadaEvent(type, payload) {
  const listeners = listenersByType.get(type);
  if (!listeners || listeners.size === 0) return;
  // Copy to avoid issues if a listener unsubscribes during emit.
  [...listeners].forEach((handler) => {
    try {
      handler(payload);
    } catch {
      // Intentionally swallow to avoid breaking app flows.
    }
  });
}
