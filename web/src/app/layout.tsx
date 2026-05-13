import type { Metadata } from "next";
import { Fraunces, Figtree, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { GateProvider } from "@/components/gate/GateContext";
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

export const metadata: Metadata = {
  title: "Elm Origin — Learn. Connect. Evolve.",
  description: "Your premium study workspace. Study rooms, AI mentoring, peer interviews, and expert mentors — all in one place.",
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
        <GateProvider>{children}</GateProvider>
      </body>
    </html>
  );
}
