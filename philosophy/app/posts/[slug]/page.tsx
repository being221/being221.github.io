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
      {/* 文章头部 — 代码编辑器文件头风格 */}
      <header className="mb-10">
        {/* 路径面包屑 */}
        <div className="flex items-center gap-1 text-xs font-mono text-text-dim mb-4">
          <span style={{ color: "var(--keyword)" }}>philosophy</span>
          <span>/</span>
          <span style={{ color: "var(--keyword)" }}>content</span>
          <span>/</span>
          <span style={{ color: "var(--keyword)" }}>posts</span>
          <span>/</span>
          <span style={{ color: "var(--accent)" }}>{slug}.mdx</span>
        </div>

        {/* 标题 */}
        <h1 className="text-3xl font-bold font-mono mb-3 text-function">
          {post.title}
        </h1>

        {/* 元数据 — 注释风格 */}
        <div className="flex items-center gap-3 text-sm font-mono">
          <time dateTime={post.date} style={{ color: "var(--comment)" }}>
            {"// "}{post.date}
          </time>
          {post.tags.length > 0 && (
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
                  @{tag}
                </span>
              ))}
            </span>
          )}
        </div>
      </header>

      {/* 文章正文包裹在行号容器中 */}
      <div className="line-numbers">
        <ArticleBody content={post.content} />
      </div>

      {/* 文末装饰 */}
      <div className="mt-12 pt-6 border-t border-border/50">
        <p className="text-xs font-mono text-text-dim">
          <span style={{ color: "var(--comment)" }}>{"/* end of "}{slug}.mdx{" */"}</span>
        </p>
      </div>
    </article>
  );
}
