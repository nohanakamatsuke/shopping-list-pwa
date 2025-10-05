import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap'
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap'
});

export const metadata: Metadata = {
  title: "買い物リストアプリ",
  description: "買い物リストモバイルアプリ",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* PWAメタデータ */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="ショッピングリスト" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ショッピングリスト" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#ef4444" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#ef4444" />
        
        {/* アイコン */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icon-96x96.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="48x48" href="/icon-48x48.png" />
        
        {/* スプラッシュスクリーン用 */}
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1 flex items-start justify-center pt-24">
          {children}
        </main>
      </body>
    </html>
  );
}

