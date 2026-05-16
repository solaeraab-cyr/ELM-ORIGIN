import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // Capture 10% of transactions in production, 100% locally
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Capture 10% of sessions for replay in production
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Don't surface Sentry errors to the console in production
    debug: process.env.NODE_ENV === 'development',
  });
}
