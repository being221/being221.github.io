import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-14">
        <h1 className="text-xl font-bold text-text mb-3 tracking-tight">
          用程序员的语言读哲学
        </h1>
        <p className="text-sm text-text-muted leading-relaxed max-w-md">
          把斯多葛的控制二分法写成 try-catch，把佛教无常解释成 componentWillUnmount。写给每一个在代码里寻找秩序的人。
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm font-mono text-text-muted/40">文章还在路上</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
