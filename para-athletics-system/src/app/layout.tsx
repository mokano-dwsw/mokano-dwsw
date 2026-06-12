import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "パラ陸上サポートシステム",
  description: "アスリートの状態・スケジュール・経費を一元管理する統合ポータル",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "パラ陸上", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <header className="border-b">
          <nav className="mx-auto flex w-full max-w-2xl items-center gap-4 px-4 py-3">
            <Link href="/" className="font-semibold">
              パラ陸上サポート
            </Link>
            <Link href="/checkin" className="text-sm text-gray-600 hover:text-gray-900">
              チェックイン
            </Link>
            <Link href="/training" className="text-sm text-gray-600 hover:text-gray-900">
              トレーニング
            </Link>
            <Link href="/schedule" className="text-sm text-gray-600 hover:text-gray-900">
              スケジュール
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              ダッシュボード
            </Link>
          </nav>
        </header>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
