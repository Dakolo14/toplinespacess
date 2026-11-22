import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./dark.css";
import Nav from "@/components/Nav";
import { site } from "@/lib/content";
import { THEME_SCRIPT } from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: site.name,
  description: site.intro.blurb,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Dark by default; THEME_SCRIPT switches to the visitor's saved choice before first paint.
    <html lang="en" className={inter.variable} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
