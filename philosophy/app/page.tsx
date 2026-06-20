import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div>
      {/* Hero — 终端风格标题 */}
      <div className="mb-12">
        <div className="flex items-center gap-1 text-sm font-mono text-comment mb-6">
          <span>{"/*"}</span>
          <span>用程序员的语言读哲学</span>
          <span>{"*/"}</span>
        </div>

        <h1 className="text-3xl font-bold font-mono mb-3 flex items-center gap-1">
          <span style={{ color: "var(--keyword)" }}>const</span>
          <span style={{ color: "var(--text)" }}>哲学IDE</span>
          <span style={{ color: "var(--keyword)" }}> = </span>
          <span style={{ color: "var(--string)" }}>&quot;用代码理解世界&quot;</span>
          <span style={{ color: "var(--text)" }}>;</span>
        </h1>

        <p className="text-text-dim text-sm leading-relaxed max-w-lg">
          把斯多葛的控制二分法写成 try-catch，
          把佛教无常解释成 componentWillUnmount。
          <br />
          写给每一个在代码里寻找秩序的人。
        </p>

        {/* 光标装饰 */}
        <div className="mt-5 flex items-center gap-2 text-sm font-mono text-text-dim">
          <span style={{ color: "var(--comment)" }}>{"// "}</span>
          <span>最近更新</span>
          <span className="cursor-blink text-accent">█</span>
        </div>
      </div>

      {/* 文章列表 */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-mono text-text-dim">
            <span style={{ color: "var(--comment)" }}>{"// "}</span>
            文章还在路上
          </p>
          <p className="text-sm mt-2 text-text-dim/50">
            第一篇正在写，很快上线
          </p>
        </div>
      ) : (
        <div>
          {/* 文件列表头部 */}
          <div className="flex items-center gap-2 text-xs font-mono text-text-dim mb-3 pb-2 border-b border-border/50">
            <span className="w-6 text-center">#</span>
            <span className="flex-1">文件</span>
            <span>日期</span>
            <span className="w-24 text-right">标签</span>
          </div>
          <div className="flex flex-col gap-3">
            {posts.map((post, i) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
