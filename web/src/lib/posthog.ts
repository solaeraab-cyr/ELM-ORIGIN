import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false, // we fire these manually on route change
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    autocapture: false,
    loaded(ph) {
      if (process.env.NODE_ENV === 'development') ph.debug();
    },
  });

  initialized = true;
}

export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export function capturePageView(path: string) {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture('$pageview', { $current_url: window.location.origin + path });
}

export function identifyUser(id: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.identify(id, properties);
}

export function resetUser() {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.reset();
}

export default posthog;
