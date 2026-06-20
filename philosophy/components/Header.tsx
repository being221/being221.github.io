import Link from "next/link";

export function Header() {
  return (
    <header className="max-w-2xl mx-auto px-4 py-8 flex items-center justify-between">
      <Link
        href="/"
        className="text-sm font-mono tracking-wider text-text-dim hover:text-accent transition-colors"
      >
        哲学 IDE
      </Link>
      <nav className="flex items-center gap-5 text-sm font-mono text-text-dim">
        <Link href="/" className="hover:text-text transition-colors">
          文章
        </Link>
        <a
          href="https://being221.github.io"
          className="hover:text-text transition-colors"
        >
          关于
        </a>
      </nav>
    </header>
  );
}
