"use client";

import { useEffect, useState } from "react";
import { getTags } from "@/lib/storage";
import type { Tag } from "@/types";
import { cn } from "@/lib/utils";

export function TagFilter() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActiveTag(params.get("tag") || "");
    setTags(getTags());
  }, []);

  const handleClick = (tag: string) => {
    const url = new URL(window.location.href);
    if (activeTag === tag) {
      url.searchParams.delete("tag");
    } else {
      url.searchParams.set("tag", tag);
    }
    url.searchParams.delete("q");
    window.location.href = url.toString();
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex gap-1.5 mb-6 flex-wrap">
      {activeTag && (
        <button onClick={() => { window.location.href = window.location.pathname; }}
          className="px-2 py-0.5 text-xs rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30">
          &times; 清除
        </button>
      )}
      {tags.map((tag) => (
        <button key={tag.id} onClick={() => handleClick(tag.name)}
          className={cn("px-2.5 py-0.5 text-xs rounded-full transition-colors",
            activeTag === tag.name ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
          )}>
          {tag.name}
        </button>
      ))}
    </div>
  );
}
