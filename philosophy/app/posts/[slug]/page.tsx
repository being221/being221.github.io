import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { ArticleBody } from "@/components/ArticleBody";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-2xl mx-auto">
      {/* 回到首页 */}
      <div className="mb-8">
        <a
          href="/philosophy/"
          className="text-xs font-mono text-text-muted/50 hover:text-accent transition-colors"
        >
          ← 文章列表
        </a>
      </div>

      {/* 文章头部 */}
      <header className="mb-12">
        <time dateTime={post.date} className="text-xs font-mono text-text-muted/60 block mb-6">
          {post.date}
        </time>

        <h1 className="text-3xl font-bold text-text leading-tight mb-5 tracking-tight">
          {post.title}
        </h1>

        {post.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md text-xs font-mono text-text-muted bg-surface border border-border/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 正文 */}
      <div className="prose">
        <ArticleBody content={post.content} />
      </div>

      {/* 文末分隔 */}
      <div className="mt-20 pt-6 border-t border-border/40">
        <p className="text-xs font-mono text-text-muted/30 text-center">
          — end —
        </p>
      </div>
    </article>
  );
}
