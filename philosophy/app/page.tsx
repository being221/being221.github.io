import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">哲学 IDE</h1>
        <p className="text-muted-foreground">
          用框架、API、设计模式拆解哲学概念。
          <br />
          写给想理解哲学的程序员。
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">文章还在路上</p>
          <p className="text-sm mt-2">第一篇正在写，很快上线</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
