import Link from "next/link";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block p-5 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors"
    >
      <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
      <p className="text-sm text-muted-foreground mb-2">{post.description}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <time dateTime={post.date}>{post.date}</time>
        {post.tags.length > 0 && (
          <span className="flex gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </span>
        )}
      </div>
    </Link>
  );
}
