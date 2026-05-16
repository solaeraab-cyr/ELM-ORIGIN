import type { Metadata } from "next";
import { Fraunces, Figtree, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { GateProvider } from "@/components/gate/GateContext";
import PostHogProvider from "@/components/analytics/PostHogProvider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const BASE_URL = 'https://elmorigin.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ELM Origin — Learn. Connect. Grow.',
    template: '%s — ELM Origin',
  },
  description: 'AI-powered study environment with live rooms, mentors, and interview prep.',
  keywords: ['study rooms', 'peer interviews', 'AI tutor', 'mentors', 'education', 'ELM Origin'],
  authors: [{ name: 'ELM Origin' }],
  creator: 'ELM Origin',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'ELM Origin',
    title: 'ELM Origin — Learn. Connect. Grow.',
    description: 'AI-powered study environment with live rooms, mentors, and interview prep.',
    images: [
      {
        url: '/elm-origin-logo.png',
        width: 1200,
        height: 630,
        alt: 'ELM Origin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ELM Origin — Learn. Connect. Grow.',
    description: 'AI-powered study environment with live rooms, mentors, and interview prep.',
    images: ['/elm-origin-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${figtree.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <PostHogProvider>
          <GateProvider>{children}</GateProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
