/**
 * PostHog React Provider
 * =======================
 * Wraps the app to provide PostHog context and automatic page-view tracking.
 * Also exposes `usePostHogIdentify()` — call after login/signup to link the
 * anonymous session to a known user.
 *
 * Usage:
 *   <PostHogProvider>
 *     <App />
 *   </PostHogProvider>
 */
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import posthog from './posthog';

/* ─── Thin wrapper context for our custom helpers ─── */
const PHCtx = createContext(null);

function PHInner({ children }) {
  const ph = usePostHog();

  /**
   * Call after login / signup / OAuth callback to tie the anonymous session
   * to the authenticated user.
   *
   * @param {string|number} userId
   * @param {object}        traits   e.g. { email, username, plan_tier, target_career }
   */
  const identify = useCallback(
    (userId, traits = {}) => {
      if (!ph) return;
      ph.identify(String(userId), traits);
    },
    [ph],
  );

  /** Call on logout to un-link the session. */
  const reset = useCallback(() => {
    if (!ph) return;
    ph.reset();
  }, [ph]);

  /**
   * Convenience capture — delegates to posthog.capture but guards against
   * missing key (local dev without .env).
   */
  const capture = useCallback(
    (event, properties = {}) => {
      if (!ph) return;
      ph.capture(event, properties);
    },
    [ph],
  );

  /**
   * Check a PostHog feature flag. Returns the flag value (boolean / string)
   * or `undefined` if flags haven't loaded yet.
   */
  const featureFlag = useCallback(
    (flagKey) => {
      if (!ph) return undefined;
      return ph.isFeatureEnabled(flagKey);
    },
    [ph],
  );

  const value = useMemo(
    () => ({ identify, reset, capture, featureFlag }),
    [identify, reset, capture, featureFlag],
  );

  return <PHCtx.Provider value={value}>{children}</PHCtx.Provider>;
}

/** Main provider — wraps the whole tree with PostHog + our helper context. */
export default function PostHogAppProvider({ children }) {
  /* If PostHog wasn't initialised (no key), just render children. */
  if (!posthog.__loaded) {
    return <>{children}</>;
  }
  return (
    <PHProvider client={posthog}>
      <PHInner>{children}</PHInner>
    </PHProvider>
  );
}

/**
 * Hook: access PostHog helpers from anywhere inside the tree.
 * Returns `{ identify, reset, capture, featureFlag }`.
 * All methods are safe-to-call no-ops when PostHog is disabled.
 */
export function usePostHogApp() {
  const ctx = useContext(PHCtx);
  /* Fallback no-ops when provider is absent (e.g. PostHog key not set) */
  if (!ctx) {
    return {
      identify: () => {},
      reset: () => {},
      capture: () => {},
      featureFlag: () => undefined,
    };
  }
  return ctx;
}
