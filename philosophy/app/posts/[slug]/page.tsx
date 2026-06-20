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
      {/* 文章头部 */}
      <header className="mb-10">
        <time
          dateTime={post.date}
          className="text-xs font-mono text-text-dim/50 mb-4 block"
        >
          {post.date}
        </time>

        <h1 className="text-xl font-bold leading-snug mb-4 tracking-tight">
          {post.title}
        </h1>

        {post.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-xs font-mono bg-surface text-text-dim/60"
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

      {/* 文末 */}
      <div className="mt-14 pt-6 border-t border-border/50">
        <p className="text-xs font-mono text-text-dim/30">
          {/* end of {slug}.mdx */}
        </p>
      </div>
    </article>
  );
}
