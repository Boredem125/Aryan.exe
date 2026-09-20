import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aryan-exe.vercel.app"),
  title: {
    default: "ARYAN.EXE",
    template: "%s — ARYAN.EXE",
  },
  description:
    "Aryan Hundia — Computer & Information Security, VIT Vellore. AI security, GRC, and hardware-security research. The information exists. Your job is to find it.",
  openGraph: {
    title: "ARYAN.EXE",
    description:
      "Some portfolios tell you who someone is. This one makes you find out.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
