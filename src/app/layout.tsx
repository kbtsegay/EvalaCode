import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EvalaCode - Browser-Based Python Editor",
  description: "Master Python coding with AI-generated problems, live in-browser execution, and instant feedback. No setup required.",
  keywords: ["python", "coding", "practice", "leetcode", "editor", "browser", "wasm"],
  authors: [{ name: "Kaleb Tsegay" }],
  openGraph: {
    title: "EvalaCode - Browser-Based Python Editor",
    description: "Master Python coding with AI-generated problems, live in-browser execution, and instant feedback.",
    url: "https://evalacode.com",
    siteName: "EvalaCode",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "EvalaCode - No setup. Just code.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EvalaCode - Browser-Based Python Editor",
    description: "Master Python coding with AI-generated problems, live in-browser execution, and instant feedback.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/favicon.svg",
  },
  themeColor: "#3b82f6",
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
        {children}
      </body>
    </html>
  );
}
