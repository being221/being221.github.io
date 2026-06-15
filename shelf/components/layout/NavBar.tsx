"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, FileText, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpDialog } from "./HelpDialog";

const navItems = [
  { href: "/", label: "收藏", icon: Bookmark },
  { href: "/notes", label: "笔记", icon: FileText },
];

export function NavBar() {
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <span className="text-blue-400">📦</span>
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
          </div>
        </div>
      </nav>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
