import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold hover:opacity-80 transition-opacity"
        >
          哲学 IDE
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            文章
          </Link>
          <a
            href="https://being221.github.io"
            className="hover:text-foreground transition-colors"
          >
            关于
          </a>
        </nav>
      </div>
    </header>
  );
}
