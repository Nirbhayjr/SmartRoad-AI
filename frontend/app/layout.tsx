import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartRoad AI - Pothole Detection System",
  description: "AI-powered pothole detection and road damage assessment platform. Detect, report, and fix road hazards with advanced computer vision technology.",
  keywords: "pothole detection, road damage, AI, computer vision, infrastructure",
  authors: [{ name: "SmartRoad Team" }],
  openGraph: {
    title: "SmartRoad AI",
    description: "Intelligent pothole detection system for safer roads",
    type: "website",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>
          <Navbar />
        </main>
        {children}
      </body>
    </html>
  );
}