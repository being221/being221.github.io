import Link from "next/link";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block"
    >
      <article className="flex items-baseline gap-4 py-3">
        {/* 日期——mono 小字 */}
        <time
          dateTime={post.date}
          className="text-xs font-mono text-text-dim/50 shrink-0 w-24 text-right select-none"
        >
          {post.date}
        </time>

        {/* 圆点 + 竖线 */}
        <div className="shrink-0 flex flex-col items-center self-stretch pt-1.5">
          <span className="w-2 h-2 rounded-full bg-border group-hover:bg-accent transition-colors duration-200" />
          <span className="w-px flex-1 bg-border/50 mt-1" />
        </div>

        {/* 标题 + 描述 */}
        <div className="pb-3">
          <h2 className="text-base font-semibold group-hover:text-accent transition-colors duration-200 mb-0.5">
            {post.title}
          </h2>
          <p className="text-sm text-text-dim/60 line-clamp-1">
            {post.description}
          </p>
        </div>
      </article>
    </Link>
  );
}
