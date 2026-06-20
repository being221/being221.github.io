import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "哲学 IDE — 用程序员的语言读哲学",
  description: "用框架、API、设计模式拆解哲学概念。写给想理解哲学的程序员。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-16 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
