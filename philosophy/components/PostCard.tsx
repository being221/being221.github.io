import Link from "next/link";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block p-5 rounded-lg border border-border bg-surface/60 hover:bg-surface hover:border-keyword/30 transition-all duration-200"
    >
      {/* 文件名行 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-keyword text-sm">📄</span>
        <h2 className="text-base font-mono font-semibold text-text group-hover:text-accent transition-colors">
          {post.slug}.mdx
        </h2>
      </div>

      {/* 描述——像注释 */}
      <p className="text-sm mb-3 ml-6" style={{ color: "var(--comment)" }}>
        {"// "}{post.description}
      </p>

      {/* 元数据行——像 Git blame */}
      <div className="flex items-center gap-3 ml-6 text-xs font-mono text-text-dim">
        <time dateTime={post.date}>{post.date}</time>
        <span>·</span>
        <span className="flex gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-xs"
              style={{
                background: "rgba(86, 156, 214, 0.12)",
                color: "var(--keyword)",
              }}
            >
              {tag}
            </span>
          ))}
        </span>
      </div>
    </Link>
  );
}
