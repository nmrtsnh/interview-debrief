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
    "Turn messy post-interview voice notes into a scorecard, rubric analysis, and hiring decision pack using a three-agent workflow.",
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
