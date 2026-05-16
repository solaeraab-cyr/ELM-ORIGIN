'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, capturePageView, captureEvent } from '@/lib/posthog';

function PostHogPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    const path = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    if (path === prevPath.current) return;
    prevPath.current = path;

    capturePageView(path);

    // Emit named events for key auth pages
    if (pathname === '/login') captureEvent('view_login_page');
    if (pathname === '/signup') captureEvent('view_signup_page');
  }, [pathname, searchParams]);

  return null;
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Only render tracker if key is configured; avoids any posthog overhead otherwise
  const hasKey = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

  return (
    <>
      {hasKey && (
        // Suspense required because useSearchParams needs it outside a Suspense boundary
        <PostHogPageTrackerWrapper />
      )}
      {children}
    </>
  );
}

function PostHogPageTrackerWrapper() {
  return (
    <Suspense fallback={null}>
      <PostHogPageTracker />
    </Suspense>
  );
}

// Inline Suspense import to keep this file self-contained
import { Suspense } from 'react';
