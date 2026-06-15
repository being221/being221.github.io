"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Bookmark, FileText, HelpCircle, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpDialog } from "./HelpDialog";

const navItems = [
  { href: "/", label: "收藏", icon: Bookmark },
  { href: "/notes", label: "笔记", icon: FileText },
];

export function NavBar() {
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <span className="text-blue-400">&#x1F4E6;</span>
            <span>Shelf</span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname === href
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            <button
              onClick={() => setHelpOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors ml-2"
              aria-label="使用帮助"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">帮助</span>
            </button>

            {/* 认证状态 */}
            <div className="ml-3 pl-3 border-l border-zinc-800">
              {status === "loading" ? (
                <span className="text-xs text-zinc-600 px-2">...</span>
              ) : session ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 hidden sm:inline">
                    {session.user?.name || session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
                    title="退出登录"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn("github")}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">登录</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
