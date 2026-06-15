"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getTags } from "@/app/actions/tags";
import { useEffect, useState } from "react";
import type { Tag } from "@/types";
import { cn } from "@/lib/utils";

export function TagFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    getTags().then(setTags);
  }, []);

  const handleClick = (tag: string) => {
    if (activeTag === tag) {
      router.push("/");
    } else {
      router.push(`/?tag=${encodeURIComponent(tag)}`);
    }
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex gap-1.5 mb-6 flex-wrap">
      {activeTag && (
        <button
          onClick={() => router.push("/")}
          className="px-2 py-0.5 text-xs rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30"
        >
          &times; 清除
        </button>
      )}
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => handleClick(tag.name)}
          className={cn(
            "px-2.5 py-0.5 text-xs rounded-full transition-colors",
            activeTag === tag.name
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
          )}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
