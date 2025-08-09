import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expert Agentic Platform | AI-Powered Multi-Domain Expertise",
  description: "Ask questions and get expert answers from specialized AI agents across Psychology, Economy, Finance, Architecture, Engineering, Design, Life Sciences, Mathematics, Physics, and Philosophy.",
  keywords: "AI agents, expert system, multi-domain AI, artificial intelligence platform, specialized AI assistants",
  authors: [{ name: "Expert Agentic Platform" }],
  openGraph: {
    title: "Expert Agentic Platform",
    description: "AI-Powered Multi-Domain Expertise Platform",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
