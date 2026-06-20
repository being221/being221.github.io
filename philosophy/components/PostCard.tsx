import Link from "next/link";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.slug}`} className="block card-hover -mx-4 px-4 py-5 rounded-lg">
      <article>
        {/* 元数据：日期 + 标签 — 轻量小字 */}
        <div className="flex items-center gap-2 text-xs font-mono text-text-muted/60 mb-2">
          <time dateTime={post.date}>{post.date}</time>
          {post.tags.length > 0 && (
            <>
              <span aria-hidden="true">—</span>
              <span>{post.tags.join(" · ")}</span>
            </>
          )}
        </div>

        {/* 标题 — 主角 */}
        <h2 className="text-lg font-bold text-text group-hover:text-accent transition-colors duration-200 mb-2 tracking-tight">
          {post.title}
        </h2>

        {/* 描述 — 诱饵 */}
        <p className="text-[0.95rem] text-text-muted leading-relaxed">
          {post.description}
        </p>
      </article>
    </Link>
  );
}
