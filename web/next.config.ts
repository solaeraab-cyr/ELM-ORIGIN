import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel.com vercel.live; " +
              "style-src 'self' 'unsafe-inline' *.vercel.com *.gstatic.com; " +
              "font-src 'self' *.vercel.com *.gstatic.com *.public.blob.vercel-storage.com data:; " +
              "img-src 'self' data: https:; " +
              "connect-src 'self' https:; " +
              "frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // Skip source-map upload when DSN is not configured (no auth token available)
  sourcemaps: {
    disable: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
});
