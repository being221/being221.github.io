import { LinkCard } from "./LinkCard";
import type { Link } from "@/types";

interface LinkGridProps {
  links: Link[];
}

export function LinkGrid({ links }: LinkGridProps) {
  if (links.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <p className="text-4xl mb-4">📭</p>
        <p>还没有收藏任何链接</p>
        <p className="text-sm mt-1">粘贴一个 URL 开始吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  );
}
