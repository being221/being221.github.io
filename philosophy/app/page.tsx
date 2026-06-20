import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero — 像一本好书的翻开第一页 */}
      <div className="mb-16 mt-8">
        <p className="text-xs font-mono text-accent tracking-[0.25em] uppercase mb-6">
          哲学 × 代码
        </p>

        <h1 className="text-3xl font-bold text-text leading-tight mb-5 tracking-tight">
          用程序员<br />的语言读哲学
        </h1>

        <p className="text-[0.95rem] text-text-muted leading-relaxed max-w-lg">
          斯多葛的控制二分法是 try-catch，佛教的诸行无常是 componentWillUnmount。
          写给每一个在逻辑与意义之间往返的人。
        </p>
      </div>

      {/* 文章区标题 */}
      <div className="mb-8">
        <h2 className="text-xs font-mono text-text-muted/50 tracking-[0.2em] uppercase">
          文章
        </h2>
      </div>

      {/* 文章列表 */}
      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm font-mono text-text-muted/40">文章正在路上</p>
          <p className="text-xs text-text-muted/30 mt-2">第一篇很快上线</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border/40">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
