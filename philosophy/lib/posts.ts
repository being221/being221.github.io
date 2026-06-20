import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
}

export interface PostWithContent extends Post {
  content: string;
}

const postsDirectory = path.join(process.cwd(), "content/posts");

function parseDate(dateInput: string | Date): string {
  // gray-matter 可能将 YAML 日期解析为 Date 对象
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput.toISOString().split("T")[0];
  }
  const dateStr = String(dateInput);
  // 统一日期格式：中文日期 → ISO 日期字符串
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // 中文格式 "2024年1月15日" → "2024-01-15"
  const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  }
  return dateStr;
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((name) => name.endsWith(".mdx") || name.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: data.date ? parseDate(data.date) : "1970-01-01",
        description: data.description || "",
        tags: data.tags || [],
      } as Post;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return posts;
}

export function getPostBySlug(slug: string): PostWithContent | null {
  // 尝试 .mdx 和 .md 两种扩展名
  for (const ext of [".mdx", ".md"]) {
    const fullPath = path.join(postsDirectory, `${slug}${ext}`);
    if (fs.existsSync(fullPath)) {
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: data.date ? parseDate(data.date) : "1970-01-01",
        description: data.description || "",
        tags: data.tags || [],
        content,
      };
    }
  }

  return null;
}
