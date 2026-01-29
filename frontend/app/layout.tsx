import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Providers from "../providers";
import { ThemeProvider } from "next-themes";
import { CommandMenu } from "@/components/CommandMenu";
import { LibraryDrawer } from "@/components/LibraryDrawer";
import { MarketHeartbeatProvider } from "@/components/ui/MarketHeartbeatProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuantDash",
  description: "Advanced Financial Intelligence Terminal",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <Providers>
            <SettingsProvider>
              <MarketHeartbeatProvider>
                <ErrorBoundary>
                  {children}
                  <CommandMenu />
                  <LibraryDrawer />
                  <Analytics />
                </ErrorBoundary>
              </MarketHeartbeatProvider>
            </SettingsProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
