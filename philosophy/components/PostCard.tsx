import Link from "next/link";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block -mx-3 px-3 py-4 rounded-lg hover:bg-accent-glow transition-colors duration-200"
    >
      <article>
        <h2 className="text-base font-semibold text-text group-hover:text-accent transition-colors duration-200 mb-1">
          {post.title}
        </h2>

        <p className="text-sm text-text-muted mb-3 leading-relaxed">
          {post.description}
        </p>

        <div className="flex items-center gap-3 text-xs font-mono text-text-muted/60">
          <time dateTime={post.date}>{post.date}</time>
          {post.tags.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="flex gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </span>
            </>
          )}
        </div>
      </article>
    </Link>
  );
}
