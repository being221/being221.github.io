"use client";

import { useState, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { addLink } from "@/lib/storage";

export function LinkForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    addLink({ url: url.trim(), tags: tagList });
    setUrl("");
    setTags("");
    setLoading(false);
    setOpen(false);
    onAdded();
  };

  return (
    <div className="mb-8">
      {!open ? (
        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="flex items-center gap-2 px-4 py-3 w-full border-2 border-dashed border-zinc-700 rounded-lg text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加新链接...</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="粘贴 URL，自动抓取标题和摘要..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-zinc-200"
            required
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签（逗号分隔，如：前端, Next.js）"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-zinc-200"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded-md">
              取消
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-md text-white font-medium">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              收藏
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
