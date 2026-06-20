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
    <article>
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <time dateTime={post.date}>{post.date}</time>
          {post.tags.length > 0 && (
            <span className="flex gap-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs"
                >
                  {tag}
                </span>
              ))}
            </span>
          )}
        </div>
      </header>

      <ArticleBody content={post.content} />
    </article>
  );
}
