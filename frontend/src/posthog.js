/**
 * PostHog Analytics — singleton initialisation
 * ==============================================
 * Import `posthog` from this module everywhere you need to
 * capture events, identify users, or check feature flags.
 *
 *   import posthog from './posthog';
 *   posthog.capture('my_event', { key: 'value' });
 */
import posthogJs from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

if (POSTHOG_KEY) {
  posthogJs.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    /* Capture page-views automatically on route change             */
    capture_pageview: true,
    /* Capture page-leave metrics (scroll depth, time on page)       */
    capture_pageleave: true,
    /* Disable session recording until you opt-in on the dashboard   */
    disable_session_recording: true,
    /* Respect Do-Not-Track browser setting                          */
    respect_dnt: true,
    /* Load feature flags on init                                    */
    bootstrap: {},
    loaded: (ph) => {
      /* In development, log events to the console for debugging     */
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[PostHog] loaded — distinct_id:', ph.get_distinct_id());
      }
    },
  });
}

export default posthogJs;
