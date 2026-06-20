export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between text-xs font-mono">
        {/* 左侧：状态信息 */}
        <div className="flex items-center gap-4 text-text-dim">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-comment" />
            <span>master</span>
          </span>
          <span>UTF-8</span>
          <span>哲学 IDE v0.1</span>
        </div>
        {/* 右侧：链接 */}
        <div className="flex items-center gap-3">
          <span className="text-text-dim">
            Ln 1, Col 1
          </span>
          <span className="text-text-dim">|</span>
          <a
            href="https://github.com/being221"
            className="text-keyword hover:text-accent transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
