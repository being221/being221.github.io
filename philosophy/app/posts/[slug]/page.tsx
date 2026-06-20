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
      <header className="mb-10">
        <time dateTime={post.date} className="text-xs font-mono text-text-muted/60 block mb-5">
          {post.date}
        </time>

        <h1 className="text-2xl font-bold text-text leading-snug mb-4 tracking-tight">
          {post.title}
        </h1>

        {post.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md text-xs font-mono bg-surface-raised text-text-muted border border-border/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose">
        <ArticleBody content={post.content} />
      </div>

      <div className="mt-16 pt-6 border-t border-border/50" />
    </article>
  );
}
