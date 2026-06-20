import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-surface/40 backdrop-blur-sm sticky top-0 z-10">
      {/* IDE 风格的文件标签栏 */}
      <div className="max-w-3xl mx-auto px-4 flex items-end">
        {/* 活动标签 */}
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-3 text-sm font-mono border-t border-x border-border rounded-t-lg bg-bg -mb-px relative"
        >
          <span className="text-keyword">📄</span>
          <span className="text-text">articles.tsx</span>
        </Link>
        {/* 非活动标签 */}
        <a
          href="https://being221.github.io"
          className="flex items-center gap-2 px-5 py-3 text-sm font-mono border border-transparent text-text-dim hover:text-text transition-colors"
        >
          <span className="opacity-50">📄</span>
          <span>about.md</span>
        </a>
        <div className="flex-1 border-b border-border" />
      </div>
    </header>
  );
}
