import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '资产仪表盘',
  description: '个人资产仪表盘 — 记账与资产管理',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
