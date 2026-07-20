import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InterviewDebrief — Finish the debrief before the next meeting",
  description:
    "Three specialised analysis stages turn post-interview voice notes into an evidence-backed scorecard, quality flags, and draft messages. Built with Cursor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full overflow-x-hidden bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
