import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { LearnerProgressProvider } from "@/lib/progress-provider";
import "./globals.css";

/**
 * Two type roles, deliberately paired (README section 5):
 *   Inter          — the entire interface. Hierarchy from weight/size/tracking.
 *   IBM Plex Mono  — numbers only. Never prose.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dialysis Academy",
    template: "%s · Dialysis Academy",
  },
  description:
    "Interactive video lessons and clinical knowledge checks for dialysis care professionals.",
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh bg-surface text-ink antialiased">
        <a
          href="#main"
          className="sr-focusable rounded-control bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Skip to main content
        </a>
        <LearnerProgressProvider>{children}</LearnerProgressProvider>
      </body>
    </html>
  );
}
