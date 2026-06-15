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
              "media-src 'self' data: blob: mediastream:; " +
              "worker-src 'self' blob:; " +
              "child-src 'self' blob:; " +
              "connect-src 'self' https: wss://*.supabase.co wss://mkwvfhxymjttmvmavfiy.supabase.co wss://*.livekit.cloud wss://*.production.livekit.cloud; " +
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
