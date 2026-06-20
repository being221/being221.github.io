import ReactMarkdown from "react-markdown";

export function ArticleBody({ content }: { content: string }) {
  return <ReactMarkdown>{content}</ReactMarkdown>;
}
