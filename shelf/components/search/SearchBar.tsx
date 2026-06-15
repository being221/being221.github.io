"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (value.trim()) {
      url.searchParams.set("q", value.trim());
    } else {
      url.searchParams.delete("q");
    }
    window.location.href = url.toString();
  };

  const clear = () => {
    setValue("");
    window.location.href = window.location.pathname;
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索收藏和笔记..."
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-8 py-2 text-sm focus:outline-none focus:border-zinc-600 text-zinc-200"
      />
      {value && (
        <button type="button" onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
